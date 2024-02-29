import { Playa, TickData, World, WorldBuilder, WsServerSystem } from "@piggo-legends/core";
import { PerClientData } from "@piggo-legends/server";
import { ServerWebSocket } from "bun";

export type WS = ServerWebSocket<PerClientData>

export type WorldManager = {
  world: World
  clients: Record<string, WS>
  handleMessage: (ws: WS, msg: string) => void
  handleClose: (ws: WS) => void
}

export type WorldManagerProps = {
  worldBuilder: WorldBuilder
  clients: Record<string, WS>
}

export const WorldManager = ({ worldBuilder, clients }: WorldManagerProps ): WorldManager => {

  const world = worldBuilder({ runtimeMode: "server" })
  const clientMessages: Record<string, { td: TickData, latency: number }> = {};

  const handleClose = (ws: WS) => {

    // remove player entity
    world.removeEntity(ws.data.playerName!);

    // remove from clients
    delete clients[ws.remoteAddress];

    console.log(`${ws.data.playerName} disconnected`);
  }

  const handleMessage = (ws: WS, msg: string) => {
    const now = Date.now();
    const parsedMessage = JSON.parse(msg) as TickData;

    // add player entity if it doesn't exist
    if (!world.entities[parsedMessage.player]) {
      ws.data.playerName = parsedMessage.player;

      clients[parsedMessage.player] = ws;

      console.log(`${ws.data.playerName} connected ${ws.remoteAddress}`);

      world.addEntity(Playa({ id: parsedMessage.player }));
    }

    // ignore messages from the past
    if (clientMessages[ws.remoteAddress] && (parsedMessage.tick < clientMessages[ws.remoteAddress].td.tick)) {
      console.log(`got old:${parsedMessage.tick} vs:${clientMessages[ws.remoteAddress].td.tick} world:${world.tick}`);
      return;
    };

    // store last message for client
    clientMessages[parsedMessage.player] = {
      td: parsedMessage,
      latency: now - parsedMessage.timestamp
    }

    // debug log
    if (world.tick % 50 === 0) console.log(`now:${now} ts:${parsedMessage.timestamp} diff:${now - parsedMessage.timestamp}`);
    if (world.tick % 50 === 0) console.log(`world:${world.tick} msg:${parsedMessage.tick} diff:${world.tick - parsedMessage.tick}`);
    if ((world.tick - parsedMessage.tick) >= 0) console.log(`missed tick${parsedMessage.tick} diff:${world.tick - parsedMessage.tick}`)

    // process message actions
    if (parsedMessage.actions) {
      Object.keys(parsedMessage.actions).forEach((cmdTickString) => {
        const cmdTick = Number(cmdTickString);

        // ignore actions from the past
        if (cmdTick < world.tick) return;

        // create local action buffer for this tick if it doesn't exist
        if (!world.localActionBuffer[cmdTick]) world.localActionBuffer[cmdTick] = {};

        // add actions for the player or entities controlled by the player
        Object.keys(parsedMessage.actions[cmdTick]).forEach((entityId) => {
          if (world.entities[entityId]?.components.controlled?.data.entityId === parsedMessage.player) {
            world.localActionBuffer[cmdTick][entityId] = parsedMessage.actions[cmdTick][entityId];
          }
        });
      });
    }
  }

  world.addSystems([WsServerSystem({ world, clients, clientMessages })]);

  return {
    world,
    clients,
    handleMessage,
    handleClose
  }
}