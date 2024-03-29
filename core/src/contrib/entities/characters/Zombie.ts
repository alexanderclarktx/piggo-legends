import { Action, Actions, Clickable, Collider, Debug, Entity, NPC, Networked, Position, PositionProps, Projectile, Renderable, ZombieMovement, ZombieMovementActions } from "@piggo-gg/core";
import { AnimatedSprite } from "pixi.js";

export type ZombieProps = {
  id: string
  color?: number
  positionProps?: PositionProps
}

export const Zombie = ({ id, color, positionProps = { renderMode: "isometric", x: 100, y: 100 } }: ZombieProps) => Entity({
  id,
  components: {
    position: new Position({ ...positionProps, velocityResets: 1 }),
    networked: new Networked({ isNetworked: true }),
    clickable: new Clickable({
      width: 32,
      height: 32,
      active: true,
      click: Action((_, __, world) => {
        if (world.clientPlayerId) {
          world.addEntity(Projectile({ radius: 5 }));
        }
      })
    }),
    npc: new NPC<ZombieMovementActions>({
      onTick: (_) => ({ action: "chase", params: {} })
    }),
    actions: new Actions(ZombieMovement),
    collider: new Collider({ shape: "ball", radius: 8, mass: 300 }),
    debug: new Debug(),
    renderable: new Renderable({
      scale: 2,
      zIndex: 3,
      color: color ?? 0x00ff00,
      scaleMode: "nearest",
      anchor: { x: 0.5, y: 0.7 },
      setup: async (r: Renderable) => {
        const textures = await r.loadTextures("chars.json")
        r.animations = {
          d: new AnimatedSprite([textures["d1"], textures["d2"], textures["d3"]]),
          u: new AnimatedSprite([textures["u1"], textures["u2"], textures["u3"]]),
          l: new AnimatedSprite([textures["l1"], textures["l2"], textures["l3"]]),
          r: new AnimatedSprite([textures["r1"], textures["r2"], textures["r3"]]),
          dl: new AnimatedSprite([textures["dl1"], textures["dl2"], textures["dl3"]]),
          dr: new AnimatedSprite([textures["dr1"], textures["dr2"], textures["dr3"]]),
          ul: new AnimatedSprite([textures["ul1"], textures["ul2"], textures["ul3"]]),
          ur: new AnimatedSprite([textures["ur1"], textures["ur2"], textures["ur3"]])
        }
      }
    })
  }
});
