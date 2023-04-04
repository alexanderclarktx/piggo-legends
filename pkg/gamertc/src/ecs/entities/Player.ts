import { Entity, Health } from "@piggo-legends/gamertc";
import { Experience } from "../components/Experience";
import { Gold } from "../components/Gold";

export type PlayerProps = {
  gold: Gold,
  experience: Experience,
  health: Health
}

export class Player extends Entity<PlayerProps> {
  constructor(props: PlayerProps) {
    super(props);
  }
}
