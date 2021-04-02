import * as engine from "../engine";
import * as components from "../components";

export type Registry = {
  speed: components.Speed2d;
  point: components.Point;
};

export function move<R extends Registry>(): {
  system: engine.entity.System<R, { movable: "speed" | "point" }>;
} {
  return {
    system: {
      componentSelector: { movable: new Set(["speed", "point"]) },
      run: (clock, actions, entities) => {
        for (const movable of entities.byTag("movable")) {
          actions.set(movable, "point", {
            props: {
              x:
                movable.point.props.x +
                movable.speed.props.dxMs * clock.deltaMs,
              y:
                movable.point.props.y +
                movable.speed.props.dyMs * clock.deltaMs,
            },
          });
        }
      },
    },
  };
}
