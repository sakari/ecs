import React, { useState } from 'react';
import '../../App.css';
import * as ecs from '@sakari/ecs';
import ViewPort from '../../ViewPort';
import * as setup from '../setup';

type Registry = {
  circle: ecs.components.Circle2d;
  line: ecs.components.Line2d;
} & setup.Registry

function createCircle(x: number, y: number, radius: number) {
  return {
    point: {
      x, y
    },
    circle: {
      radius
    }
  }
}

function createEngine() {
  const canvasDraw = ecs.systems.canvasDraw.canvasDraw<Registry>({ events: (e) => {
      console.log(e);
    }
  });
  const engine = new ecs.engine.engine.Engine<Registry>([
    canvasDraw.system,
  ]);
  const { run } = setup.runner(engine);
  const start = engine.addEntity(createCircle(-50, 0, 30));
  const end = engine.addEntity(createCircle(50, 0, 30));
  engine.addEntity({
    line: {
      startMagnitude: 0, startRadian: 0,
      endMagnitude: 0, endRadian: 0,
      start, end
    }
  });
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

export default App;
