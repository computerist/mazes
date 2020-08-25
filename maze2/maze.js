/******************************************
 * An implementation of the Sidewinder algorithm.
 *
 * Copyright (C) 2020 Mark Goodwin
 * See license.txt
 ******************************************/

var drawMaze = function() {
    let rowCount = 100;
    let columnCount = 200;
    let rows = [];
    rows.length = rowCount;

    // populate every cell
    for (let currentRow = 0; currentRow < rowCount; currentRow ++) {
        let cells = [];
        cells.length = columnCount;
        for (let currentColumn = 0; currentColumn < columnCount; currentColumn ++) {
           cells[currentColumn] = new Cell(new Position(currentColumn, currentRow), 1, 1, 1, 1);
        }
        rows[currentRow] = cells;
    }

    // Now join adjacent cells in each direction...
    for (let currentRow = 0; currentRow < rowCount; currentRow ++) {
        for (let currentColumn = 0; currentColumn < columnCount; currentColumn ++) {
            let currentCell = rows[currentRow][currentColumn];
            if (currentColumn > 0) {
                currentCell.placeRightOf(rows[currentRow][currentColumn - 1]);
            }
            if (currentRow > 0) {
                currentCell.placeBelow(rows[currentRow - 1][currentColumn]);
            }
        }
    }

    // now run the sidewinder algorithm
    for (let currentRow = 0; currentRow < rowCount; currentRow ++) {
        let pending = [];
        let lastVertical = 0;
        if (currentRow > 0) {
            console.log("On row " + currentRow);
        }
        for (let currentColumn = 0; currentColumn < columnCount; currentColumn ++) {
            let current = rows[currentRow][currentColumn];
            pending.push(current);
            let horizontal = Math.floor(Math.random() * Math.floor(2));
            // Ensure the last column is forced to not push sideways
            if (currentColumn == columnCount - 1) {
                horizontal = false;
            } else if (currentRow == rowCount - 1) {
                horizontal = true;
            }
            if (horizontal) {
                // erase the right wall of this cell
                current.right = 0;
                if (current.cellRight) {
                    current.cellRight.left = 0;
                }
            } else {
                // find a random cell between here and the last vertical, lose the bottom
                // wall
                let difference = currentColumn - lastVertical;
                let downCell = rows[currentRow][lastVertical + Math.floor(Math.random() * Math.floor(difference))];
                downCell.bottom = 0;
                if (downCell.cellBelow) {
                    downCell.cellBelow.top = 0;
                }

                lastVertical = current.position.x + 1;
                for(let cell of pending) {
                    drawCell(cell.position, cell);
                }
                pending = [];
            }
        }
    }

    console.log(rows);
}

drawMaze();