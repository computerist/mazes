/******************************************************************************
 * A typescript-ish implementation of the Binary Tree maze.
 *
 * Copyright (C) 2020 Mark Goodwin
 * See license.txt
 *****************************************************************************/

import {Cell, Grid} from './mazes';
import {SVGRenderer, PauseAfter} from './render_svg';

let sidewind = function(grid: Grid) {
    for (let row of grid.eachRow()) {
        let run: Cell[] = [];
        for (let cell of row) {
            run.push(cell);

            let links: Cell[] = [];
            if (cell.east) {
                links.push(cell.east);
            }
            if (cell.north) {
                links.push(run[Math.floor(Math.random() * run.length)].north);
            }
            let linkedCell = links[Math.floor(Math.random() * links.length)];

            if (null != linkedCell) {
                if (linkedCell == cell.east) {
                    cell.link(linkedCell);
                } else {
                    linkedCell.link(linkedCell.south);
                    // if it's not a horizontal link, clear the run
                    run = [];
                }
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