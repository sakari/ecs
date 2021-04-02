import * as engine from "../engine";
import * as components from "../components";

type Registry = {
  camera: components.Camera;
  point: components.Point;
};

type Release = () => void;
export type SetContainer = (tag: string, ref: HTMLElement) => Release;

export function svgDraw<R extends Registry>(): {
  system: engine.entity.System<R, { camera: "camera" | "point" }>;
  setContainer: SetContainer;
} {
  const canvases: Record<string, SVGSVGElement> = {};
  return {
    setContainer: (tag, viewPort) => {
      const canvas = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
      );
      canvas.setAttribute("width", "100");
      canvas.setAttribute("height", "100");
      canvases[tag] = canvas;
      viewPort.innerHTML = "";
      viewPort.appendChild(canvas);
      return () => {
        delete canvases[tag];
        viewPort.innerHTML = "";
      };
    },
    system: {
      componentSelector: { camera: new Set(["camera", "point"]) },
      run: (_clock, _actions, entities) => {
        const [camera] = entities.byTag("camera");
        if (!camera) {
          return;
        }
        const canvas = canvases[camera.camera.props.tag];
        if (!canvas) {
          return;
        }
        canvas.innerHTML = `
        <circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red" />
        `;
      },
    },
  };
}
