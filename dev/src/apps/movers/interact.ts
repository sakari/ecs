import * as ecs from "@sakari/ecs";

export type Registry = {
  hover: ecs.components.MouseHover;
  drawStyle: ecs.components.DrawStyle;
};

export function interact<R extends Registry>(): {
  system: ecs.engine.entity.System<
    R,
    { item: "hover" | "drawStyle" }
    >;
} {
  return {
    system: {
      componentSelector: {
        item: new Set(["hover" as const, "drawStyle" as const])
      },
      run: (actions, entities) => {
        for (const item of entities.byTag("item")) {
          if (item.hover.hovering) {
            if (item.drawStyle.fillColor !== 'blue') {
              actions.set(item, "drawStyle", { ...item.drawStyle, fillColor: "blue" });
            }
          } else if (item.drawStyle.fillColor === "blue") {
            actions.set(item, "drawStyle", { ...item.drawStyle, fillColor: "red" });
          }
        }
      },
    },
  };
}
