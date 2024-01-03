import { HTMLText } from "pixi.js";
import { Renderable, RenderableProps } from "@piggo-legends/contrib";

export type TextBoxProps = RenderableProps & {
  text?: string
  fontSize?: number
  color?: number
  dropShadow?: boolean
  padding?: number
}

export class TextBox extends Renderable<TextBoxProps> {
  constructor(props: TextBoxProps) {
    const { text = "", debuggable = false, color = 0x55FF00, fontSize = 16, dropShadow = false, padding = 0 } = props;

    super({
      ...props,
      debuggable: debuggable,
      container: async () => new HTMLText(text, {
        fill: color,
        fontSize,
        dropShadow,
        padding
      }),
    });
  }
}