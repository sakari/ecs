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
  engine.addEntity({
    clock: { props: { deltaMs: 0 }}
  })
  engine.addEntity({
    point: {
      props: {
        x: 0, y: 0
      }
    },
    speed: {
      props: {
        dxMs: 10,
        dyMs: 10
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
        width: 100,
        height: 100,
        zoom: 1,
        tag: 'main'
      }
    }
  });
  return { svgDraw, engine };
}

function App() {
  const [state] = useState(createEngine());
  return (
    <div className="App">
      <ViewPort setContainer={state.svgDraw.setContainer}></ViewPort>
      <button onClick={() => state.engine.step()}>Step</button>
    </div>
  );
}

export default App;
