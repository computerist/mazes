/******************************************************************************
 * A typescript-ish implementation of Jamis Buck's Cell and Grid from Chapter 2
 * of "Mazes for Programmers".
 *
 * Copyright (C) 2020 Mark Goodwin
 * See license.txt
 *****************************************************************************/

class GridPosition {
    row: number;
    column: number;

    constructor(row: number, column: number) {
        this.row = row;
        this.column = column;
    }
}

interface CellWalls {
    top:    boolean;
    bottom: boolean;
    left:   boolean;
    right:  boolean;
};

class Cell {
    position: GridPosition;
    links: Array<Cell>;
    north: Cell;
    south: Cell;
    east: Cell;
    west: Cell;

    constructor (position: GridPosition) {
        this.position = position;
        this.links = [];
    }

    link (cell: Cell, bidi?: boolean) {
        if (undefined == bidi) {
            bidi = true;
        }

        if (-1 == this.links.indexOf(cell)) {
            this.links.push(cell);
        }
        if (bidi) {
            cell.link(this, false);
        }
        return this;
    }

    unlink (cell: Cell, bidi?: boolean) {
        if (undefined == bidi) {
            bidi = true;
        }
        let index: number = this.links.indexOf(cell)
        if (index >= 0) {
            delete this.links[index];   
        }
        if (bidi) {
            cell.unlink(this, false);
        }
        return this;
    }

    getLinks() {
        return this.links;
    }

    isLinked(cell: Cell) {
        if (!cell) return false;
        return this.links.indexOf(cell) >= 0;
    }

    getCellWalls(): CellWalls {
        let walls = {
            top:    this.position.row == 0      ? true  : false,
            bottom: this.isLinked(this.south)   ? false : true,
            left:   this.position.column == 0   ? true  : false,
            right:  this.isLinked(this.east)    ? false : true
        };
        return walls;
    }

    toString = function() {
        let pos: GridPosition = this.position;
        return `(${pos.row}, ${pos.column})`;
    }
}

class Grid {
    rows: number;
    columns: number;
    grid: Cell[][];

    constructor (rows: number, columns: number) {
        this.rows = rows;
        this.columns = columns;

        this.grid = this.prepareGrid();
        this.configureCells();
    }

    prepareGrid(): Cell[][] {
        let gridRows: Cell[][] = [];
        gridRows.length = this.rows;
        for (let row: number = 0; row < gridRows.length; row++) {
            let rowCells: Cell[] = [];
            rowCells.length = this.columns;

            for (let column: number = 0; column < rowCells.length; column++) {
                rowCells[column] = new Cell(new GridPosition(row, column));
            }
            gridRows[row] = rowCells;
        }
        return gridRows;
    }

    *eachCell(): Generator<Cell> {
        for (let row of this.grid) {
            for (let cell of row) {
                //console.log(`column: ${cell.position.column} row: ${cell.position.row}`);
                yield cell;
            }
        }
    }

    *eachRow(): Generator<Cell[]> {
        for (let row of this.grid) {
            yield row;
        }
    }

    cellAt(position: GridPosition) {
        let {column, row} = position;
        if (this.grid[row]) {
            let gridRow = this.grid[row];
            return gridRow.hasOwnProperty(column) ? this.grid[row][column] : null;
        }
        return null;
    }

    configureCells() {
        for(let cell of this.eachCell()) {
            let {column, row} = cell.position;
            cell.north = this.cellAt(new GridPosition(row - 1, column));
            cell.south = this.cellAt(new GridPosition(row + 1, column));
            cell.east = this.cellAt(new GridPosition(row, column + 1));
            cell.west = this.cellAt(new GridPosition(row, column - 1));
        }
    }

    size(): number {
        return this.rows * this.columns;
    }

    randomCell(): Cell {
        let row = this.grid[Math.floor(Math.random() * this.grid.length)];
        return row[Math.floor(Math.random() * row.length)];
    }
}

export {Cell, Grid, GridPosition};