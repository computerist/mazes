/******************************************************************************
 * A typescript-ish implementation of the Binary Tree maze.
 *
 * Copyright (C) 2020 Mark Goodwin
 * See license.txt
 *****************************************************************************/

import {Cell, Grid} from './mazes';
import {SVGRenderer, PauseAfter} from './render_svg';

enum WindingDirection {
    horizontal = 1,
    vertical
}

let chooseDirection = function(): WindingDirection {
    let choice = Math.floor(Math.random() * 2);
    if (choice == 0) {
        return WindingDirection.horizontal;
    }
    return WindingDirection.vertical;
}

let sidewind = function(grid: Grid) {
    for (let row of grid.eachRow()) {
        let run: Cell[] = [];
        for (let cell of row) {
            run.push(cell);

            var direction = chooseDirection();
            // override the direction if we're out of cells
            if(!cell.east) {
                direction = WindingDirection.vertical;
            }
            if(!cell.north) {
                direction = WindingDirection.horizontal;
            }

            var linkCell = cell.east;
            
            if (WindingDirection.vertical == direction) {
                linkCell = run[Math.floor(Math.random() * run.length)].north;
                run = [];
            }

            if (linkCell) {
                cell.link(linkCell);
            }
        }
    }
    return grid;
}

let svg = document.getElementById("maze") as unknown as SVGElement;
let grid = new Grid(100, 200);
sidewind(grid);

let renderer = new SVGRenderer(svg, grid);
const gen = renderer.renderGrid(null);

const start = setInterval(() => {
    var next = gen.next();
    if(next.done){
        clearInterval(start);
    }
}, 5);