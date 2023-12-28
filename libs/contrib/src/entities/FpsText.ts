import { Entity, Game } from "@piggo-legends/core";
import { Position, Renderable, TextBox } from "@piggo-legends/contrib";
import { HTMLText } from "pixi.js";

export type FpsTextProps = {
  x?: number,
  y?: number,
  color?: number
}

export const FpsText = ({ x, y, color }: FpsTextProps = {}): Entity => {
  return {
    id: "fpsText",
    components: {
      position: new Position({
        x: x ?? -35, y: y ?? 5, screenFixed: true
      }),
      renderable: new Renderable({
        debuggable: true,
        color: color ?? 0xFFFF00,
        zIndex: 1,
        container: async () => new HTMLText("ABC", { fontSize: 16, fill: "#FFFFFF" }),
        dynamic: (t: HTMLText, _, g: Game) => {
          if (g.tick % 10 !== 0) return;
          const fps = Math.round(g.renderer?.app.ticker.FPS ?? 0);
          const color = fps > 100 ? "#00ff00" : fps > 60 ? "yellow" : "red";
          t.text = `<span style=color:${color}>${fps}</span>`;
        },
      })
    }
  }
}
