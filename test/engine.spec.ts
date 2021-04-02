import * as engine from "../src/engine/engine";
import * as entity from "../src/engine/entity";

interface Registry {
  position: entity.PositionComponent;
}

type Tags = {
  positioned: "position";
};

function withSystem(
  run?: entity.System<Registry, Tags>["run"]
): entity.System<Registry, Tags> {
  return {
    componentSelector: { positioned: new Set(["position"]) },
    run: run || (() => {}),
  };
}

describe("Engine", () => {
  const clock: entity.Clock = { timeMs: Date.now(), deltaMs: 10 };

  describe("run", () => {
    it("allows deleting entities", () => {
      let deleted = false;
      const e = new engine.Engine([
        withSystem((clock, actions, entities) => {
          if (entities.byTag("positioned").length === 1) {
            actions.removeEntity(entities.byTag("positioned")[0]!.id);
            return;
          }
          deleted = true;
        }),
      ]);
      e.addEntity({
        position: { props: { x: 1 as entity.Pos, y: 2 as entity.Pos } },
      });
      e.step(clock);
      expect(deleted).toBeFalsy();
      e.step(clock);
      expect(deleted).toBeTruthy();
    });

    it("allows creating new entities", () => {
      let created: any;
      const e = new engine.Engine([
        withSystem((clock, actions, entities) => {
          if (entities.byTag("positioned").length === 0) {
            actions.createEntity({
              position: { props: { x: 2 as entity.Pos, y: 8 as entity.Pos } },
            });
            return;
          }
          [created] = entities.byTag("positioned");
        }),
      ]);
      e.step(clock);
      expect(created).toBeUndefined();
      e.step(clock);
      expect(created).toEqual(
        expect.objectContaining({ position: { props: { x: 2, y: 8 } } })
      );
    });

    it("calls the system with entities", () => {
      let entity: any;
      const e = new engine.Engine([
        withSystem((clock, actions, entities) => {
          [entity] = entities.byTag("positioned");
        }),
      ]);
      const id = e.addEntity({
        position: { props: { x: 1 as entity.Pos, y: 2 as entity.Pos } },
      });
      e.step(clock);
      expect(entity!.id).toEqual(id);
    });
  });
});
