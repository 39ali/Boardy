import { MouseEvent, useState } from "react";
import styles from "./toolsbox.module.css";
import { Drawable } from "../renderables/renderable";

export enum DrawingType {
  Rect,
  Brush,
  Select,
}

export interface DrawingState {
  type: DrawingType;
  brushSize: number;
}
export function Toolbox({
  addRect,
  drawingState,
  updateSelectionBoxSize,
}: {
  addRect: () => void;
  drawingState: React.MutableRefObject<DrawingState>;
  updateSelectionBoxSize: (
    selectedEntities: Drawable[],
    resetRotation?: boolean
  ) => void;
}) {
  const [brushSize, setBrushSize] = useState(drawingState.current.brushSize);

  return (
    <div className={styles["toolbox"]} id="toolbox">
      <div
        className={styles["tool"]}
        style={{ background: "black" }}
        onClick={(e: MouseEvent) => {
          e.stopPropagation();
          drawingState.current.type = DrawingType.Select;
          updateSelectionBoxSize([], true);
        }}
      >
        <img src="pointer-on.svg" alt="Select" />
        <span className={styles["tool-tooltip"]}>Select</span>
      </div>

      <div
        className={styles["tool"]}
        onClick={(e: MouseEvent) => {
          e.stopPropagation();
          addRect();
          drawingState.current.type = DrawingType.Rect;
          updateSelectionBoxSize([], true);
        }}
      >
        <img src="rectangle.svg" alt="Box" />
        <span className={styles["tool-tooltip"]}>Add Box</span>
      </div>
      <div
        className={styles["tool"]}
        onClick={(e: MouseEvent) => {
          e.stopPropagation();
          drawingState.current.type = DrawingType.Brush;
          updateSelectionBoxSize([], true);
        }}
      >
        <img src="pencil.svg" alt="brush" />
        <span className={styles["tool-tooltip"]}>Brush</span>
      </div>
      <div className={styles["tool"]}>
        <input
          type="range"
          min={1}
          max={5}
          value={drawingState.current.brushSize}
          step={1}
          className={styles.slider}
          onChange={(e) => {
            drawingState.current.brushSize = parseInt(e.target.value);
            setBrushSize(drawingState.current.brushSize);
            updateSelectionBoxSize([], true);
          }}
        />
        <div className={styles.value} id="sliderValue">
          {brushSize}
        </div>
        <span className={styles["tool-tooltip"]}>Brush Size</span>
      </div>
    </div>
  );
}
