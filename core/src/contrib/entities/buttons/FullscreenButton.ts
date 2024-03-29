import { Action, Button, Clickable, Entity, Position, World } from "@piggo-gg/core";
import { Text } from "pixi.js";

export const FullscreenButton = (id: string = "fullscreenButton") => Entity({
  id: id,
  persists: true,
  components: {
    position: new Position({
      x: 5, y: 5, screenFixed: true
    }),
    clickable: new Clickable({
      active: true,
      width: 32,
      height: 30,
      click: Action((_, __, world: World) => {
        if (!document.fullscreenElement) {
          world.renderer?.app.canvas.requestFullscreen?.();
        } else {
          document.exitFullscreen();
        }
      })
    }),
    renderable: Button({
      dims: { w: 32, textX: 8, textY: 5 },
      zIndex: 4,
      text: (new Text({ text: "⚁", style: { fill: "#FFFFFF", fontSize: 16 } }))
    })
  }
});
