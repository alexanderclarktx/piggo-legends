import { Entity, Game, GameProps, Renderer, System } from "@piggo-legends/core";
import { Controlling, Skelly } from "@piggo-legends/contrib";

export type PlayerSpawnSystemProps = {
  renderer?: Renderer,
  thisPlayerId: string
}

// PlayerSpawnSystem handles spawning characters for players
export const PlayerSpawnSystem = ({ thisPlayerId, renderer }: PlayerSpawnSystemProps): System => {
  let componentTypeQuery = ["player"];
  let playersWithCharacters: Record<string, Entity> = {};

  const onTick = (players: Entity[], game: Game<GameProps>) => {
    for (const player of players) {
      if (!playersWithCharacters[player.id]) {
        spawnCharacterForPlayer(player, game, thisPlayerId === player.id ? 0xffffff : 0xffff00);
        playersWithCharacters[player.id] = player
      }
    }
  }

  const spawnCharacterForPlayer = async (player: Entity, game: Game<GameProps>, color: number) => {
    const characterForPlayer = await Skelly(`${player.id}-character`, renderer, color);

    // give the player control of the character
    player.components.controlling = new Controlling({ entityId: characterForPlayer.id });
    characterForPlayer.components.controlled = new Controlling({ entityId: player.id });
    game.addEntity(characterForPlayer);
  }

  return {
    componentTypeQuery,
    onTick
  }
}
