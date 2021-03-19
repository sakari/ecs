import * as engine from "../src/engine";
import * as entity from "../src/entity";

interface Registry {
  position: entity.PositionComponent;
  rotation: entity.RotateComponent;
}
const positionSystem: entity.System<
  Registry,
  { positioned: "position" | "rotation" }
> = {
  componentSelector: { positioned: new Set(["position", "rotation"]) },
  run: (_actions, _entities) => {
    console.log(_entities);
  }
};

describe("Engine", () => {
  it("gets constructed", () => {
    const e = new engine.Engine([positionSystem]);
    e.addEntity({
      position: { props: { x: 1 as entity.Pos, y: 2 as entity.Pos } },
      rotation: { props: { rotate: 3 as entity.Radian } },
    });
    e.run();
  });
});
