import { useEffect, useState } from "react";

import { motion } from "framer-motion";
import { BsArrowsMove } from "react-icons/bs";

import { CANVAS_SIZE } from "@/common/constants/canvasSize";
import { useViewportSize } from "@/common/hooks/useViewportSize";
import { socket } from "@/common/lib/socket";

import { useBoardPosition } from "../../hooks/useBoardPosition";
import { useCtx } from "../../hooks/useCtx";
import { useDraw } from "../../hooks/useDraw";
import { useMovesHandlers } from "../../hooks/useMovesHandlers";
import { useRefs } from "../../hooks/useRefs";
import { useSocketDraw } from "../../hooks/useSocketDraw";
import Background from "./Background";
import MiniMap from "./Minimap";

const Canvas = () => {
  const { canvasRef, bgRef, undoRef, redoRef } = useRefs();
  const { width, height } = useViewportSize();
  const { x, y } = useBoardPosition();
  const ctx = useCtx();

  const [dragging, setDragging] = useState(true);

  const {
    handleEndDrawing,
    handleDraw,
    handleStartDrawing,
    drawing,
    clearOnYourMove,
  } = useDraw(dragging);
  useSocketDraw(drawing);

  const { handleUndo, handleRedo } = useMovesHandlers(clearOnYourMove);
  const [layers, setLayers] = useState([{ strokes: [] }]);

  useEffect(() => {
    setDragging(false);
  }, []);

  // SETUP
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      setDragging(e.ctrlKey);
    };

    window.addEventListener("keyup", handleKey);
    window.addEventListener("keydown", handleKey);

    const undoBtn = undoRef.current;
    const redoBtn = redoRef.current;

    undoBtn?.addEventListener("click", handleUndo);
    redoBtn?.addEventListener("click", handleRedo);

    return () => {
      window.removeEventListener("keyup", handleKey);
      window.removeEventListener("keydown", handleKey);
      undoBtn?.removeEventListener("click", handleUndo);
      redoBtn?.removeEventListener("click", handleRedo);
    };
  }, [canvasRef, dragging, handleRedo, handleUndo, redoRef, undoRef]);

  useEffect(() => {
    if (ctx) socket.emit("joined_room");
  }, [ctx]);

  const addLayer = () => {
    setLayers((prevLayers) => [...prevLayers, { strokes: [] }]);
  };

  const removeLayer = (index: number) => {
    setLayers((prevLayers) => prevLayers.filter((_, i) => i !== index));
  };

  return (
    <div className="relative h-full w-full overflow-hidden">
      <motion.canvas
        // SETTINGS
        ref={canvasRef}
        width={CANVAS_SIZE.width}
        height={CANVAS_SIZE.height}
        className={`absolute top-0 z-10 ${dragging && "cursor-move"}`}
        style={{ x, y }}
        // DRAG
        drag={dragging}
        dragConstraints={{
          left: -(CANVAS_SIZE.width - width),
          right: 0,
          top: -(CANVAS_SIZE.height - height),
          bottom: 0,
        }}
        dragElastic={0}
        dragTransition={{ power: 0, timeConstant: 0 }}
        // HANDLERS
        onMouseDown={(e) => handleStartDrawing(e.clientX, e.clientY)}
        onMouseUp={handleEndDrawing}
        onMouseMove={(e) => {
          handleDraw(e.clientX, e.clientY, e.shiftKey);
        }}
        onTouchStart={(e) =>
          handleStartDrawing(
            e.changedTouches[0].clientX,
            e.changedTouches[0].clientY
          )
        }
        onTouchEnd={handleEndDrawing}
        onTouchMove={(e) =>
          handleDraw(e.changedTouches[0].clientX, e.changedTouches[0].clientY)
        }
      />
      <Background bgRef={bgRef} />

      <MiniMap dragging={dragging} />
      <button
        className={`absolute bottom-14 right-5 z-10 rounded-xl md:bottom-5 ${
          dragging ? "bg-green-500" : "bg-zinc-300 text-black"
        } p-3 text-lg text-white`}
        onClick={() => setDragging((prev) => !prev)}
      >
        <BsArrowsMove />
      </button>

      <button
        className="absolute bottom-14 left-5 z-10 ml-[100px] rounded-xl bg-blue-500 p-3 text-lg text-white md:bottom-5"
        onClick={addLayer}
      >
        Add Layer
      </button>

      {/* NOT WORKING CURRENTLY */}
      {layers.length > 1 && (
        <div className="absolute  bottom-14 left-16 z-10 ml-[80px] mb-[20px]">
          {layers.map((_, index) => (
            <button
              key={index}
              className="mr-2 rounded bg-red-500 p-2 text-white"
              onClick={() => removeLayer(index)}
            >
              Remove Layer {index + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Canvas;
