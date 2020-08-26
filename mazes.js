/******************************************************************************
 * A javascript-ish implementation of Jamis Buck's Cell and Grid from Chapter 2
 * of "Mazes for Programmers".
 *
 * Copyright (C) 2020 Mark Goodwin
 * See license.txt
 *****************************************************************************/

Array.prototype.sample = function () {
    return this[Math.floor(Math.random() * this.length)];
};

function Position(x, y) {
    this.x = x;
    this.y = y;
}

function Cell(position) {
    this.position = position;
    this.links = {}
}

Cell.prototype.link = function(cell, bidi) {
    this.links[cell] = true;
    if (bidi) {
        cell.link(this, false);
    }
    return this;
};

Cell.prototype.unlink = function(cell, bidi) {
    if (this.links.hasOwnProperty(cell)) {
        delete this.links[cell];
        if (bidi) {
            cell.unlink(this, false);
        }
    }
    return this;
};

Cell.prototype.getLinks = function() {
    let keys = [];
    for (key in this.links) {
        keys.push(key);
    }
    return keys;
};

Cell.prototype.isLinked = function(cell) {
    return this.links.hasOwnProperty(cell);
};

Cell.prototype.toString = function() {
    let pos = this.position;
    return `(${pos.x}, ${pos.y})`;
};

function makeSampleable(array) {
    /*array.sample = function () {
        return this[Math.floor(Math.random() * this.length)];
    };*/
}

function Grid(rows, columns) {
    this.rows = rows;
    this.columns = columns;

    this.grid = this.prepareGrid();
    this.configureCells();
}

Grid.prototype.prepareGrid = function() {
    let gridRows = [];
    makeSampleable(gridRows);
    gridRows.length = this.rows;
    for (let row = 0; row < gridRows.length; row++) {
        let rowCells = [];
        makeSampleable(rowCells);
        rowCells.length = this.columns;
        for (let column = 0; column < rowCells.length; column++) {
            rowCells[column] = new Cell(new Position(row, column));
        }
        gridRows[row] = rowCells;
    }
    return gridRows;
};

Grid.prototype.eachCell = function*() {
    for (let row of this.grid) {
        for (let cell of row) {
            yield cell;
        }
    }
};

Grid.prototype.eachRow = function*() {
    for (let row of this.grid) {
        yield row;
    }
};

Grid.prototype.cellAt = function(position) {
    let {x, y} = position;
    if (this.grid.hasOwnProperty(y)) {
        let row = this.grid[y];
        return row.hasOwnProperty(x) ? this.grid[y][x] : null;
    }
    return null;
}

Grid.prototype.configureCells = function() {
    for(let cell of this.eachCell()) {
        let {x, y} = cell.position;
        cell.north = this.cellAt(new Position(x, y + 1));
        cell.south = this.cellAt(new Position(x, y - 1));
        cell.east = this.cellAt(new Position(x + 1, y));
        cell.west = this.cellAt(new Position(x - 1, y));
    }
};

Grid.prototype.size = function() {
    return this.rows * this.columns;
};

Grid.prototype.randomCell = function() {
    return this.grid.sample().sample();
};

module.exports = {Cell, Grid, Position};