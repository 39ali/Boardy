import { Vec2 } from "./vec2";

export class Box {
  //center of box
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    rotation: number
  ) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.rotation = rotation;
  }

  getCorners() {
    const corners = [
      { x: -this.width / 2, y: -this.height / 2 },
      { x: this.width / 2, y: -this.height / 2 },
      { x: this.width / 2, y: this.height / 2 },
      { x: -this.width / 2, y: this.height / 2 },
    ];

    // transform corners to take rotation into account
    return corners.map((corner) => {
      const rotatedX =
        corner.x * Math.cos(this.rotation) - corner.y * Math.sin(this.rotation);
      const rotatedY =
        corner.x * Math.sin(this.rotation) + corner.y * Math.cos(this.rotation);
      return {
        x: rotatedX + this.x,
        y: rotatedY + this.y,
      };
    });
  }
}

function projectOntoAxis(corners: Vec2[], axis: Vec2) {
  const dots = corners.map((corner) => {
    return corner.x * axis.x + corner.y * axis.y;
  });
  return {
    min: Math.min(...dots),
    max: Math.max(...dots),
  };
}

function getNormals(corners: Vec2[]) {
  const normals = [];
  for (let i = 0; i < corners.length; i++) {
    const current = corners[i];
    const next = corners[(i + 1) % corners.length];

    const edge = {
      x: next.x - current.x,
      y: next.y - current.y,
    };

    // Get normal (perpendicular) vector
    normals.push({
      x: -edge.y,
      y: edge.x,
    });
  }
  return normals;
}

function normalizeVector(vector: Vec2) {
  const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
  return {
    x: vector.x / length,
    y: vector.y / length,
  };
}

export function checkCollision(box1: Box, box2: Box) {
  const corners1 = box1.getCorners() as Vec2[];
  const corners2 = box2.getCorners() as Vec2[];

  // Get normal vectors for both rects
  const normals = [...getNormals(corners1), ...getNormals(corners2)];

  //  projection normal to axis and check if they overlap
  for (const normal of normals) {
    const normalizedAxis = normalizeVector(normal as Vec2) as Vec2;

    const projection1 = projectOntoAxis(corners1, normalizedAxis);
    const projection2 = projectOntoAxis(corners2, normalizedAxis);

    // If there's no overlap in any axis, rects don't collide
    if (
      projection1.max < projection2.min ||
      projection2.max < projection1.min
    ) {
      return false;
    }
  }

  return true;
}
