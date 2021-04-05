import * as ecs from "@sakari/ecs";

export type Registry = {
  mouseInteraction: ecs.components.MouseInteract;
  point: ecs.components.Point;
  mouse: ecs.components.Mouse;
};

export function drag<R extends Registry>(): {
  system: ecs.engine.entity.System<
    R,
    { item: "mouseInteraction" | "point", mouse: "mouse" }
    >;
} {
  return {
    system: {
      componentSelector: {
        item: new Set(["mouseInteraction" as const, "point" as const]),
        mouse: new Set(["mouse" as const])
      },
      run: (actions, entities) => {
        const [mouse] = entities.byTag('mouse');
        if (!mouse || !mouse.mouse.events) {
          return;
        }
        for (const item of entities.byTag("item")) {
          if (item.mouseInteraction.type === "press") {
            actions.set(item, "point", {
              x: mouse.mouse.events.x - item.mouseInteraction.x,
              y: mouse.mouse.events.y - item.mouseInteraction.y
            });
          }
        }
      },
    },
  };
}
