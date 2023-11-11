import { Entity, EntityProps, Game, GameProps, RtcPeer, RtcPool, System, SystemProps } from "@piggo-legends/core";
import { Controlled, Player, Position, SerializedPosition } from "@piggo-legends/contrib";

export type TickData = {
  type: "game",
  tick: number,
  player: string,
  entities: Record<string, SerializedEntity>
}

export type SerializedEntity = {
  position?: SerializedPosition
}

export type NetcodeSystemProps = SystemProps & {
  net: RtcPool,
  player: string
}

type PeerState = { connected: boolean, connection: RtcPeer, buffer: TickData | null }

export class NetcodeSystem extends System<NetcodeSystemProps> {
  componentTypeQuery = ["networked"];

  peers: Record<string, PeerState> = {};

  constructor(props: NetcodeSystemProps) {
    super(props);
  }

  onTick = (entities: Entity<EntityProps>[], game: Game<GameProps>) => {
    // handle new peers
    for (const name in this.props.net.connections) {
      if (!this.peers[name]) {
        // add peer to peerStates
        this.peers[name] = { connected: false, connection: this.props.net.connections[name], buffer: null };

        // handle incoming messages from the peer
        this.peers[name].connection.events.addEventListener("message", (event: CustomEvent<any>) => {
          if (event.detail.type === "game") {
            this.peers[name].buffer = event.detail as TickData;
          } else if (event.detail.type === "init") {
            this.handleInitialConnection(event.detail as TickData, game);
          }
        });
      }
    }

    // handle incoming tick data
    for (const peer of Object.values(this.peers)) {
      this.handleMessage(peer, game);
    }

    // send tick data
    this.sendMessage(entities, game);
  }

  handleMessage = (peer: PeerState, game: Game<GameProps>) => {
    if (peer.buffer) {
      // handle initial connection if peer is new
      if (!peer.connected) {
        this.handleInitialConnection(peer.buffer, game);
        peer.connected = true;
      }
      
      // debug log
      // if (peer.buffer.tick % 1000 === 0) console.log("received", peer.buffer);

      // update each entity
      Object.entries(peer.buffer.entities).forEach(([id, entity]) => {
        if (game.props.entities[id]) {
          const controlled = game.props.entities[id].components.controlled as Controlled;
          if (controlled && controlled.entityId === this.props.player) return;
  
          const position = game.props.entities[id].components.position as Position;
          if (position && entity.position) {
            position.deserialize(entity.position)
          }
        }
      });
    }

    // clear peer's buffer
    peer.buffer = null;
  }

  handleInitialConnection = (td: TickData, game: Game<GameProps>) => {
    console.log("adding entity");
    game.addEntity(new Entity({
      id: td.player,
      networked: true,
      components: {
        player: new Player({ name: td.player }),
      },
    }));
  }

  sendMessage = (entities: Entity<EntityProps>[], game: Game<GameProps>) => {
    const serializedEntitites: Record<string, SerializedEntity> = {};

    // serialize each entity
    for (const entity of Object.values(entities)) {
      let serialized: SerializedEntity = {};

      const position = entity.components.position as Position;
      if (position) {
        serialized.position = position.serialize();
      }

      serializedEntitites[entity.id] = serialized;
    }

    // construct tick message
    const message: TickData = {
      type: "game",
      tick: game.tick,
      player: this.props.player,
      entities: serializedEntitites
    }

    // send message to each connected peer
    for (const peer of Object.values(this.peers)) {
      if (peer.connection.pc.connectionState === "connected") {
        peer.connection.sendMessage(message);
        // if (game.tick % 1000 === 0) console.log("sent", message);
      }
    }
  }
}