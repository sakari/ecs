import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import * as ecs from '@sakari/ecs';
import ViewPort from './ViewPort';

type Registry = {
  camera: ecs.components.Camera;
  point: ecs.components.Point;
  speed: ecs.components.Speed2d;
  circle: ecs.components.Circle2d;
  clock: ecs.components.Clock;
}

function createEngine() {
  const svgDraw = ecs.systems.svgDraw.svgDraw<Registry>();
  const mover = ecs.systems.move2d.move<Registry>();
  const engine = new ecs.engine.engine.Engine<Registry>([svgDraw.system, mover.system]);
  const clock = engine.addEntity({
    clock: { props: { deltaMs: 0 }}
  })
  let start: undefined | number;

  function step(time: number) {
    const deltaMs = start === undefined ? 0 : time - start;
    start = time;
    console.log(deltaMs);
    engine.set(clock, 'clock', { props: { deltaMs }});
    engine.step();
    window.requestAnimationFrame(step);
  };
  engine.addEntity({
    point: {
      props: {
        x: 0, y: 0
      }
    },
    speed: {
      props: {
        dxMs: .01,
        dyMs: .01
      }
    },
    circle: {
      props: {
        radius: 20
      }
    }
  })
  engine.addEntity({
    point: {
      props: {
        x: 0, y: 0
      }
    },
    camera: {
      props: {
        width: 300,
        height: 300,
        zoom: 1,
        tag: 'main'
      }
    }
  });
  return { svgDraw, engine, run: () => { window.requestAnimationFrame(step) } };
}

function App() {
  const [state] = useState(createEngine());
  return (
    <div className="App">
      <button onClick={() => { window.requestAnimationFrame(state.run)}}>run</button>
      <ViewPort setContainer={state.svgDraw.setContainer}></ViewPort>
    </div>
  );
}

export default App;
