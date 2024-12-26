import { Box, checkCollision } from "../utils/boxCollisions";
import { map, rotatePoint, Vec2 } from "../utils/vec2";
import { Drawable } from "./renderable";

export class Brush implements Drawable {
  points: Vec2[] = [];

  min: Vec2;
  max: Vec2;

  isActive: boolean = false;
  rotation: number;
  thickness: number;

  constructor(thickness: number) {
    this.rotation = 0;
    this.thickness = thickness;

    this.min = new Vec2(Number.MAX_VALUE, Number.MAX_VALUE);
    this.max = new Vec2(0, 0);

    this.updateMinMaxX();
    this.updateMinMaxY();
  }

  translate(x: number, y: number) {
    for (const pt of this.points) {
      pt.translate(x, y);
    }

    this.updateMinMaxX();
    this.updateMinMaxY();
  }

  updateMinMaxX() {
    this.min.x = Number.MAX_VALUE;
    this.max.x = 0;
    for (const ptr of this.points) {
      this.min.x = Math.min(this.min.x, ptr.x);
      this.max.x = Math.max(this.max.x, ptr.x);
    }
  }
  updateMinMaxY() {
    this.min.y = Number.MAX_VALUE;
    this.max.y = 0;

    for (const ptr of this.points) {
      this.min.y = Math.min(this.min.y, ptr.y);
      this.max.y = Math.max(this.max.y, ptr.y);
    }
  }
  scaleLeft(s: number, min: Vec2, max: Vec2) {
    const minx = min.x;
    const maxx = max.x;

    for (const ptr of this.points) {
      ptr.x = map(ptr.x, minx, maxx, minx + s, maxx);
    }

    this.updateMinMaxX();
  }

  scaleRight(s: number, min: Vec2, max: Vec2) {
    const minx = min.x;
    const maxx = max.x;

    for (const ptr of this.points) {
      ptr.x = map(ptr.x, minx, maxx, minx, maxx + s);
    }

    this.updateMinMaxX();
  }

  scaleTop(s: number, min: Vec2, max: Vec2) {
    const miny = min.y;
    const maxy = max.y;

    for (const ptr of this.points) {
      ptr.y = map(ptr.y, miny, maxy, miny + s, maxy);
    }

    this.updateMinMaxY();
  }

  scaleBottom(s: number, min: Vec2, max: Vec2) {
    const miny = min.y;
    const maxy = max.y;

    for (const ptr of this.points) {
      ptr.y = map(ptr.y, miny, maxy, miny, maxy + s);
    }
    this.updateMinMaxY();
  }
  rotate(r: number, center: Vec2) {
    this.rotation += r;
    for (let i = 0; i < this.points.length; i++) {
      this.points[i] = rotatePoint(this.points[i], center, r);
    }
  }

  addPoint(p: Vec2) {
    this.points.push(p);

    this.updateMinMaxX();
    this.updateMinMaxY();
  }

  draw(context: CanvasRenderingContext2D) {
    for (let i = 0; i < this.points.length; i++) {
      context.beginPath();
      const p0 = this.points[i];
      const p1 = this.points[i + 1];
      if (p1) {
        context.moveTo(p0.x, p0.y);
        context.lineTo(p1.x, p1.y);
      }
      context.closePath();

      context.lineWidth = this.thickness;
      context.lineCap = "round";
      context.stroke();
    }
  }

  collides(box: Box) {
    const size = 1;
    for (const pt of this.points) {
      if (
        checkCollision(
          box,
          new Box(
            pt.x + size * 0.5,
            window.innerHeight - (pt.y + size * 0.5),
            size,
            size,
            0
          )
        )
      )
        return true;
    }
    return false;
  }
}
