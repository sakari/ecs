import React, { useState } from 'react';
import '../../App.css';
import * as ecs from '@sakari/ecs';
import ViewPort from '../../ViewPort';
import * as flutter from './flutter';
import * as interact from './interact';
import * as setup from '../setup';

type Registry = {
  speed: ecs.components.Speed2d;
  circle: ecs.components.Circle2d;
  drawStyle: ecs.components.DrawStyle;
  line: ecs.components.Line2d;
  mouse: ecs.components.Mouse;
  mouseInteraction: ecs.components.MouseInteract;
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
    drawStyle: {
      lineWidth: 2,
      lineColor: "black",
      fillColor: "red"
    },
    circle: {
      radius: 20
    },
    mouseInteraction: {
      type: 'none' as const,
      x: 0,
      y: 0
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
  const mover = ecs.systems.move2d.move<Registry>();
  const flutterer = flutter.flutter<Registry>();
  const interactor = interact.interact<Registry>();
  const mouseInteraction = ecs.systems.mouseInteraction.mouseInteraction<Registry>();
  const engine = new ecs.engine.engine.Engine<Registry>([
    flutterer.system,
    canvasDraw.system,
    mover.system,
    interactor.system,
    mouseInteraction.system
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
  for(let i = 0; i < 5_000; i++) {
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
