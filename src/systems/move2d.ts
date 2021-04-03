import * as engine from "../engine";
import * as pool from "../pool";
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
  const pointPool = pool.pool(() => ({ x: 0, y: 0 }));
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
          const setPoint = pointPool.get();
          setPoint.x =
            movable.point.x + movable.speed.dxMs * clock.clock.deltaMs;
          setPoint.y =
            movable.point.y + movable.speed.dyMs * clock.clock.deltaMs;
          actions.set(movable, "point", setPoint);
        }
      },
    },
  };
}
