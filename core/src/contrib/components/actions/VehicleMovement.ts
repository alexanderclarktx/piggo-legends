import { Entity, ActionMap, Position, Action } from "@piggo-gg/core";

const TURN_SPEED = 0.1;
const SLIDE_FACTOR = 1.5;
const SPEED = 200;

export type VehicleMovementActions = "up" | "down" | "left" | "right" | "skidleft" | "skidright";

export const VehicleMovement: ActionMap<VehicleMovementActions> = {
  "up": Action((_, { components: { position } }: Entity<Position>) => {
    const x = Math.cos(position.data.rotation - Math.PI / 1.35) * SPEED;
    const y = Math.sin(position.data.rotation - Math.PI / 1.35) * SPEED;
    position.setVelocity({ x, y });
  }),
  "down": Action((_, { components: { position } }: Entity<Position>) => position.setVelocity({ x: 0, y: 0 })),
  "left": Action((_, { components: { position } }: Entity<Position>) => position.rotateDown(TURN_SPEED)),
  "right": Action((_, { components: { position } }: Entity<Position>) => position.rotateUp(TURN_SPEED)),
  "skidleft": Action((_, { components: { position } }: Entity<Position>) => position.rotateDown(TURN_SPEED * SLIDE_FACTOR)),
  "skidright": Action((_, { components: { position } }: Entity<Position>) => position.rotateUp(TURN_SPEED * SLIDE_FACTOR))
}
