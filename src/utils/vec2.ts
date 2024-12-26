export class Vec2 {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
  weight() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  normalize() {
    const w = this.weight();
    return new Vec2(this.x / w, this.y / w);
  }

  static getAngle(v1: Vec2, v2: Vec2) {
    const angle = Math.atan2(v2.y, v2.x) - Math.atan2(v1.y, v1.x);

    // Normalize  0-2π range
    return (angle + 2 * Math.PI) % (2 * Math.PI);
  }

  translate(x: number, y: number) {
    this.x += x;
    this.y += y;
  }
}

export function getRandom(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export function rotatePoint(v: Vec2, c: Vec2, angle: number): Vec2 {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const nx = cos * (v.x - c.x) - sin * (v.y - c.y) + c.x;
  const ny = sin * (v.x - c.x) + cos * (v.y - c.y) + c.y;
  return new Vec2(nx, ny);
}

function clamp(input: number, min: number, max: number): number {
  return input < min ? min : input > max ? max : input;
}

export function map(
  current: number,
  in_min: number,
  in_max: number,
  out_min: number,
  out_max: number
): number {
  const mapped: number =
    ((current - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
  return clamp(mapped, out_min, out_max);
}
