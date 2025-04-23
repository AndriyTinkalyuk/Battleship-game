import { Mark } from "./Mark.js";

export class Miss extends Mark {
    constructor(cell) {
    super(cell);
    this.logo = "⛓️‍💥";
    this.name = 'miss';
    this.color = "blue";
    }

}