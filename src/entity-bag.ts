import * as entity from "./entity";

type Selector<T> = { [P in keyof T]: Set<T[P]> };

export class EntityBag<
  Registry,
  Tags extends { [tag: string]: keyof Registry }
> {
  private readonly entities: Record<
    string,
    Array<entity.EntityComponents<Registry, any>>
  >;

  constructor(private readonly tags: Selector<Tags>) {
    this.entities = Object.keys(tags).reduce(
      (memo, item) => ({ ...memo, [item]: [] }),
      {}
    );
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
      // todo: this is horribly inefficient
      this.entities[tag] = this.entities[tag]!.filter(
        (entity) => entity.id !== id
      );
    }
  }

  add(entity: entity.AnyEntityComponents<Registry, keyof Registry>) {
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
