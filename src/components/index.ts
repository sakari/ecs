import { Component } from "../engine/entity";

export type Speed2d = Component<{
  dxMs: number;
  dyMs: number;
}>;

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
