import { Mark } from "./Mark.js";

export class Damage extends Mark {
    constructor(cell) {
        super(cell);
        this.logo = "💥";
        this.name = 'damage';
        this.color = 'red';
    }
}