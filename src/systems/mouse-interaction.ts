import * as engine from "../engine";
import * as components from "../components";

export type Registry = {
  circle: components.Circle2d;
  point: components.Point;
  mouse: components.Mouse;
  mouseInteraction: components.MouseInteract;
};

export function mouseInteraction<R extends Registry>(): {
  system: engine.entity.System<
    R,
    {
      circle: "circle" | "point" | "mouseInteraction";
      mouse: "mouse";
    }
  >;
} {
  return {
    system: {
      componentSelector: {
        circle: new Set(["circle", "point", "mouseInteraction"]),
        mouse: new Set(["mouse"]),
      },
      run: (actions, entities) => {
        const circles = entities.byTag("circle");
        for (const mouse of entities.byTag("mouse")) {
          const lastEvent = mouse.mouse.events;
          for (const shape of circles) {
            if (!lastEvent) {
              continue;
            }
            if (shape.mouseInteraction.type === "press") {
              if (lastEvent.down === false) {
                actions.set(shape, "mouseInteraction", { type: "release" });
              }
              continue;
            }
            if (
              Math.sqrt(
                Math.pow(shape.point.x - lastEvent.x, 2) +
                  Math.pow(shape.point.y - lastEvent.y, 2)
              ) < shape.circle.radius
            ) {
              if (lastEvent.press) {
                actions.set(shape, "mouseInteraction", { type: "press" });
              } else {
                actions.set(shape, "mouseInteraction", { type: "hover" });
              }
              continue;
            }
            if (shape.mouseInteraction.type !== "none") {
              actions.set(shape, "mouseInteraction", { type: "none" });
            }
          }
        }
      },
    },
  };
}
