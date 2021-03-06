import * as entity from "../src/engine/entity";
import * as entitybag from "../src/engine/entity-bag";

interface Registry {
  position: entity.PositionComponent;
  rotation: entity.RotateComponent;
  some: entity.Component<{ some: number }>;
}

describe("EntityBag", () => {
  function givenABag() {
    return new entitybag.EntityBag<
      Registry,
      { pos: "position" | "rotation"; other: "some" },
      { pos: never; other: string }
    >({
      other: new Set(["some"]),
      pos: new Set(["position", "rotation"]),
    });
  }
  describe("state", () => {
    it("stores state for the entities in the bag", () => {
      const bag = givenABag();
      const someEntity = {
        id: "1" as entity.EntityId,
        some: { some: 1 },
      };
      bag.add(someEntity);
      bag.setState("other", someEntity, "state");
      expect(bag.getState("other", someEntity)).toEqual("state");
    });
  });
  describe("byId", () => {
    it("allows only existing tags", () => {
      const bag = givenABag();
      const someEntity = {
        id: "1" as entity.EntityId,
        some: { some: 1 },
      };
      bag.add(someEntity);
      expect(bag.byId("other", someEntity.id as any)).toEqual(someEntity);
    });
  });

  describe("byTag", () => {
    it("allows only existing tags", () => {
      const bag = givenABag();
      // ok
      bag.byTag("other");
      // @ts-expect-error missing tag
      bag.byTag("none");
    });

    it("provides narrow types for entities", () => {
      const bag = givenABag();
      const [e] = bag.byTag("other");
      expect(() => {
        // @ts-expect-error tag does not have the component
        e!.pos.x;
        // ok
        e!.some.some;
      }).toThrow();
    });

    it("returns entities with the tag", () => {
      const bag = givenABag();
      const someEntity = {
        id: "1" as entity.EntityId,
        some: { some: 1 },
      };
      const posEntity = {
        id: "2" as entity.EntityId,
        position: { x: 1 as entity.Pos, y: 1 as entity.Pos },
      };
      bag.add(someEntity);
      bag.add(posEntity);
      expect(bag.byTag("other")).toEqual([someEntity]);
    });

    it("does not return removed entities", () => {
      const bag = givenABag();
      bag.add({
        id: "1" as entity.EntityId,
        some: { some: 1 },
      });
      bag.add({
        id: "2" as entity.EntityId,
        some: { some: 1 },
      });
      bag.remove("1" as entity.EntityId);
      expect(bag.byTag("other")).toEqual([
        expect.objectContaining({ id: "2" }),
      ]);
    });
  });
});
