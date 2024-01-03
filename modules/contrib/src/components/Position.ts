import { Component } from "@piggo-legends/core";

export type SerializedPosition = { x: number, y: number, rotation: number }
export type PositionOffset = "world" | "camera";

export type PositionProps = {
  x?: number
  y?: number
  offset?: PositionOffset
  screenFixed?: boolean
}

// the entity's position in the world
export class Position implements Component<"position"> {
  type: "position";

  rotation: Rotation = new Rotation();
  x: number;
  y: number;
  offset: PositionOffset;
  screenFixed: boolean;

  constructor({ x, y, offset, screenFixed }: PositionProps) {
    this.x = x ?? 0;
    this.y = y ?? 0;
    this.offset = offset ?? "world";
    this.screenFixed = screenFixed ?? false;
  }

  // get screen coordinates from world position
  toScreenXY = (): { x: number, y: number } => ({
    x: this.x - this.y,
    y: (this.x + this.y) / 2
  })

  // set world position from screen coordinates
  fromScreenXY = (isoX: number, isoY: number) => {
    this.x = (2 * isoY + isoX) / 2;
    this.y = (2 * isoY - isoX) / 2;
  }

  serialize = (): SerializedPosition => ({
    x: this.x,
    y: this.y,
    rotation: this.rotation.rads
  })

  deserialize = ({x, y, rotation}: SerializedPosition) => {
    this.x = x;
    this.y = y;
    this.rotation.rads = rotation;
  }
}

export class Rotation {
  rads: number = 0;

  minus = (amount: number) => {
    this.rads -= +amount.toFixed(2);
  }

  plus = (amount: number) => {
    this.rads += +amount.toFixed(2);
  }
}