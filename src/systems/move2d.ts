import * as engine from "../engine";
import * as components from "../components";

export type Registry = {
  speed: components.Speed2d;
  point: components.Point;
  clock: components.Clock;
};

export function move<R extends Registry>(): {
  system: engine.entity.System<
    R,
    { movable: "speed" | "point"; clock: "clock" }
  >;
} {
  return {
    system: {
      componentSelector: {
        movable: new Set(["speed", "point"]),
        clock: new Set(["clock"]),
      },
      run: (actions, entities) => {
        const [clock] = entities.byTag("clock");
        if (!clock) {
          return;
        }
        for (const movable of entities.byTag("movable")) {
          actions.set(movable, "point", {
            props: {
              x:
                movable.point.props.x +
                movable.speed.props.dxMs * clock.clock.props.deltaMs,
              y:
                movable.point.props.y +
                movable.speed.props.dyMs * clock.clock.props.deltaMs,
            },
          });
        }
      },
    },
  };
}
