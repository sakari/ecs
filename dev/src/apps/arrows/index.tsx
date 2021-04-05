import React, { useState } from 'react';
import '../../App.css';
import * as ecs from '@sakari/ecs';
import ViewPort from '../../ViewPort';
import * as setup from '../setup';
import * as interact from '../movers/interact';

type Registry = {
  circle: ecs.components.Circle2d;
  line: ecs.components.Line2d;
  drawStyle: ecs.components.DrawStyle;
  mouse: ecs.components.Mouse;
  mouseInteraction: ecs.components.MouseInteract;
} & setup.Registry

function createCircle(x: number, y: number, radius: number) {
  return {
    point: {
      x, y
    },
    circle: {
      radius
    },
    drawStyle: {
      fillColor: "blue",
      lineWidth: 2,
      lineColor: "black"
    },
    mouseInteraction: {
      type: 'none' as const
    }
  }
}

function createEngine() {
  let mouseEvents: ecs.components.MouseEvent | null = null;
  let running = false;
  const canvasDraw = ecs.systems.canvasDraw.canvasDraw<Registry>({ events: (e) => {
      if (running) {
        mouseEvents = e;
      }
    }
  });
  const mouseInteraction = ecs.systems.mouseInteraction.mouseInteraction<Registry>();
  const interactor = interact.interact<Registry>();
  const engine = new ecs.engine.engine.Engine<Registry>([
    canvasDraw.system,
    mouseInteraction.system,
    interactor.system
  ]);
  const { run } = setup.runner(engine, {
    preStart: () => {
      running = true;
      mouseEvents = null;
    },
    postStop: () => {
      running = false;
    },
    preStep: () => {
      engine.set(mouse, "mouse", { events: mouseEvents });
      if (mouseEvents) {
        mouseEvents = { ...mouseEvents, press: false, release: false }
      }
    }
  });
  const mouse = engine.addEntity({ mouse: { events: null }})
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
