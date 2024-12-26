import { useCallback, useEffect, useState, MouseEvent, useRef } from "react";
import "./App.css";
import { Rect } from "./renderables/Rect";
import { DrawingState, DrawingType, Toolbox } from "./tools/toolbox";
import { SelectionBox, SelectionBoxState } from "./tools/selectionBox";
import { MouseState } from "./tools/mouseState";
import { Brush } from "./renderables/brush";
import { Drawable } from "./renderables/renderable";
import { getRandom, Vec2 } from "./utils/vec2";
import { Box } from "./utils/boxCollisions";

function App(this: any) {
  const ctx = useRef<{
    ctx: CanvasRenderingContext2D;
    canvas: HTMLCanvasElement;
  } | null>(null);
  const mouseState = useRef<MouseState>({ isPressed: false, x: 0, y: 0 });
  const entities = useRef<Array<Drawable>>([]);
  const currentBrush = useRef<Brush | null>(null);
  const drawingState = useRef<DrawingState>({
    type: DrawingType.Select,
    brushSize: 5,
  });
  const [selectionBoxState, setSelectionBoxState] = useState<SelectionBoxState>(
    {
      isActive: false,
      w: 0,
      h: 0,
      x: 0,
      y: 0,
      rot: 0,
      prevRot: 0,
      enableEvents: false,
      selectedEntities: [],
      isRotating: false,
    }
  );

  const setCanvasRef = useCallback((element: HTMLCanvasElement) => {
    if (element) {
      element.width = window.innerWidth * window.devicePixelRatio;
      element.height = window.innerHeight * window.devicePixelRatio;
      element.style.width = window.innerWidth + "px";
      element.style.height = window.innerHeight + "px";

      const canvasContext = element.getContext("2d");

      ctx.current = {
        ctx: canvasContext as CanvasRenderingContext2D,
        canvas: element,
      };
    }
  }, []);

  // draw on every entity update
  useEffect(() => {
    draw();
  }, [entities]);

  const draw = () => {
    if (ctx.current) {
      const context = ctx.current.ctx;
      context.save();
      context.clearRect(
        0,
        0,
        window.innerWidth * devicePixelRatio,
        window.innerHeight * devicePixelRatio
      );
      entities.current.forEach((ent) => {
        context.save();
        context.scale(devicePixelRatio, devicePixelRatio);
        ent.draw(context);

        context.restore();
      });
    }
  };

  const addRect = () => {
    const x = getRandom(window.innerWidth * 0.1, window.innerWidth * 0.7);
    const y = getRandom(window.innerWidth * 0.1, window.innerWidth * 0.5);

    entities.current.push(new Rect(x, y, 100, 100));
    draw();
  };

  const onMouseDown = (e: MouseEvent) => {
    mouseState.current.isPressed = true;

    mouseState.current.x = e.pageX;
    mouseState.current.y = e.pageY;

    selectionBoxState.x = e.pageX;
    selectionBoxState.y = e.pageY;

    if (drawingState.current.type === DrawingType.Brush) {
      currentBrush.current = new Brush(drawingState.current.brushSize);
      entities.current.push(currentBrush.current);
      currentBrush.current?.addPoint(new Vec2(e.pageX, e.pageY));
    }
  };

  const getSelectedEntities = () => {
    const selectedEntities: Drawable[] = [];

    entities.current.forEach((ent) => {
      if (
        ent.collides(
          new Box(
            selectionBoxState.x + selectionBoxState.w * 0.5,
            window.innerHeight -
              (selectionBoxState.y + selectionBoxState.h * 0.5),
            selectionBoxState.w,
            selectionBoxState.h,
            0
          )
        )
      ) {
        selectedEntities.push(ent);
      }
    });
    return selectedEntities;
  };
  const updateSelectionBoxSize = (
    selectedEntities: Drawable[],
    resetRotation?: boolean
  ) => {
    if (selectedEntities.length) {
      let x0 = Number.MAX_VALUE;
      let y0 = Number.MAX_VALUE;
      let x1 = 0;
      let y1 = 0;
      for (const ent of selectedEntities) {
        x0 = Math.min(ent.min.x, x0);
        y0 = Math.min(ent.min.y, y0);
        x1 = Math.max(ent.max.x, x1);
        y1 = Math.max(ent.max.y, y1);
      }

      setSelectionBoxState({
        ...selectionBoxState,
        isActive: true,
        enableEvents: true,
        selectedEntities,
        x: x0,
        y: y0,
        w: x1 - x0,
        h: y1 - y0,
        rot: resetRotation ? 0 : selectionBoxState.rot,
        isRotating: resetRotation ? false : !!selectionBoxState.rot,
        prevRot: resetRotation ? 0 : selectionBoxState.prevRot,
      });
    } else {
      //selection box is selecting nothing
      setSelectionBoxState({
        isActive: false,
        w: 0,
        h: 0,
        x: 0,
        y: 0,
        rot: 0,
        prevRot: 0,
        enableEvents: false,
        selectedEntities: [],
        isRotating: false,
      });
    }
  };

  // mouse events
  const onMouseUp = (e: MouseEvent) => {
    if (!mouseState.current.isPressed) return;
    mouseState.current.isPressed = false;

    if (drawingState.current.type !== DrawingType.Brush) {
      const selectedEntities = getSelectedEntities();
      updateSelectionBoxSize(selectedEntities);
    } else {
      currentBrush.current?.addPoint(new Vec2(e.pageX, e.pageY));
      currentBrush.current = null;
    }
  };

  const onMouseMove = (e: MouseEvent) => {
    if (mouseState.current.isPressed) {
      if (drawingState.current.type !== DrawingType.Brush) {
        let x = Math.min(mouseState.current.x, e.pageX);
        let y = Math.min(mouseState.current.y, e.pageY);

        const selectBoxState = {
          isActive: true,
          x,
          y,
          w: Math.abs(e.pageX - mouseState.current.x),
          h: Math.abs(e.pageY - mouseState.current.y),
          enableEvents: false,
          rot: 0,
          prevRot: 0,
          selectedEntities: [],
          isRotating: false,
        };

        setSelectionBoxState(selectBoxState);
      } else {
        currentBrush.current?.addPoint(new Vec2(e.pageX, e.pageY));
        draw();
      }
    }
  };

  // attach window mouse up event to window
  useEffect(() => {
    const mouseUp = (e: MouseEvent) => {
      onMouseUp(e);
    };

    const onResize = () => {
      const element = ctx.current?.canvas;
      if (element) {
        element.width = window.innerWidth * window.devicePixelRatio;
        element.height = window.innerHeight * window.devicePixelRatio;
        element.style.width = window.innerWidth + "px";
        element.style.height = window.innerHeight + "px";
        draw();
      }
    };

    window.addEventListener("mouseup", mouseUp as any);
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("mouseup", mouseUp as any);
      window.removeEventListener("resize", onResize);
    };
  });

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Toolbox
        addRect={addRect}
        drawingState={drawingState}
        updateSelectionBoxSize={updateSelectionBoxSize}
      ></Toolbox>
      <SelectionBox
        state={selectionBoxState}
        draw={draw}
        updateSelectionBoxSize={updateSelectionBoxSize}
      ></SelectionBox>

      <canvas
        ref={setCanvasRef}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseMove={onMouseMove}
      />
    </div>
  );
}

export default App;
