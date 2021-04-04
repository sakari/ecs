import * as entity from "./entity";

type Selector<T> = { [P in keyof T]: Set<T[P]> };

export class EntityBag<
  Registry,
  Tags extends { [tag: string]: keyof Registry },
  State extends { [T in keyof Tags]: any } = never
> {
  private readonly states: { [T in keyof State]: Record<string, State[T]> };

  private readonly entities: Record<
    string,
    Array<entity.EntityComponents<Registry, any>>
  >;

  constructor(private readonly tags: Selector<Tags>) {
    this.states = Object.keys(tags).reduce(
      (memo, tag) => ({ ...memo, [tag]: {} }),
      {} as any
    );
    this.entities = Object.keys(tags).reduce(
      (memo, item) => ({ ...memo, [item]: [] }),
      {}
    );
  }

  setState<Tag extends keyof Tags>(
    tag: Tag,
    entity: entity.EntityComponents<Registry, any>,
    state: State[Tag]
  ) {
    // @ts-ignore
    this.states[tag][entity.id] = state;
  }

  getState<Tag extends keyof Tags>(
    tag: Tag,
    entity: entity.EntityComponents<Registry, any>
  ): State[Tag] | undefined {
    return this.states[tag][entity.id];
  }

  byId<Tag extends keyof Tags>(
    tag: Tag,
    id: entity.Reference<Registry, Tags[Tag]>
  ): entity.EntityComponents<Registry, Tags[Tag]> | undefined {
    const entities = this.entities[tag as any];
    if (!entities) {
      return;
    }
    return entities.find((e) => {
      return e.id === id;
    }) as any;
  }

  byTag<Tag extends keyof Tags>(
    tag: Tag
  ): readonly entity.EntityComponents<Registry, Tags[Tag]>[] {
    const entities = this.entities[tag as any];
    if (!entities) {
      return [];
    }
    return this.entities[tag as any] as any;
  }

  remove(id: entity.EntityId) {
    for (const tag in this.tags) {
      delete this.states[tag][id];
    }
    for (const tag in this.tags) {
      // todo: this is horribly inefficient
      this.entities[tag] = this.entities[tag]!.filter(
        (entity) => entity.id !== id
      );
    }
  }

  add<Components extends keyof Registry>(
    entity: entity.AnyEntityComponents<Registry, Components>
  ) {
    for (const tag in this.tags) {
      const components = Object.keys(entity);
      let skip = false;
      for (const component of this.tags[tag]) {
        if (components.indexOf(component as string) < 0) {
          skip = true;
          break;
        }
      }
      if (!skip) {
        this.entities[tag]!.push(entity as any);
      }
    }
  }
}
