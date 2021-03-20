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
    components: { [P in keyof Registry]: Registry[P] }
  ): entity.EntityId {
    const id = this.createEntity(components);
    this.systems.forEach((system) => {
      system.entities.add({ id, ...components });
    });
    return id;
  }

  private createEntity(
    components: { [P in keyof Registry]: Registry[P] }
  ): entity.EntityId {
    // @ts-ignore
    const c: entity.EntityComponents<Registry, keyof Registry> = components;
    c.id = ("" + this.nextId++) as any;
    return c.id;
  }

  run() {
    const created: Array<{
      id: entity.EntityId;
      components: { [P in keyof Registry]: Registry[P] };
    }> = [];
    const removed: Record<string, true> = {};
    const actions: Actions<Registry> = {
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
      this.systems.forEach((system) => {
        system.entities.remove(key as entity.EntityId);
      });
    });
    created.forEach((key) => {
      this.systems.forEach((system) => {
        system.entities.add({ id: key.id, ...key.components });
      });
    });
  }
}
