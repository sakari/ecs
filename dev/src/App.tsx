import React, { useState } from 'react';
import './App.css';
import * as ecs from '@sakari/ecs';
import ViewPort from './ViewPort';
import * as flutter from './flutter';

type Registry = {
  camera: ecs.components.Camera;
  point: ecs.components.Point;
  speed: ecs.components.Speed2d;
  circle: ecs.components.Circle2d;
  clock: ecs.components.Clock;
}

function createCircle() {
  return {
    point: {
      x: 0, y: 0
    },
    speed: {
      dxMs: (Math.random() - .5) * .01,
      dyMs: (Math.random()  -.5) * .01
    },
    circle: {
      radius: 20
    }
  }
}

function createEngine() {
  const svgDraw = ecs.systems.svgDraw.svgDraw<Registry>();
  const canvasDraw = ecs.systems.canvasDraw.canvasDraw<Registry>();
  const mover = ecs.systems.move2d.move<Registry>();
  const flutterer = flutter.flutter<Registry>();
  const engine = new ecs.engine.engine.Engine<Registry>([
    flutterer.system,
    canvasDraw.system,
    mover.system
  ]);
  const clock = engine.addEntity({
    clock: { deltaMs: 0 }
  })
  let start: null | number = null;
  let running = false;

  function toggle() {
    if (running) {
      running = false;
    } else {
      running = true;
      start = null;
      window.requestAnimationFrame(step)
    }
  }

  function step(time: number) {
    const deltaMs = start === null ? 0 : time - start;
    start = time;
    engine.set(clock, 'clock', { deltaMs });
    engine.step();
    if (running) {
      window.requestAnimationFrame(step);
    }
  };
  for(let i = 0; i < 10_000; i++) {
    engine.addEntity(createCircle());
  }
  engine.addEntity({
    point: {
      x: 0, y: 0
    },
    camera: {
      width: 1000,
      height: 1000,
      zoom: 1,
      tag: 'main'
    }
  });
  return { draw: canvasDraw, engine, run: toggle };
}

function App() {
  const [state] = useState(createEngine());
  return (
    <div className="App">
      <button onClick={() => { window.requestAnimationFrame(state.run)}}>run</button>
      <ViewPort setContainer={state.draw.setContainer}></ViewPort>
    </div>
  );
}

export default App;
