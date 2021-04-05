import * as ecs from '@sakari/ecs';

export type Registry = {
  camera: ecs.components.Camera;
  point: ecs.components.Point;
  clock: ecs.components.Clock;
}

export function runner(engine: ecs.engine.engine.Engine<Registry>, opts?: {
  preStep: () => void;
  postStop: () => void;
  preStart: () => void;
}) {
  const clock = engine.addEntity({
    clock: { deltaMs: 0 }
  })
  let start: null | number = null;
  let running = false;

  function toggle() {
    if (running) {
      running = false;
      opts?.postStop();
    } else {
      running = true;
      start = null;
      opts?.preStart();
      window.requestAnimationFrame(step)
    }
  }

  function step(time: number) {
    const deltaMs = start === null ? 0 : time - start;
    start = time;
    engine.set(clock, 'clock', { deltaMs });
    opts?.preStep();
    engine.step();
    if (running) {
      window.requestAnimationFrame(step);
    }
  };
  return { run: toggle };
}
