import { EntityBag } from "./entity-bag";

export type EntityId = string & { brand: "EntityId" };

export interface Component<Props> {
  props: Props;
}

export type AnyEntityComponents<Registry, Components extends keyof Registry> = {
  id: EntityId;
} & { [P in Components]?: Registry[P] };

export type EntityComponents<Registry, Components extends keyof Registry> = {
  id: EntityId;
} & { [P in Components]: Registry[P] };

export interface Actions<Registry> {
  removeEntity: (id: EntityId) => void;
  createEntity: (
    components: { [P in keyof Registry]: Registry[P] }
  ) => EntityId;
}
export type Tags<Components> = Record<string, Components>;

type ComponentSelector<T> = { [K in keyof T]: Set<T[K]> };

export interface System<Registry, T extends Tags<keyof Registry>> {
  componentSelector: ComponentSelector<T>;
  run: (actions: Actions<Registry>, entities: EntityBag<Registry, T>) => void;
}

export type Pos = number & { brand: "Position" };
export type PositionComponent = Component<{ x: Pos; y: Pos }>;
export type Radian = number & { brand: "Radian" };
export type RotateComponent = Component<{ rotate: Radian }>;
