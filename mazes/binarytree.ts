/******************************************************************************
 * A typescript-ish implementation of the Binary Tree maze.
 *
 * Copyright (C) 2020 Mark Goodwin
 * See license.txt
 *****************************************************************************/

import {Cell, Grid} from './mazes';
import {SVGRenderer, PauseAfter} from './render_svg';

let makeBinaryTree = function(grid: Grid) {
    for(let cell of grid.eachCell()) {
        let neighbours: Cell[] = [];
        if (cell.north) {
            neighbours.push(cell.north);
        }
        if (cell.east) {
            neighbours.push(cell.east);
        }

        let neighbour: Cell = neighbours[Math.floor(Math.random() * neighbours.length)];
        if(neighbour) {
            cell.link(neighbour);
        }
    }
    return grid;
}

// function hookElement() {
    let svg = document.getElementById("maze") as unknown as SVGElement;
    let grid = new Grid(100, 200);
    makeBinaryTree(grid);

    let renderer = new SVGRenderer(svg, grid);
    for(let thing of renderer.renderGrid(null)) {
    }
//}

// export {hookElement};