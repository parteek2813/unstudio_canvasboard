import { RefObject, useEffect } from "react";

import { motion } from "framer-motion";

import { CANVAS_SIZE } from "@/common/constants/canvasSize";
import { useBackground } from "@/common/recoil/background";

import { useBoardPosition } from "../../hooks/useBoardPosition";

const Background = ({ bgRef }: { bgRef: any }) => {
  const bg = useBackground();

  console.log(bg);

  const { x, y } = useBoardPosition();

  useEffect(() => {
    const ctx = bgRef.current?.getContext("2d");
    console.log("Inside background. tsx useEffect");

    if (ctx) {
      ctx.fillStyle = bg.mode === "dark" ? "#222" : "#fff";
      ctx.fillRect(0, 0, CANVAS_SIZE.width, CANVAS_SIZE.height);

      document.body.style.backgroundColor =
        bg.mode === "dark" ? "#222" : "#fff";
    }
  }, [bgRef, bg]);

  return (
    <motion.canvas
      ref={bgRef}
      width={CANVAS_SIZE.width}
      height={CANVAS_SIZE.height}
      className="absolute top-0 bg-zinc-100"
      style={{ x, y }}
    />
  );
};

export default Background;
