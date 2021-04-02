import * as engine from "../engine";
import * as components from "../components";

export type Registry = {
  camera: components.Camera;
  point: components.Point;
  circle: components.Circle2d;
};

type Release = () => void;
export type SetContainer = (tag: string, ref: HTMLElement) => Release;

export function svgDraw<R extends Registry>(): {
  system: engine.entity.System<
    R,
    { camera: "camera" | "point"; circle: "circle" | "point" }
  >;
  setContainer: SetContainer;
} {
  const canvases: Record<string, SVGSVGElement> = {};
  return {
    setContainer: (tag, viewPort) => {
      const canvas = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
      );
      canvas.setAttribute("width", "1000");
      canvas.setAttribute("height", "1000");
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
        const canvas = canvases[camera.camera.props.tag];
        if (!canvas) {
          return;
        }
        const circles = entities.byTag("circle");
        canvas.innerHTML = circles
          .map(
            (circle) => `
        <circle cx="${circle.point.props.x}" cy="${circle.point.props.y}" r="${circle.circle.props.radius}" stroke="black" stroke-width="3" fill="red" />
        `
          )
          .join("");
      },
    },
  };
}
