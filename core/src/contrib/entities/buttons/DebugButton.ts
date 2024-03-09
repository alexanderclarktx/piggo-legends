import { Entity, ValidAction, World } from "@piggo-gg/core";
import { Button, Clickable, Position } from "@piggo-gg/core";
import { Text } from "pixi.js";

export const DebugButton = (): Entity => {

  let pressed = false;

  const debugButton = {
    id: "debugButton",
    components: {
      position: new Position({ x: 40, y: 5, screenFixed: true }),
      clickable: new Clickable({
        width: 32, height: 32, active: true,
        click: ValidAction((_, world: World) => {
          pressed = !pressed;
          if (pressed) {
            const r = debugButton.components.renderable as Button;
            r.shadow.tint = 0xff0000;
            r.outline.tint = 0xff0000;
            if (world.renderer) world.debug = true;
          } else {
            const r = debugButton.components.renderable as Button;
            r.shadow.tint = 0x00FFFF;
            r.outline.tint = 0x00FFFF;
            if (world.renderer) world.debug = false;
          }
        })
      }),
      renderable: new Button({
        dims: { w: 32, textX: 8, textY: 5 },
        zIndex: 4,
        text: new Text("🔍", { fill: "#FFFFFF", fontSize: 16 }),
      })
    }
  }
  return debugButton;
}