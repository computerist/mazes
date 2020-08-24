var drawMaze = function() {
    rows = 100;
    columns = 200;
    // loop over the rows
    for (let row = 0; row < rows; row ++) {
        let cellWalls = {
            top: 0 == row ? true : false
        }

        // loop over the columns in the row
        for (let cell = 0; cell < columns; cell ++) {
            cellWalls.left = 0 == cell ? true : false;

            if (row == (rows - 1)) {
                // aways draw the bottom wall on the final row
                cellWalls.bottom = true;
            } else {
                // do the cell walk algorithm
                let vertical = Math.floor(Math.random() * Math.floor(2));
                cellWalls.bottom = vertical ? true : false;
                cellWalls.right = !cellWalls.bottom;
            }

            // special case the last cell to have a right hand wall and no bottom
            if (cell == columns - 1) {
                cellWalls.right = true;
                cellWalls.bottom = (rows - 1) == row ? true : false; // except for the final row, which must have a bottom
            }
            drawCell({x: cell, y: row}, cellWalls);
        }
    }
}

drawMaze();