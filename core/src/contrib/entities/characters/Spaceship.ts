import { Actions, Clickable, Collider, Controller, Debug, Entity, Networked, Position, Renderable, VehicleMovement, VehicleMovementActions, PlayerControlsEntity } from "@piggo-gg/core";
import { AnimatedSprite } from "pixi.js";

export type SpaceshipProps = {
  id?: string
  position?: { x: number, y: number }
}

export const Spaceship = ({ id, position }: SpaceshipProps = {}) => Entity({
  id: id ?? `spaceship${Math.trunc(Math.random() * 100)}`,
  components: {
    position: new Position(position ?? { x: Math.random() * 600, y: Math.random() * 600 }),
    networked: new Networked({ isNetworked: true }),
    clickable: new Clickable({
      width: 100,
      height: 120,
      active: true,
      click: PlayerControlsEntity
    }),
    collider: new Collider({ shape: "cuboid", radius: 60 }),
    controller: new Controller<VehicleMovementActions>({
      keyboard: {
        "a,d": null, "w,s": null,
        "shift,a": { action: "skidleft", params: {} },
        "shift,d": { action: "skidright", params: {} },
        "w": { action: "up", params: {} },
        "s": { action: "down", params: {} },
        "a": { action: "left", params: {} },
        "d": { action: "right", params: {} }
      }
    }),
    debug: new Debug(),
    actions: new Actions(VehicleMovement),
    renderable: new Renderable({
      rotates: true,
      zIndex: 3,
      setup: async (r: Renderable) => {
        const texture = (await r.loadTextures("spaceship.json"))["spaceship"];
        const sprite = new AnimatedSprite([texture]);
        sprite.scale = { x: 2, y: 2 };
        sprite.anchor.set(0.5, 0.5);
        r.c = sprite;
      }
    })
  }
});
