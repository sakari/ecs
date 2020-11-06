type EntityId = string & { brand: "EntityId" };

export interface Component<Props, State> {
  props: Props;
  state: State;
}

type EntityComponents<Registry, Components extends keyof Registry> = {
  id: EntityId;
} & { [P in Components]: Registry[P] };

interface Actions<Registry> {
  removeEntity: (id: EntityId) => void;
  createEntity: () => EntityId;
  removeComponent: (id: EntityId, component: keyof Registry) => void;
  addComponent: <ComponentTag extends keyof Registry>(
    id: EntityId,
    tag: ComponentTag,
    component: Registry[ComponentTag]
  ) => void;
}

export interface System<
  Registry,
  Entities extends Record<string, keyof Registry>
> {
  componentSelector: Entities;
  run: (
    actions: Actions<Registry>,
    entities: { [K in keyof Entities]: EntityComponents<Registry, Entities[K]> }
  ) => void;
}

export class Engine<Registry> {
  private readonly entities: Array<EntityComponents<Registry, any>> = [];
  private readonly systems: Array<{
    entities: EntityComponents<Registry, any>;
    system: System<Registry, any>[];
  }> = [];
  run() {}
}

export type Pos = number & { brand: "Position" };
export type PositionComponent = Component<{ x: Pos; y: Pos }, void>;
export type Radian = number & { brand: "Radian" };
export type RotateComponent = Component<{ rotate: Radian }, void>;
