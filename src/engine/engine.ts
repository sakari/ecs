import * as entity from "./entity";
import * as pool from "../pool";
import { Actions, AnyEntityComponents } from "./entity";
import { EntityBag } from "./entity-bag";

interface Sets<Registry> {
  entity: entity.EntityComponents<Registry, any>;
  component: keyof Registry;
  props: any;
}

class Step<Registry> {
  constructor(
    private setsPool: pool.Pool<Sets<Registry>>,
    private getEntityId: () => entity.EntityId
  ) {}
  created: Array<{
    id: entity.EntityId;
    components: { [P in keyof Registry]: Registry[P] };
  }> = [];
  removed: string[] = [];
  sets: Array<Sets<Registry>> = [];
  removedComponents: Array<{
    entity: entity.EntityComponents<Registry, any>;
    component: keyof Registry;
  }> = [];
  addedComponents: Array<{
    entity: entity.EntityComponents<Registry, any>;
    component: keyof Registry;
    props: any;
  }> = [];

  actions: Actions<Registry> = {
    addComponent: (entity, component, props) => {
      this.addedComponents.push({ entity, component, props });
    },
    removeComponent: (entity, component) => {
      this.removedComponents.push({ entity, component });
    },
    set: (entity, component, props) => {
      const set = this.setsPool.get();
      set.entity = entity;
      set.component = component;
      set.props = props;
      this.sets.push(set);
    },
    removeEntity: (id) => {
      this.removed.push(id);
    },
    createEntity: (components) => {
      const id = this.getEntityId();
      this.created.push({ id, components });
      return id;
    },
  };
}

export class Engine<Registry> {
  private nextId = 0;
  private setsPool: pool.Pool<Sets<Registry>> = pool.pool(() => ({} as any));
  private stepState = new Step(this.setsPool, () => this.getEntityId());

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

  addEntity<Components extends keyof Registry>(
    components: { [P in Components]?: Registry[P] }
  ): entity.Reference<Registry, Components> {
    const id = this.getEntityId();
    const entity = { id, ...components };
    this.entities.set(id, entity);
    this.systems.forEach((system) => {
      system.entities.add<Components>(entity);
    });
    return id as any;
  }

  private getEntityId(): entity.EntityId {
    return ("" + this.nextId++) as any;
  }
  step() {
    this.systems.forEach((system) =>
      system.system.run(this.stepState.actions, system.entities)
    );
    let key: string | undefined;
    while ((key = this.stepState.removed.pop())) {
      this.entities.delete(key as entity.EntityId);
      this.systems.forEach((system) => {
        system.entities.remove(key as entity.EntityId);
      });
    }
    let created;
    while ((created = this.stepState.created.pop())) {
      const entity = { id: created.id, ...created.components } as any;
      this.entities.set(created.id, entity);
      this.systems.forEach((system) => {
        system.entities.add(entity);
      });
    }
    let added: any;
    while ((added = this.stepState.addedComponents.pop())) {
      if (added.entity[added.component]) {
        return;
      }
      added.entity[added.component] = added.props;
      this.systems.forEach((system) => {
        system.entities.add(added.entity);
      });
    }

    let removed: any;
    while ((removed = this.stepState.removedComponents.pop())) {
      if (!removed.entity[removed.component]) {
        return;
      }
      this.systems.forEach((system) => {
        system.entities.remove(removed.entity.id);
      });
      delete removed.entity[removed.component];
      this.systems.forEach((system) => {
        system.entities.add(removed.entity);
      });
    }

    let set: any;
    while ((set = this.stepState.sets.pop())) {
      this.set(set.entity.id, set.component, set.props);
      pool.free(set);
    }
  }
}
