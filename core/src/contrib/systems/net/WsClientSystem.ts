import { Entity, SystemBuilder, TickData, World } from "@piggo-legends/core";

const servers = {
  dev: "ws://localhost:3000",
  staging: "wss://piggo-legends-staging.up.railway.app",
  production: "wss://api.piggo.gg"
} as const;

// WssNetcodeSystem handles networked entities over WebSockets
export const WsClientSystem: SystemBuilder = ({ world, clientPlayerId }) => {
  const wsClient = new WebSocket(servers.production);
  // const wsClient = new WebSocket(servers.staging);
  // const wsClient = new WebSocket(servers.dev);

  let lastLatency = 0;

  setInterval(() => {
    if (lastMessageTick && ((world.tick - lastMessageTick) < 500)) {
      world.isConnected = true;
    } else {
      world.isConnected = false;
    }
  }, 200);

  let lastMessageTick: number = 0;
  let latestServerMessage: TickData | null = null;

  wsClient.onmessage = (event) => {
    const message = JSON.parse(event.data) as TickData;

    // ignore messages from the past
    if (latestServerMessage && (message.tick < latestServerMessage.tick)) return;
    if (message.tick < lastMessageTick) return;

    // store latest message
    latestServerMessage = message;
    lastMessageTick = message.tick;

    // record latency
    lastLatency = Date.now() - message.timestamp;
    if (message.latency) world.ms = (lastLatency + message.latency) / 2;
  }

  const handleLatestMessage = () => {
    if (latestServerMessage === null) return;
    let message = latestServerMessage;
    let rollback = false;

    const messageCommands = message.commands[message.tick];

    // TODO consolidate with other block
    // compare commands
    for (const [entityId, messageCommandsForEntity] of Object.entries(messageCommands)) {
      const localCommands = world.localCommandBuffer[message.tick];
      if (!localCommands) {
        console.log("rollback! client is behind");
        rollback = true;
        break;
      } else if (!localCommands[entityId]) {
        console.log(`rollback! missed command ${entityId} ${JSON.stringify(messageCommandsForEntity)} ${JSON.stringify(localCommands)}`);
        rollback = true;
        break;
      } else if (localCommands[entityId].length !== messageCommandsForEntity.length) {
        console.log(`rollback! count ${entityId} ${localCommands[entityId].length} ${messageCommandsForEntity.length}`);
        rollback = true;
        break;
      } else {
        const commands = localCommands[entityId];
        if (commands) commands.forEach((command) => {
          if (!messageCommandsForEntity.includes(command)) {
            console.log(`rollback! ${entityId} ${command} ${JSON.stringify(messageCommandsForEntity)}`);
            rollback = true;
          }
        });
      }
    }

    // check future commands
    if (!rollback) Object.keys(message.commands).forEach((tickString) => {
      const tick = Number(tickString);

      // ignore messages from the past
      if (tick <= message.tick) return;

      const messageCommands = message.commands[tick];
      const localCommands = world.localCommandBuffer[tick];

      for (const [entityId, messageCommandsForEntity] of Object.entries(messageCommands)) {
        if (!localCommands) {
          console.log("都 rollback! client is behind");
          rollback = true;
          break;
        } else if (!localCommands[entityId]) {
          console.log(`都 rollback! missed e:${entityId} tick:${message.tick} ${JSON.stringify(messageCommandsForEntity)} ${JSON.stringify(localCommands)}`);
          rollback = true;
          break;
        } else if (localCommands[entityId].length !== messageCommandsForEntity.length) {
          console.log(`都 rollback count ${entityId} ${localCommands[entityId].length} ${messageCommandsForEntity.length}`);
          rollback = true;
          break;
        } else {
          const commands = localCommands[entityId];
          if (commands) commands.forEach((localC) => {
            if (!messageCommandsForEntity.includes(localC)) {
              console.log(`都 rollback! CLIENT COMMAND ${entityId}:${localC} not in ${JSON.stringify(messageCommandsForEntity)}`);
              rollback = true;
            }
          });

          messageCommandsForEntity.forEach((serverC) => {
            if (!commands.includes(serverC)) {
              console.log(`都 rollback! SERVER COMMAND ${entityId}:${serverC} not in ${JSON.stringify(commands)}`);
              rollback = true;
            }
          });
        }
      }
    });

    // compare entity counts
    if (!rollback && world.entitiesAtTick[message.tick]) {
      if (Object.keys(world.entitiesAtTick[message.tick]).length !== Object.keys(message.serializedEntities).length) {
        console.log(`rollback! entity count ${Object.keys(world.entitiesAtTick[message.tick]).length} ${Object.keys(message.serializedEntities).length}`);
        rollback = true;
      }
    }

    // compare entity states
    if (!rollback) {
      for (const [entityId, msgEntity] of Object.entries(message.serializedEntities)) {
        const entitiesAtTick = world.entitiesAtTick[message.tick];
        if (entitiesAtTick) {
          const localEntity = entitiesAtTick[entityId];
          if (localEntity) {
            if (JSON.stringify(localEntity) !== JSON.stringify(msgEntity)) {
              console.log(`rollback! entity state ${entityId} local:${JSON.stringify(localEntity)}\nremote:${JSON.stringify(msgEntity)}`);
              rollback = true;
              break;
            }
          } else {
            console.log("rollback! no buffered message", message.tick, world.entitiesAtTick[message.tick].serializedEntities);
            rollback = true;
            break
          }
        } else {
          console.log("rollback! no buffered tick data", message.tick, Object.keys(world.entitiesAtTick), world.entitiesAtTick[message.tick]);
          rollback = true;
          break
        }
      }
    }

    if (rollback) world.rollback(message);
  }

  const onTick = (_: Entity[]) => {
    handleLatestMessage();
    latestServerMessage = null;
    sendMessage(world);
  }

  const sendMessage = (world: World) => {

    const frames = Object.keys(world.localCommandBuffer).map(Number).filter((tick) => tick >= world.tick);
    let commands: Record<number, Record<string, string[]>> = {};
    frames.forEach((tick) => {
      if (Object.keys(world.localCommandBuffer[tick]).length) {
        commands[tick] = world.localCommandBuffer[tick];
      }
    });

    const message: TickData = {
      type: "game",
      tick: world.tick,
      timestamp: Date.now(),
      player: clientPlayerId ?? "unknown",
      commands,
      serializedEntities: {}
    }

    if (wsClient.readyState === wsClient.OPEN) wsClient.send(JSON.stringify(message));
  }

  return {
    id: "WsClientSystem",
    query: ["networked"],
    onTick,
    skipOnRollback: true
  }
}
