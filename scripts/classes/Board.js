import { Cell } from "./Cell.js";
import { Damage } from "./marks/Damage.js";
import { Miss } from "./marks/Miss.js";
import { Ship } from "./marks/Ship.js";

export class Board {
    cells = [];

    initCells() {
        for (let i = 0; i < 10; i++) {
            const row = [];
            for (let j = 0; j < 10; j++) {
                row.push(new Cell(this, j, i, null));
                
            }
            
            this.cells.push(row);
        }
    }


    getCopyBoard() {
        const newBoard = new Board();
        newBoard.cells = this.cells;
        return newBoard;
    }

    getCells(x, y) {
        return this.cells[y][x];
    }

    addShip(x,y) {
        new Ship(this.getCells(x,y));
    }

    addMiss(x,y) {
        new Miss(this.getCells(x,y));
    }

    addDamage(x,y) {
        new Damage(this.getCells(x,y));
    }
}