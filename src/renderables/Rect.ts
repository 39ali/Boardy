import { Drawable } from "./renderable";
import { DrawingType } from "../tools/toolbox";
import { map, rotatePoint, Vec2 } from "../utils/vec2";
import { Box, checkCollision } from "../utils/boxCollisions";

export class Rect implements Drawable {
  type = DrawingType.Rect;
  a: Vec2;
  b: Vec2;
  c: Vec2;
  d: Vec2;

  min: Vec2;
  max: Vec2;

  isActive: boolean = false;
  rotation: number;

  constructor(x: number, y: number, w: number, h: number) {
    this.rotation = 0;

    this.a = new Vec2(x, y);
    this.b = new Vec2(x + w, y);
    this.c = new Vec2(x + w, y + h);
    this.d = new Vec2(x, y + h);

    this.min = new Vec2(this.a.x, this.a.y);
    this.max = new Vec2(this.c.x, this.c.y);
  }

  translate(x: number, y: number) {
    this.a.translate(x, y);
    this.b.translate(x, y);
    this.c.translate(x, y);
    this.d.translate(x, y);

    this.updateMinMaxX();
    this.updateMinMaxY();
  }
  updateMinMaxX() {
    this.min.x = Math.min(this.a.x, this.b.x, this.b.x, this.c.x, this.d.x);
    this.max.x = Math.max(this.a.x, this.b.x, this.b.x, this.c.x, this.d.x);
  }
  updateMinMaxY() {
    this.min.y = Math.min(this.a.y, this.b.y, this.b.y, this.c.y, this.d.y);
    this.max.y = Math.max(this.a.y, this.b.y, this.b.y, this.c.y, this.d.y);
  }

  isMinSize(min: Vec2, max: Vec2) {
    let w = max.x - min.x;
    let h = max.y - min.y;
    if (w < 50 || h < 50) {
      this.max.x += 0.5;
      this.max.y += 0.5;
      return true;
    }
    return false;
  }
  scaleLeft(s: number, min: Vec2, max: Vec2) {
    const minx = min.x;
    const maxx = max.x;

    this.a.x = map(this.a.x, minx, maxx, minx + s, maxx);
    this.b.x = map(this.b.x, minx, maxx, minx + s, maxx);
    this.c.x = map(this.c.x, minx, maxx, minx + s, maxx);
    this.d.x = map(this.d.x, minx, maxx, minx + s, maxx);

    this.updateMinMaxX();
  }

  scaleRight(s: number, min: Vec2, max: Vec2) {
    const minx = min.x;
    const maxx = max.x;

    this.a.x = map(this.a.x, minx, maxx, minx, maxx + s);
    this.b.x = map(this.b.x, minx, maxx, minx, maxx + s);
    this.c.x = map(this.c.x, minx, maxx, minx, maxx + s);
    this.d.x = map(this.d.x, minx, maxx, minx, maxx + s);

    this.updateMinMaxX();
  }

  scaleTop(s: number, min: Vec2, max: Vec2) {
    const miny = min.y;
    const maxy = max.y;
    this.a.y = map(this.a.y, miny, maxy, miny + s, maxy);
    this.b.y = map(this.b.y, miny, maxy, miny + s, maxy);
    this.c.y = map(this.c.y, miny, maxy, miny + s, maxy);
    this.d.y = map(this.d.y, miny, maxy, miny + s, maxy);

    this.updateMinMaxY();
  }

  scaleBottom(s: number, min: Vec2, max: Vec2) {
    const miny = min.y;
    const maxy = max.y;
    this.a.y = map(this.a.y, miny, maxy, miny, maxy + s);
    this.b.y = map(this.b.y, miny, maxy, miny, maxy + s);
    this.c.y = map(this.c.y, miny, maxy, miny, maxy + s);
    this.d.y = map(this.d.y, miny, maxy, miny, maxy + s);
    this.updateMinMaxY();
  }
  rotate(r: number, center: Vec2) {
    this.rotation += r;
    this.a = rotatePoint(this.a, center, r);
    this.b = rotatePoint(this.b, center, r);
    this.c = rotatePoint(this.c, center, r);
    this.d = rotatePoint(this.d, center, r);
  }

  draw(context: CanvasRenderingContext2D) {
    context.beginPath();

    context.moveTo(this.a.x, this.a.y);

    // Draw top line
    context.lineTo(this.b.x, this.b.y);

    // Draw right line
    context.lineTo(this.c.x, this.c.y);

    // Draw bottom line
    context.lineTo(this.d.x, this.d.y);

    // Draw left line
    context.lineTo(this.a.x, this.a.y);

    context.closePath();

    context.strokeStyle = "#ffd670";
    context.fillStyle = "#ffd670";
    context.lineWidth = 2;
    context.stroke();
    context.fill();
  }

  collides(box: Box) {
    let w = this.max.x - this.min.x;
    let h = this.max.y - this.min.y;

    return checkCollision(
      box,
      new Box(
        this.min.x + w * 0.5,
        window.innerHeight - (this.min.y + h * 0.5),
        w,
        h,
        this.rotation
      )
    );
  }
}
