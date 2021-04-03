import * as ecs from "../../src";

type Registry = {
  point: ecs.components.Point;
  speed: ecs.components.Speed2d;
  clock: ecs.components.Clock;
};

export function setup() {
  const mover = ecs.systems.move2d.move<Registry>();
  const engine = new ecs.engine.engine.Engine<Registry>([mover.system]);
  const clock = engine.addEntity({
    clock: { deltaMs: 0 },
  });
  for (let i = 0; i < 1000; i++) {
    engine.addEntity({
      point: { x: 0, y: 0 },
      speed: { dxMs: Math.random() - 0.5, dyMs: Math.random() - 0.5 },
    });
  }
  return { clock, engine };
}

