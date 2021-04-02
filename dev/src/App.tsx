import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import * as ecs from '@sakari/ecs';
import ViewPort from './ViewPort';
import * as components from '../../dist/src/components';

type Registry = {
  camera: components.Camera;
  point: components.Point;
  speed: components.Speed2d;
}

function createEngine() {
  const svgDraw = ecs.systems.svgDraw.svgDraw<Registry>();
  const mover = ecs.systems.move2d.move<Registry>();
  const engine = new ecs.engine.engine.Engine<Registry>([svgDraw.system, mover.system]);
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
      <button onClick={() => state.engine.step({ timeMs: Date.now(), deltaMs: 10})}>Step</button>
    </div>
  );
}

export default App;
