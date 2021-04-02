import { Component } from "../engine/entity";

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
