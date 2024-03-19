import { IsometricWorld, Noob, DelayTickData, World, DelayServerSystem } from "@piggo-gg/core";
import { Legends, Soccer, Strike } from "@piggo-gg/games";
import { PerClientData } from "@piggo-gg/server";
import { ServerWebSocket } from "bun";

export type WS = ServerWebSocket<PerClientData>

export type WorldManager = {
  world: World
  clients: Record<string, WS>
  handleMessage: (ws: WS, msg: string) => void
  handleClose: (ws: WS) => void
}

export type WorldManagerProps = {
  clients?: Record<string, WS>
}

export const WorldManager = ({ clients = {} }: WorldManagerProps = {}): WorldManager => {

  const world = IsometricWorld({ runtimeMode: "server", games: [Soccer, Legends, Strike] });

  const latestClientMessages: Record<string, { td: DelayTickData, latency: number }> = {};

  const handleClose = (ws: WS) => {

    // remove player entity
    world.removeEntity(ws.data.playerName!);

    // remove from clients
    delete clients[ws.remoteAddress];

    console.log(`${ws.data.playerName} disconnected`);
  }

  const handleMessage = (ws: WS, msg: string) => {
    const now = Date.now();
    const parsedMessage = JSON.parse(msg) as DelayTickData;

    let messages = latestClientMessages[parsedMessage.player];

    // add player entity if it doesn't exist
    if (!world.entities[parsedMessage.player]) {
      ws.data.playerName = parsedMessage.player;

      clients[parsedMessage.player] = ws;

      console.log(`${ws.data.playerName} connected ${ws.remoteAddress}`);

      world.addEntity(Noob({ id: parsedMessage.player }));
    }

    // ignore messages from the past
    if (messages && (parsedMessage.tick < messages.td.tick)) {
      console.log(`got old:${parsedMessage.tick} vs:${messages.td.tick} world:${world.tick}`);
      // return;
    };

    // store last message for client
    latestClientMessages[parsedMessage.player] = {
      td: parsedMessage,
      latency: now - parsedMessage.timestamp
    }

    // debug log
    if (world.tick % 100 === 0) console.log(`world:${world.tick} msg:${parsedMessage.tick} diff:${world.tick - parsedMessage.tick}`);
    // if ((world.tick - parsedMessage.tick) >= 0) console.log(`missed ${parsedMessage.player} tick${parsedMessage.tick} server:${world.tick}`)

    // process message actions
    if (parsedMessage.actions) {
      Object.keys(parsedMessage.actions).forEach((entityId) => {
        if (world.entities[entityId]?.components.controlled?.data.entityId === parsedMessage.player) {
          world.actionBuffer.set(world.tick + 1, entityId, parsedMessage.actions[entityId]);
        }
      });
    }

    // process message chats
    if (parsedMessage.chats) {
      Object.keys(parsedMessage.chats).map(Number).forEach((tick) => {

        // ignore chats from the past
        if (tick < world.tick) return;

        // add chats for the player
        Object.keys(parsedMessage.chats[tick]).forEach((entityId) => {
          if (entityId === parsedMessage.player) {
            world.chatHistory.set(tick, entityId, parsedMessage.chats[entityId]);
          }
        });
      });
    }
  }

  world.addSystems([DelayServerSystem({ world, clients, latestClientMessages })]);

  return {
    world,
    clients,
    handleMessage,
    handleClose
  }
}
