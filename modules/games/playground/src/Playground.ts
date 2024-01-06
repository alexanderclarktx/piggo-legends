import {
  DebugSystem, InputSystem, ClickableSystem, Networked, Player, PlayerSpawnSystem, RenderSystem, Ball, DebugButton, FpsText,
  FullscreenButton, Spaceship, PhysicsSystem, Cursor, Chat, TileFloor, CommandSystem, RtcNetcodeSystem, NPCSystem, Zombie, GuiSystem
} from "@piggo-legends/contrib";
import { Game, GameProps } from "@piggo-legends/core";

export class Playground extends Game {

  constructor(props: GameProps = {}) {
    super({
      ...props,
      mode: "isometric"
    });

    // add shared systems
    this.addSystemBuilders([ CommandSystem, PhysicsSystem, PlayerSpawnSystem, NPCSystem ]);

    // add client-only systems/entities
    if (props.renderer) {
      this.addSystemBuilders([ InputSystem, ClickableSystem, RenderSystem, DebugSystem, RtcNetcodeSystem, GuiSystem ]);
      this.addUI();
      this.addFloor();
    }

    this.addPlayer();
    this.addGameObjects();
  }

  addPlayer = () => {
    this.addEntity({
      id: this.thisPlayerId,
      components: {
        networked: new Networked({ isNetworked: true }),
        player: new Player({ name: this.thisPlayerId }),
      }
    });
  }

  addUI = async () => {
    this.addEntity(FpsText());
    this.addEntity(FullscreenButton());
    this.addEntity(DebugButton());
    this.addEntity(Cursor());
    this.addEntity(Chat());
  }

  addGameObjects = async () => {
    this.addEntity(Ball());
    this.addEntity(await Spaceship());

    this.addEntity(await Zombie());
    this.addEntity(await Zombie());
    this.addEntity(await Zombie());
    this.addEntity(await Zombie());
    this.addEntity(await Zombie());
  }

  addFloor = async () => {
    this.addEntity(await TileFloor({ rows: 25, cols: 25, position: { x: 0, y: 0 } }));
  }
}
