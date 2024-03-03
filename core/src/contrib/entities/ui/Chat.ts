import { Entity, World } from "@piggo-gg/core";
import { Position, Renderable, TextBox, chatBuffer, chatIsOpen } from "@piggo-gg/core";
import { Text } from "pixi.js";

export const Chat = (): Entity => {

  const chatHistoryText = () => new TextBox({
    padding: 3,
    fontSize: 16,
    color: 0x55FFFF,
    dynamic: (t: Text, r: TextBox, _, w: World) => {

      // get the last 4 messages
      let lastMessages: string[] = [];
      w.chatHistory.keys().slice(0, 4).forEach((tick) => {
        const messagesForEntity = w.chatHistory.atTick(tick);
        if (messagesForEntity) Object.values(messagesForEntity).forEach((messages) => {
          messages.forEach((message) => {
            if (messages.length < 4) lastMessages.push(message)
          });
        });
      });

      // join with linebreak
      t.text = lastMessages.reverse().join("\n");

      // offset from bottom
      r.c.position.set(0, -1 * t.height + 20);
    }
  });

  const chatBufferText = () => new TextBox({
    position: { x: 0, y: 25 },
    fontSize: 16,
    color: 0xFFFF33,
    // boxOutline: true,
    // visible: false,
    dynamic: (t: Text) => {
      const textToRender = chatBuffer.join("");
      chatIsOpen ? t.text = `${textToRender}|` : t.text = "";
    }
  });

  return {
    id: "chat",
    components: {
      position: new Position({ x: -400, y: -200, screenFixed: true }),
      renderable: new Renderable({
        zIndex: 4,
        children: async () => [chatHistoryText(), chatBufferText()]
      })
    }
  }
}
