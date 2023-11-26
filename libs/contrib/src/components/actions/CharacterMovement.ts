import { ActionMap, AnimationKeys, Character, Position } from "@piggo-legends/contrib"
import { Entity } from "@piggo-legends/core";

const speed = 1;

export type CharacterMovementCommands = "up" | "down" | "left" | "right" | "upleft" | "upright" | "downleft" | "downright";

export const CharacterMovement: ActionMap<CharacterMovementCommands> = {
  "upleft": (entity: Entity) => setPosAndAnimation(entity, "ul", (position) => { position.x -= speed }),
  "upright": (entity: Entity) => setPosAndAnimation(entity, "ur", (position) => { position.y -= speed }),
  "downleft": (entity: Entity) => setPosAndAnimation(entity, "dl", (position) => { position.y += speed }),
  "downright": (entity: Entity) => setPosAndAnimation(entity, "dr", (position) => { position.x += speed }),
  "up": (entity: Entity) => {
    setPosAndAnimation(entity, "u", (position) => {
      const screenXY = position.toScreenXY();
      position.fromScreenXY(screenXY.x, screenXY.y - speed);
    });
  },
  "down": (entity: Entity) => {
    setPosAndAnimation(entity, "d", (position) => {
      const screenXY = position.toScreenXY();
      position.fromScreenXY(screenXY.x, screenXY.y + speed);
    });
  },
  "left": (entity: Entity) => {
    setPosAndAnimation(entity, "l", (position) => {
      const screenXY = position.toScreenXY();
      position.fromScreenXY(screenXY.x - speed, screenXY.y);
    });
  },
  "right": (entity: Entity) => {
    setPosAndAnimation(entity, "r", (position) => {
      const screenXY = position.toScreenXY();
      position.fromScreenXY(screenXY.x + speed, screenXY.y);
    });
  },
}

const setPosAndAnimation = (entity: Entity, animation: AnimationKeys, changePos: (position: Position) => void) => {
  const position = entity.components.position as Position;
  changePos(position);
  (entity.components.renderable as Character).setAnimation(animation);
}
