import { Entity, Collider, Debug, Networked, Position, Renderable, NPC } from "@piggo-legends/core";
import { Text } from "pixi.js";

export type BallProps = {
  id?: string
  position?: { x: number, y: number }
}

export const Ball = ({ position, id }: BallProps = { position: { x: 50, y: 50 } }): Entity => ({
  id: id ?? `ball${Math.trunc(Math.random() * 100)}`,
  components: {
    position: new Position(position),
    networked: new Networked({ isNetworked: true }),
    collider: new Collider({
      radius: 7,
      frictionAir: 0.01,
      mass: 20,
      restitution: 0.8
    }),
    debug: new Debug(),
    npc: new NPC({
      onTick: (e: Entity<Position>) => {
        const { velocityX, velocityY } = e.components.position.data;
        e.components.position.data.rotation += 0.08 * Math.sqrt((velocityX * velocityX) + (velocityY * velocityY));
      }
    }),
    renderable: new Renderable({
      zIndex: 3,
      rotates: true,
      container: async () => {
        const text = new Text("⚽️", { fill: "#FFFFFF", fontSize: 18 })
        text.anchor.set(0.43, 0.44);
        return text;
      }
    })
  }
});
