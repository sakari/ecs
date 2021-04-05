import { Component, Reference } from "../engine/entity";
import * as ecs from "../index";

export type Clock = Component<{
  deltaMs: number;
}>;

export type Speed2d = Component<{
  dxMs: number;
  dyMs: number;
}>;

export interface MouseEvent {
  press: boolean;
  release: boolean;
  down: boolean;
  x: number;
  y: number;
}

export type MouseInteract = Component<{
  type: "hover" | "press" | "release" | "none";
}>;

export type Mouse = Component<{ events: MouseEvent | null }>;

export type Point = Component<{
  x: number;
  y: number;
}>;

export type Camera = Component<{
  width: number;
  height: number;
  zoom: number;
  tag: string;
}>;

export type Circle2d = Component<{ radius: number }>;

export type DrawStyle = Component<{
  fillColor: null | string;
  lineColor: null | string;
  lineWidth: null | number;
}>;

export type Line2d = Component<{
  startRadian: number;
  startMagnitude: number;
  endRadian: number;
  endMagnitude: number;
  end: ecs.engine.entity.Reference<{ point: Point }, "point">;
  start: ecs.engine.entity.Reference<{ point: Point }, "point">;
}>;
