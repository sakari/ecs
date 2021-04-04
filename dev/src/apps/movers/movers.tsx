import React, { useState } from 'react';
import '../../App.css';
import * as ecs from '@sakari/ecs';
import ViewPort from '../../ViewPort';
import * as flutter from './flutter';
import * as setup from '../setup';

type Registry = {
  speed: ecs.components.Speed2d;
  circle: ecs.components.Circle2d;
  line: ecs.components.Line2d;
} & setup.Registry

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
  const { run } = setup.runner(engine);
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
  return { draw: canvasDraw, engine, run };
}

export function App() {
  const [state] = useState(createEngine());
  return (
    <div className="App">
      <button onClick={() => { window.requestAnimationFrame(state.run)}}>run</button>
      <ViewPort setContainer={state.draw.setContainer}></ViewPort>
    </div>
  );
}
