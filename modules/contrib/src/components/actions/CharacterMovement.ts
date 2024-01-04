import { ActionMap, AnimationKeys, Character, Position, Renderable } from "@piggo-legends/contrib"
import { Entity } from "@piggo-legends/core";

const speed = 2;

export type CharacterMovementCommands = "up" | "down" | "left" | "right" | "upleft" | "upright" | "downleft" | "downright";

export const CharacterMovementScreenPixels: ActionMap<CharacterMovementCommands> = {
  "upleft":    (entity: Entity) => setPosAndAnimation(entity, "ul", (position) => position.x -= speed),
  "upright":   (entity: Entity) => setPosAndAnimation(entity, "ur", (position) => position.y -= speed),
  "downleft":  (entity: Entity) => setPosAndAnimation(entity, "dl", (position) => position.y += speed),
  "downright": (entity: Entity) => setPosAndAnimation(entity, "dr", (position) => position.x += speed),
  "up": (entity: Entity) => setPosAndAnimation(entity, "u", (position) => {
    const screenXY = position.toScreenXY();
    position.fromScreenXY(screenXY.x, screenXY.y - speed);
  }),
  "down": (entity: Entity) => setPosAndAnimation(entity, "d", (position) => {
    const screenXY = position.toScreenXY();
    position.fromScreenXY(screenXY.x, screenXY.y + speed);
  }),
  "left": (entity: Entity) => setPosAndAnimation(entity, "l", (position) => {
    const screenXY = position.toScreenXY();
    position.fromScreenXY(screenXY.x - speed, screenXY.y);
  }),
  "right": (entity: Entity) => setPosAndAnimation(entity, "r", (position) => {
    const screenXY = position.toScreenXY();
    position.fromScreenXY(screenXY.x + speed, screenXY.y);
  })
}

export const CharacterMovementWorldPixels: ActionMap<CharacterMovementCommands> = {
  "upleft": (entity: Entity) => setPosAndAnimation(entity, "u", moveXY(-speed, -speed)),
  "upright": (entity: Entity) => setPosAndAnimation(entity, "r", moveXY(speed, -speed)),
  "downleft": (entity: Entity) => setPosAndAnimation(entity, "l", moveXY(-speed, speed)),
  "downright": (entity: Entity) => setPosAndAnimation(entity, "d", moveXY(speed, speed)),
  "up": (entity: Entity) => setPosAndAnimation(entity, "u", moveXY(0, speed)),
  "down": (entity: Entity) => setPosAndAnimation(entity, "d", moveXY(0, -speed)),
  "left": (entity: Entity) => setPosAndAnimation(entity, "l", moveXY(-speed, 0)),
  "right": (entity: Entity) => setPosAndAnimation(entity, "r", moveXY(speed, 0))
}

const moveXY = (dx: number, dy: number) => (position: Position) => {

  if (dx && dy) {
    // normalize the vector
    const length = Math.sqrt(dx * dx + dy * dy);
    dx /= length;
    dy /= length;
  }
  position.x += dx;
  position.y += dy;
}

const setPosAndAnimation = (entity: Entity, animation: AnimationKeys, move: (position: Position) => void) => {
  const { position, renderable } = entity.components as { position: Position, renderable: Renderable };
  move(position);

  const character = renderable.r as Character;
  if (character) character.setAnimation(animation);
}
