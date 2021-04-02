import * as entity from "./entity";
import { Actions } from "./entity";
import { EntityBag } from "./entity-bag";

export class Engine<Registry> {
  private nextId = 0;
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

  addEntity(
    components: { [P in keyof Registry]?: Registry[P] }
  ): entity.EntityId {
    const id = this.createEntity(components);
    this.systems.forEach((system) => {
      system.entities.add({ id, ...components });
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

  step(clock: entity.Clock) {
    const created: Array<{
      id: entity.EntityId;
      components: { [P in keyof Registry]: Registry[P] };
    }> = [];
    const removed: Record<string, true> = {};
    const sets: Array<{
      entity: entity.EntityComponents<Registry, any>;
      component: keyof Registry;
      props: any;
    }> = [];
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
        sets.push({ entity, component, props });
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
      system.system.run(clock, actions, system.entities)
    );
    Object.keys(removed).forEach((key) => {
      this.systems.forEach((system) => {
        system.entities.remove(key as entity.EntityId);
      });
    });
    created.forEach((key) => {
      this.systems.forEach((system) => {
        system.entities.add({ id: key.id, ...key.components });
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
      if (opts.entity[opts.component]) {
        opts.entity[opts.component] = opts.props;
      }
    });
  }
}
