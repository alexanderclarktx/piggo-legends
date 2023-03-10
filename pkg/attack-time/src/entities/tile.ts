import { Entity } from "@piggo-legends/gamertc";
import { Unit } from "./unit";

export class Tile extends Entity {
  unit: Unit;
  x: number;
  y: number;

  constructor(unit: Unit, x: number, y: number) {
    super();
    this.unit = unit;
    this.x = x;
    this.y = y;
  }
}
