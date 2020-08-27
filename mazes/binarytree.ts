/******************************************************************************
 * A typescript-ish implementation of the Binary Tree maze.
 *
 * Copyright (C) 2020 Mark Goodwin
 * See license.txt
 *****************************************************************************/

import {Cell, Grid, GridPosition} from './mazes';

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


let grid = new Grid(10, 10);
makeBinaryTree(grid);