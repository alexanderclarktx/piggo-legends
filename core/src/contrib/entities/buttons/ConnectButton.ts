import { Button, Clickable, Entity, Position, World, DelayClientSystem, Action } from "@piggo-gg/core";
import { Text } from "pixi.js";

export const ConnectButton = () => Entity({
  id: "connectButton",
  persists: true,
  components: {
    position: new Position({ x: 75, y: 5, screenFixed: true }),
    clickable: new Clickable({
      width: 80, height: 32, active: true,
      click: Action((_, __, world: World) => {
        if (world) world.addSystemBuilders([DelayClientSystem]);
      })
    }),
    renderable: Button({
      dims: { w: 72, textX: 8, textY: 5 },
      zIndex: 1,
      text: new Text({ text: "connect", style: { fill: "#FFFFFF", fontSize: 16 } }),
    })
  }
})
