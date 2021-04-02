import * as ecs from "@sakari/ecs";

export type Registry = {
  speed: ecs.components.Speed2d;
  clock: ecs.components.Clock;
};

export function flutter<R extends Registry>(): {
  system: ecs.engine.entity.System<
    R,
    { flutter: "speed"; clock: "clock" }
    >;
} {
  return {
    system: {
      componentSelector: {
        flutter: new Set(["speed" as const]),
        clock: new Set(["clock" as const]),
      },
      run: (actions, entities) => {
        const [clock] = entities.byTag("clock");
        if (!clock) {
          return;
        }
        for (const fluttering of entities.byTag("flutter")) {
          actions.set(fluttering, "speed", {
            props: {
              dxMs:
                fluttering.speed.props.dxMs +
                ((Math.random() - .5) * clock.clock.props.deltaMs) * .001,
              dyMs:
                fluttering.speed.props.dyMs +
                ((Math.random() - .5) * clock.clock.props.deltaMs) * .001,
            },
          });
        }
      },
    },
  };
}
