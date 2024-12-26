import { Box } from "../utils/boxCollisions";
import { Vec2 } from "../utils/vec2";

export interface Drawable {
  max: Vec2;
  min: Vec2;
  rotation: number;
  translate(x: number, y: number): void;

  updateMinMaxX(): void;

  updateMinMaxY(): void;

  scaleLeft(s: number, min: Vec2, max: Vec2): void;

  scaleRight(s: number, min: Vec2, max: Vec2): void;

  scaleTop(s: number, min: Vec2, max: Vec2): void;

  scaleBottom(s: number, min: Vec2, max: Vec2): void;

  rotate(r: number, center: Vec2): void;

  draw(context: CanvasRenderingContext2D): void;

  collides(box: Box): boolean;
}
