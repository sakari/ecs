import * as engine from "../engine";
import * as components from "../components";

export type Registry = {
  circle: components.Circle2d;
  point: components.Point;
  mouse: components.Mouse;
  hover: components.MouseHover;
};

export function mouseInteraction<R extends Registry>(): {
  system: engine.entity.System<
    R,
    {
      circle: "circle" | "point" | "hover";
      mouse: "mouse";
    }
  >;
} {
  return {
    system: {
      componentSelector: {
        circle: new Set(["circle", "point", "hover"]),
        mouse: new Set(["mouse"]),
      },
      run: (actions, entities) => {
        const circles = entities.byTag("circle");
        for (const mouse of entities.byTag("mouse")) {
          for (const shape of circles) {
            const lastEvent = mouse.mouse.events;
            if (!lastEvent) {
              continue;
            }
            if (
              Math.sqrt(
                Math.pow(shape.point.x - lastEvent.x, 2) +
                  Math.pow(shape.point.y - lastEvent.y, 2)
              ) < shape.circle.radius
            ) {
              if (!shape.hover.hovering) {
                actions.set(shape, "hover", { hovering: true });
              }
            } else if (shape.hover.hovering) {
              actions.set(shape, "hover", { hovering: false });
            }
          }
        }
      },
    },
  };
}
