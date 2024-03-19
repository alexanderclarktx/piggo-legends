import { Renderer, World, IsometricWorld } from "@piggo-gg/core";
import { Legends, Soccer, Strike } from "@piggo-gg/games";
import React, { useEffect } from "react";

export type GameCanvasProps = {
  setWorld: (_: World) => void
}

export const GameCanvas = ({ setWorld }: GameCanvasProps) => {

  useEffect(() => {
    const renderer = new Renderer({
      canvas: document.getElementById("canvas") as HTMLCanvasElement,
      width: window.innerWidth * 0.98,
      height: window.innerHeight * 0.90
    });

    renderer.init().then(() => {
      const world = IsometricWorld({ renderer, runtimeMode: "client", games: [Soccer, Strike, Legends] });
      setWorld(world);
    })
  }, []);

  return (
    <canvas id="canvas" />
  );
}
