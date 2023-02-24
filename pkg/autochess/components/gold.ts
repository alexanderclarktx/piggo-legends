import { Component } from "@ts-game-project/ecstacy";

// the gold component tracks the player's gold
export class Gold extends Component {
    gold: number;

    constructor(gold: number) {
        super();
        this.gold = gold;
    }
}
