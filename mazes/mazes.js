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

function Position(column, row) {
    this.column = column;
    this.row = row;
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
    return `(${pos.column}, ${pos.row})`;
};

function Grid(rows, columns) {
    this.rows = rows;
    this.columns = columns;

    this.grid = this.prepareGrid();
    this.configureCells();
}

Grid.prototype.prepareGrid = function() {
    let gridRows = [];
    gridRows.length = this.rows;
    for (let row = 0; row < gridRows.length; row++) {
        let rowCells = [];
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
    let {column, y: row} = position;
    if (this.grid.hasOwnProperty(row)) {
        let gridRow = this.grid[row];
        return gridRow.hasOwnProperty(column) ? this.grid[row][column] : null;
    }
    return null;
}

Grid.prototype.configureCells = function() {
    for(let cell of this.eachCell()) {
        let {column, y: row} = cell.position;
        cell.north = this.cellAt(new Position(column, row + 1));
        cell.south = this.cellAt(new Position(column, row - 1));
        cell.east = this.cellAt(new Position(column + 1, row));
        cell.west = this.cellAt(new Position(column - 1, row));
    }
};

Grid.prototype.size = function() {
    return this.rows * this.columns;
};

Grid.prototype.randomCell = function() {
    return this.grid.sample().sample();
};

module.exports = {Cell, Grid, Position};