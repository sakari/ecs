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
  const setPool = ecs.pool.pool<ecs.components.Speed2d>(() => ({} as any));
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
          const set = setPool.get();
          set.dxMs = fluttering.speed.dxMs +
            ((Math.random() - .5) * clock.clock.deltaMs) * .001;
          set.dyMs = fluttering.speed.dyMs +
            ((Math.random() - .5) * clock.clock.deltaMs) * .001;
          actions.set(fluttering, "speed", set);
        }
      },
    },
  };
}
