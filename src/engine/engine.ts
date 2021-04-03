import * as entity from "./entity";
import * as pool from "../pool";
import { Actions, AnyEntityComponents } from "./entity";
import { EntityBag } from "./entity-bag";

interface Sets<Registry> {
  entity: entity.EntityComponents<Registry, any>;
  component: keyof Registry;
  props: any;
}

export class Engine<Registry> {
  private nextId = 0;
  private setsPool: pool.Pool<Sets<Registry>> = pool.pool(() => ({} as any))

  private readonly entities: Map<
    entity.EntityId,
    AnyEntityComponents<Registry, any>
  > = new Map();

  private readonly systems: Array<{
    entities: EntityBag<Registry, any>;
    system: entity.System<Registry, any>;
  }> = [];

  constructor(systems: Array<entity.System<Registry, any>>) {
    this.systems = systems.map((system) => ({
      system,
      entities: new EntityBag<Registry, any>(system.componentSelector),
    }));
  }

  set<Component extends keyof Registry>(
    entityId: entity.EntityId,
    component: Component,
    props: Registry[Component]
  ) {
    const entity = this.entities.get(entityId);
    if (entity && entity[component]) {
      Object.assign(entity[component], props);
    }
    pool.free(props);
  }

  addEntity(
    components: { [P in keyof Registry]?: Registry[P] }
  ): entity.EntityId {
    const id = this.createEntity(components);
    const entity = { id, ...components };
    this.entities.set(id, entity);
    this.systems.forEach((system) => {
      system.entities.add(entity);
    });
    return id;
  }

  private createEntity(
    components: { [P in keyof Registry]?: Registry[P] }
  ): entity.EntityId {
    // @ts-ignore
    const c: entity.EntityComponents<Registry, keyof Registry> = components;
    c.id = ("" + this.nextId++) as any;
    return c.id;
  }

  step() {
    const created: Array<{
      id: entity.EntityId;
      components: { [P in keyof Registry]: Registry[P] };
    }> = [];
    const removed: Record<string, true> = {};
    const sets: Array<Sets<Registry>> = [];
    const removedComponents: Array<{
      entity: entity.EntityComponents<Registry, any>;
      component: keyof Registry;
    }> = [];
    const addedComponents: Array<{
      entity: entity.EntityComponents<Registry, any>;
      component: keyof Registry;
      props: any;
    }> = [];
    const actions: Actions<Registry> = {
      addComponent: (entity, component, props) => {
        addedComponents.push({ entity, component, props });
      },
      removeComponent: (entity, component) => {
        removedComponents.push({ entity, component });
      },
      set: (entity, component, props) => {
        const set = this.setsPool.get();
        set.entity = entity;
        set.component = component;
        set.props = props;
        sets.push(set);
      },
      removeEntity: (id) => {
        removed[id] = true;
      },
      createEntity: (components) => {
        const id = this.createEntity(components as any);
        created.push({ id, components });
        return id;
      },
    };
    this.systems.forEach((system) =>
      system.system.run(actions, system.entities)
    );
    Object.keys(removed).forEach((key) => {
      this.entities.delete(key as entity.EntityId);
      this.systems.forEach((system) => {
        system.entities.remove(key as entity.EntityId);
      });
    });
    created.forEach((key) => {
      const entity = { id: key.id, ...key.components };
      this.entities.set(key.id, entity);
      this.systems.forEach((system) => {
        system.entities.add(entity);
      });
    });
    addedComponents.forEach((opts) => {
      if (opts.entity[opts.component]) {
        return;
      }
      opts.entity[opts.component] = opts.props;
      this.systems.forEach((system) => {
        system.entities.add(opts.entity);
      });
    });
    removedComponents.forEach((opts) => {
      if (!opts.entity[opts.component]) {
        return;
      }
      this.systems.forEach((system) => {
        system.entities.remove(opts.entity.id);
      });
      delete opts.entity[opts.component];
      this.systems.forEach((system) => {
        system.entities.add(opts.entity);
      });
    });
    sets.forEach((opts) => {
      this.set(opts.entity.id, opts.component, opts.props);
      pool.free(opts);
    });
  }
}
