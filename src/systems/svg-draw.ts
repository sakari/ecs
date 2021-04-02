import * as engine from "../engine";
import * as components from "../components";

export type Registry = {
  camera: components.Camera;
  point: components.Point;
  circle: components.Circle2d;
};

type Release = () => void;
export type SetContainer = (tag: string, ref: HTMLElement) => Release;

const svgHandle = Symbol();

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
        canvas.setAttribute("width", "" + camera.camera.props.width);
        canvas.setAttribute("height", "" + camera.camera.props.height);
        const offsetX = -camera.point.props.x + camera.camera.props.width / 2;
        const offsetY = -camera.point.props.y + camera.camera.props.height / 2;
        for (const circle of entities.byTag("circle")) {
          let handle = (circle as any)[svgHandle];
          const cx = "" + (circle.point.props.x + offsetX);
          const cy = "" + (circle.point.props.y + offsetY);
          if (!handle) {
            handle = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "circle"
            );
            handle.setAttribute("stroke", "black");
            handle.setAttribute("stroke-width", "1");
            handle.setAttribute("fill", "red");
            handle.setAttribute("cx", cx);
            handle.setAttribute("cy", cy);
            handle.setAttribute("r", "" + circle.circle.props.radius);
            canvas.appendChild(handle);
            (circle as any)[svgHandle] = handle;
          }
          handle.setAttribute("cx", cx);
          handle.setAttribute("cy", cy);
          handle.setAttribute("r", "" + circle.circle.props.radius);
        }
      },
    },
  };
}
