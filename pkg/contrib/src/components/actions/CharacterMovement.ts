import { ActionMap, Character, Position } from "@piggo-legends/contrib"
import { Entity,  Game, GameProps } from "@piggo-legends/core";

const speed = 1;

export const CharacterMovement: ActionMap = {
  "upleft": (entity: Entity, _: Game<GameProps>) => {
    const position = entity.components.position as Position;
    position.x -= speed * 1.414213562373095;
    position.y -= speed * 0.7212489168102785;
    position.x = +(position.x.toFixed(2));
    position.y = +(position.y.toFixed(2));

    const character = entity.components.renderable as Character;
    character.setAnimation("ul");
  },
  "upright": (entity: Entity, _: Game<GameProps>) => {
    const position = entity.components.position as Position;
    position.x += speed * 1.414213562373095;
    position.y -= speed * 0.7212489168102785;
    position.x = +(position.x.toFixed(2));
    position.y = +(position.y.toFixed(2));

    const character = entity.components.renderable as Character;
    character.setAnimation("ur");
  },
  "downleft": (entity: Entity, _: Game<GameProps>) => {
    const position = entity.components.position as Position;
    position.x -= speed * 1.414213562373095;
    position.y += speed * 0.7212489168102785;
    position.x = +(position.x.toFixed(2));
    position.y = +(position.y.toFixed(2));

    const character = entity.components.renderable as Character;
    character.setAnimation("dl");
  },
  "downright": (entity: Entity, _: Game<GameProps>) => {
    const position = entity.components.position as Position;
    position.x += speed * 1.414213562373095;
    position.y += speed * 0.7212489168102785;
    position.x = +(position.x.toFixed(2));
    position.y = +(position.y.toFixed(2));

    const character = entity.components.renderable as Character;
    character.setAnimation("dr");
  },
  "up": (entity: Entity, _: Game<GameProps>) => {
    const position = entity.components.position as Position;
    position.y -= speed

    const character = entity.components.renderable as Character;
    character.setAnimation("u");
  },
  "down": (entity: Entity, _: Game<GameProps>) => {
    const position = entity.components.position as Position;
    position.y += speed

    const character = entity.components.renderable as Character;
    character.setAnimation("d");
  },
  "left": (entity: Entity, _: Game<GameProps>) => {
    const position = entity.components.position as Position;
    position.x -= speed;

    const character = entity.components.renderable as Character;
    character.setAnimation("l");
  },
  "right": (entity: Entity, _: Game<GameProps>) => {
    const position = entity.components.position as Position;
    position.x += speed;

    const character = entity.components.renderable as Character;
    character.setAnimation("r");
  }
}
