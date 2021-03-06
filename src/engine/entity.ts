import { EntityBag } from "./entity-bag";

export type EntityId = string & { _brand: "EntityId" };

export type Component<Props> = Props;

export type Reference<
  Registry,
  Components extends keyof Registry
> = EntityId & {
  _selectors: { [T in Components]: Registry[T] };
};

export type AnyEntityComponents<Registry, Components extends keyof Registry> = {
  id: EntityId;
} & { [P in Components]?: Registry[P] };

export type EntityComponents<Registry, Components extends keyof Registry> = {
  id: EntityId;
} & { [P in Components]: Registry[P] };

export interface Actions<Registry> {
  addComponent: <Component extends keyof Registry>(
    entity: EntityComponents<Registry, keyof Registry>,
    component: Component,
    props: Registry[Component]
  ) => void;
  removeComponent: <Component extends keyof Registry>(
    entity: EntityComponents<Registry, Component>,
    component: Component
  ) => void;
  set: <Component extends keyof Registry>(
    entity: EntityComponents<Registry, Component>,
    component: Component,
    props: Registry[Component]
  ) => void;
  removeEntity: (id: EntityId) => void;
  createEntity: (
    components: { [P in keyof Registry]: Registry[P] }
  ) => EntityId;
}
export type Tags<Components> = Record<string, Components>;

type ComponentSelector<T> = { [K in keyof T]: Set<T[K]> };

export interface System<
  Registry,
  T extends Tags<keyof Registry>,
  State extends { [A in keyof T]: any } = never
> {
  componentSelector: ComponentSelector<T>;
  run: (
    actions: Actions<Registry>,
    entities: EntityBag<Registry, T, State>
  ) => void;
}

export type Pos = number & { brand: "Position" };
export type PositionComponent = Component<{ x: Pos; y: Pos }>;
export type Radian = number & { brand: "Radian" };
export type RotateComponent = Component<{ rotate: Radian }>;
