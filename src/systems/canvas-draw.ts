import * as engine from "../engine";
import * as components from "../components";

export type Registry = {
  camera: components.Camera;
  point: components.Point;
  circle: components.Circle2d;
};

type Release = () => void;
export type SetContainer = (tag: string, ref: HTMLElement) => Release;

export function canvasDraw<R extends Registry>(): {
  system: engine.entity.System<
    R,
    { camera: "camera" | "point"; circle: "circle" | "point" }
  >;
  setContainer: SetContainer;
} {
  const canvases: Record<string, HTMLCanvasElement> = {};
  return {
    setContainer: (tag, viewPort) => {
      const canvas = document.createElement("canvas");
      canvases[tag] = canvas;
      viewPort.innerHTML = "";
      viewPort.appendChild(canvas);
      return () => {
        delete canvases[tag];
        viewPort.innerHTML = "";
      };
    },
    system: {
      componentSelector: {
        camera: new Set(["camera", "point"]),
        circle: new Set(["circle", "point"]),
      },
      run: (_actions, entities) => {
        const [camera] = entities.byTag("camera");
        if (!camera) {
          return;
        }
        const canvas = canvases[camera.camera.tag];
        if (!canvas) {
          return;
        }
        canvas.setAttribute("width", "" + camera.camera.width);
        canvas.setAttribute("height", "" + camera.camera.height);
        const ctx2d = canvas.getContext("2d")!;
        ctx2d.clearRect(0, 0, camera.camera.width, camera.camera.height);
        const offsetX = -camera.point.x + camera.camera.width / 2;
        const offsetY = -camera.point.y + camera.camera.height / 2;
        for (const circle of entities.byTag("circle")) {
          const cx = circle.point.x + offsetX;
          const cy = circle.point.y + offsetY;
          ctx2d.beginPath();
          ctx2d.arc(cx, cy, circle.circle.radius, 0, 2 * Math.PI);
          ctx2d.fillStyle = "red";
          ctx2d.fill();
          ctx2d.beginPath();
          ctx2d.arc(cx, cy, circle.circle.radius, 0, 2 * Math.PI);
          ctx2d.lineWidth = 2;
          ctx2d.strokeStyle = "black";
          ctx2d.stroke();
        }
      },
    },
  };
}
