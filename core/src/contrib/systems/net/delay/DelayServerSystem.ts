import { System, DelayTickData, World } from "@piggo-gg/core";

export type DelayServerSystemProps = {
  world: World
  clients: Record<string, { send: (_: string) => number }>
  latestClientMessages: Record<string, { td: DelayTickData, latency: number }[]>
}

export const DelayServerSystem = ({ world, clients, latestClientMessages }: DelayServerSystemProps): System => {

  const sendMessage = () => {

    // build tick data
    const tickData: DelayTickData = {
      type: "game",
      player: "server",
      tick: world.tick,
      timestamp: Date.now(),
      serializedEntities: world.entitiesAtTick[world.tick],
      actions: world.actionBuffer.atTick(world.tick) ?? {},
      chats: world.chatHistory.atTick(world.tick) ?? {}
    };

    // send tick data to all clients
    Object.entries(clients).forEach(([id, client]) => {
      client.send(JSON.stringify({
        ...tickData,
        latency: latestClientMessages[id]?.[0]?.latency,
      }));
    })
  }

  const handleMessage = () => {
    Object.keys(latestClientMessages).forEach((client) => {
      if (world.tick % 100 === 0) console.log("messages", latestClientMessages[client].length);
      // if (latestClientMessages[client].length > 3) handleMessage();
      // if (latestClientMessages[client].length <= 1) return;

      let messages: ({ td: DelayTickData, latency: number } | undefined)[];

      if (latestClientMessages[client].length > 2) {
        messages = [latestClientMessages[client].at(0), latestClientMessages[client].at(1)]
      } else {
        messages = [latestClientMessages[client].at(0)]
      }
      if (messages.length === 0) return;

      messages.forEach((message) => {
        if (!message) return;

        // process message actions
        if (message.td.actions) {
          Object.keys(message.td.actions).forEach((entityId) => {
            if (world.entities[entityId]?.components.controlled?.data.entityId === client) {
              world.actionBuffer.set(world.tick + 1, entityId, message.td.actions[entityId]);
            }
          });
        }

        // process message chats
        if (message.td.chats) {
          Object.keys(message.td.chats).map(Number).forEach((tick) => {

            // add chats for the player
            Object.keys(message.td.chats[tick]).forEach((entityId) => {
              if (entityId === client) {
                world.chatHistory.set(tick, entityId, message.td.chats[entityId]);
              }
            });
          });
        }
      });
    });
  }

  const onTick = () => {
    sendMessage();
    handleMessage();
    Object.keys(latestClientMessages).forEach((client) => latestClientMessages[client].shift());
  }

  return {
    id: "DelayServerSystem",
    onTick
  }
}
