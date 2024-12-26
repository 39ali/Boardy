import { CSSProperties, MouseEvent, useEffect, useRef } from "react";
import { Drawable } from "../renderables/renderable";
import { Vec2 } from "../utils/vec2";

enum HandleType {
  TL,
  TM,
  TR,

  ML,
  MR,
  MM,

  BL,
  BM,
  BR,
  ROT,
}

export interface SelectionBoxState {
  isActive: boolean;
  w: number;
  h: number;
  x: number;
  y: number;
  rot: number;
  prevRot: number;
  enableEvents: boolean;
  selectedEntities: Drawable[];
  isRotating: boolean;
}

const handleTopLeft = { left: 0, top: 0 };
const handleTopMiddle = { left: "50%", top: 0 };
const handleTopRight = { left: "100%", top: 0 };

const handleMiddleLeft = { left: 0, top: "50%" };
const handleMiddleRight = { left: "100%", top: "50%" };

const handleBottomLeft = { left: 0, top: "100%" };
const handleBottomCenter = { left: "50%", top: "100%" };
const handleBottomRight = { left: "100%", top: "100%" };

const handleRotation = {
  top: "-20px",
  left: "50%",
};

const MIN_SIZE = 30;

const isMinSizeX = (min: Vec2, max: Vec2, sx: number) => {
  return max.x - min.x + sx < MIN_SIZE;
};
const isMinSizeY = (min: Vec2, max: Vec2, sy: number) => {
  return max.y - min.y + sy < MIN_SIZE;
};

export const SelectionBox = ({
  state,
  draw,
  updateSelectionBoxSize,
}: {
  state: SelectionBoxState;
  draw: () => void;
  updateSelectionBoxSize: (
    selectedEntities: Drawable[],
    resetRotation?: boolean
  ) => void;
}) => {
  const mouseState = useRef<{ type: HandleType; isPressed: boolean }>({
    isPressed: false,
    type: HandleType.MM,
  });
  const borderSize = 2;
  const selectionBox: CSSProperties = {
    position: "absolute",
    border: `${borderSize}px dashed #666`,
    background: "transparent",
    width: state.w,
    height: state.h,
    top: state.y - borderSize,
    left: state.x - borderSize,
    rotate: state.rot + "rad",
    pointerEvents: state.enableEvents ? "auto" : "none",
    visibility: state.isRotating ? "hidden" : "visible",
  };

  const handle: CSSProperties = {
    position: "absolute",
    width: "10px",
    height: "10px",
    background: "#4CAF50",
    borderRadius: "50%",
    transform: "translate(-50%, -50%)",
    visibility: state.isRotating ? "hidden" : "visible",
  };

  const mouseDown = (e: MouseEvent, hnd: HandleType) => {
    e.preventDefault();
    e.stopPropagation();
    mouseState.current.isPressed = true;
    mouseState.current.type = hnd;
  };

  const mouseMove = (e: MouseEvent) => {
    e.preventDefault();
    if (!mouseState.current.isPressed) return;

    let min = new Vec2(state.x, state.y);
    let max = new Vec2(state.x + state.w, state.y + state.h);

    switch (mouseState.current.type) {
      case HandleType.TL: {
        if (
          isMinSizeX(min, max, e.movementX) &&
          isMinSizeX(min, max, -e.movementY)
        ) {
          return;
        }

        state.selectedEntities.forEach((ent) => {
          let s = Math.max(Math.abs(e.movementX), Math.abs(e.movementY));
          const ySign =
            Math.sign(e.movementY) === 0 ? 1 : Math.sign(-e.movementY);

          if (ySign) {
            s *= ySign;
          } else {
            s *= Math.sign(e.movementX) === 0 ? 1 : Math.sign(e.movementX);
          }

          ent.scaleLeft(-s, min, max);
          ent.scaleTop(-s, min, max);
        });

        break;
      }
      case HandleType.TR: {
        if (
          isMinSizeX(min, max, e.movementX) &&
          isMinSizeX(min, max, -e.movementY)
        ) {
          return;
        }
        state.selectedEntities.forEach((ent) => {
          let s = Math.max(Math.abs(e.movementX), Math.abs(e.movementY));

          const ySign =
            Math.sign(e.movementY) === 0 ? 1 : Math.sign(-e.movementY);
          if (ySign) {
            s *= ySign;
          } else {
            s *= Math.sign(e.movementX) === 0 ? 1 : Math.sign(e.movementX);
          }

          ent.scaleRight(s, min, max);
          ent.scaleTop(-s, min, max);
        });
        break;
      }
      case HandleType.TM: {
        if (isMinSizeY(min, max, -e.movementY)) {
          return;
        }
        state.selectedEntities.forEach((ent) => {
          ent.scaleTop(e.movementY, min, max);
        });
        break;
      }

      case HandleType.ML: {
        if (isMinSizeX(min, max, -e.movementX)) {
          return;
        }
        state.selectedEntities.forEach((ent) => {
          ent.scaleLeft(e.movementX, min, max);
        });
        break;
      }

      case HandleType.MR: {
        if (isMinSizeX(min, max, e.movementX)) {
          return;
        }
        state.selectedEntities.forEach((ent) => {
          ent.scaleRight(e.movementX, min, max);
        });
        break;
      }

      case HandleType.BL: {
        if (
          isMinSizeX(min, max, -e.movementX) &&
          isMinSizeX(min, max, e.movementY)
        ) {
          return;
        }
        state.selectedEntities.forEach((ent) => {
          let s = Math.max(Math.abs(e.movementX), Math.abs(e.movementY));
          const ySign =
            Math.sign(e.movementY) === 0 ? 1 : Math.sign(-e.movementY);

          if (ySign) {
            s *= ySign;
          } else {
            s *= Math.sign(e.movementX) === 0 ? 1 : Math.sign(e.movementX);
          }

          ent.scaleLeft(s, min, max);
          ent.scaleBottom(-s, min, max);
        });
        break;
      }
      case HandleType.BR: {
        if (
          isMinSizeX(min, max, e.movementX) &&
          isMinSizeX(min, max, -e.movementY)
        ) {
          return;
        }
        state.selectedEntities.forEach((ent) => {
          let s = Math.max(Math.abs(e.movementX), Math.abs(e.movementY));
          const ySign =
            Math.sign(e.movementY) === 0 ? 1 : Math.sign(-e.movementY);

          if (ySign) {
            s *= ySign;
          } else {
            s *= Math.sign(e.movementX) === 0 ? 1 : Math.sign(e.movementX);
          }

          ent.scaleRight(-s, min, max);
          ent.scaleBottom(-s, min, max);
        });
        break;
      }
      case HandleType.BM: {
        if (isMinSizeY(min, max, e.movementY)) {
          return;
        }
        state.selectedEntities.forEach((ent) => {
          ent.scaleBottom(e.movementY, min, max);
        });
        break;
      }

      case HandleType.MM: {
        state.selectedEntities.forEach((ent) => {
          ent.translate(e.movementX, e.movementY);
        });
        break;
      }

      case HandleType.ROT: {
        const origin = new Vec2(0, -1);

        const center = new Vec2(
          state.x + state.w * 0.5,
          state.y + state.h * 0.5
        );

        let dir = new Vec2(e.pageX - center.x, e.pageY - center.y).normalize();

        let rad = -Vec2.getAngle(dir, origin);

        let radDelta = rad - state.prevRot;
        state.prevRot = rad;

        state.rot = rad;

        state.selectedEntities.forEach((ent) => {
          ent.rotate(radDelta, center);
        });
        break;
      }
    }

    updateSelectionBoxSize(state.selectedEntities);
    draw();
  };

  // things to reinit once state changes
  useEffect(() => {
    const mouseMov = (e: any) => {
      if (!mouseState.current.isPressed) return;
      mouseMove(e);
    };

    const mouseUp = () => {
      if (mouseState.current.isPressed) {
        mouseState.current.isPressed = false;

        for (const ent of state.selectedEntities) {
          ent.updateMinMaxX();
          ent.updateMinMaxY();
        }
        updateSelectionBoxSize(state.selectedEntities, true);
      }
    };

    window.addEventListener("mousemove", mouseMov);
    window.addEventListener("mouseup", mouseUp);

    return () => {
      window.removeEventListener("mousemove", mouseMov);
      window.removeEventListener("mouseup", mouseUp);
    };
  });

  if (state.isActive) {
    return (
      <div
        style={selectionBox}
        onMouseDown={(e) => {
          mouseDown(e, HandleType.MM);
        }}
      >
        <div
          style={{ ...handle, ...handleTopLeft }}
          onMouseDown={(e) => {
            mouseDown(e, HandleType.TL);
          }}
        ></div>
        <div
          style={{ ...handle, ...handleTopMiddle }}
          onMouseDown={(e) => {
            mouseDown(e, HandleType.TM);
          }}
        ></div>
        <div
          style={{ ...handle, ...handleTopRight }}
          onMouseDown={(e) => {
            mouseDown(e, HandleType.TR);
          }}
        ></div>

        <div
          style={{ ...handle, ...handleMiddleLeft }}
          onMouseDown={(e) => {
            mouseDown(e, HandleType.ML);
          }}
        ></div>
        <div
          style={{ ...handle, ...handleMiddleRight }}
          onMouseDown={(e) => {
            mouseDown(e, HandleType.MR);
          }}
        ></div>

        <div
          style={{ ...handle, ...handleBottomLeft }}
          onMouseDown={(e) => {
            mouseDown(e, HandleType.BL);
          }}
        ></div>
        <div
          style={{ ...handle, ...handleBottomCenter }}
          onMouseDown={(e) => {
            mouseDown(e, HandleType.BM);
          }}
        ></div>
        <div
          style={{ ...handle, ...handleBottomRight }}
          onMouseDown={(e) => {
            mouseDown(e, HandleType.BR);
          }}
        ></div>

        {/* rotation */}
        <div
          style={{ ...handle, ...handleRotation, visibility: "visible" }}
          onMouseDown={(e) => {
            mouseDown(e, HandleType.ROT);
          }}
        ></div>
      </div>
    );
  } else {
    return <></>;
  }
};
