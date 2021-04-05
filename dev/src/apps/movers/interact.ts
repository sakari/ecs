import * as ecs from "@sakari/ecs";

export type Registry = {
  mouseInteraction: ecs.components.MouseInteract;
  drawStyle: ecs.components.DrawStyle;
};

export function interact<R extends Registry>(): {
  system: ecs.engine.entity.System<
    R,
    { item: "mouseInteraction" | "drawStyle" }
    >;
} {
  return {
    system: {
      componentSelector: {
        item: new Set(["mouseInteraction" as const, "drawStyle" as const])
      },
      run: (actions, entities) => {
        for (const item of entities.byTag("item")) {
          if (item.mouseInteraction.type === "hover") {
            if (item.drawStyle.fillColor !== 'blue') {
              actions.set(item, "drawStyle", { ...item.drawStyle, fillColor: "blue" });
            }
          } else if (item.mouseInteraction.type === "press") {
            actions.set(item, "drawStyle", { ...item.drawStyle, fillColor: "green" });
          } else if (item.mouseInteraction.type === "release") {
            actions.set(item, "drawStyle", { ...item.drawStyle, fillColor: "yellow" });
          } else if (item.drawStyle.fillColor !== "red") {
            actions.set(item, "drawStyle", { ...item.drawStyle, fillColor: "red" });
          }
        }
      },
    },
  };
}
