(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mazes_1 = require("./mazes");
const render_svg_1 = require("./render_svg");
let makeBinaryTree = function (grid) {
    for (let cell of grid.eachCell()) {
        let neighbours = [];
        if (cell.north) {
            neighbours.push(cell.north);
        }
        if (cell.east) {
            neighbours.push(cell.east);
        }
        let neighbour = neighbours[Math.floor(Math.random() * neighbours.length)];
        if (neighbour) {
            cell.link(neighbour);
        }
    }
    return grid;
};
let svg = document.getElementById("maze");
let grid = new mazes_1.Grid(100, 200);
makeBinaryTree(grid);
let renderer = new render_svg_1.SVGRenderer(svg, grid);
const gen = renderer.renderGrid(null);
const start = setInterval(() => {
    var next = gen.next();
    if (next.done) {
        clearInterval(start);
    }
    else {
        console.log(next.value);
    }
}, 5);

},{"./mazes":2,"./render_svg":3}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GridPosition = exports.Grid = exports.Cell = void 0;
class GridPosition {
    constructor(row, column) {
        this.row = row;
        this.column = column;
    }
}
exports.GridPosition = GridPosition;
;
class Cell {
    constructor(position) {
        this.toString = function () {
            let pos = this.position;
            return `(${pos.row}, ${pos.column})`;
        };
        this.position = position;
        this.links = [];
    }
    link(cell, bidi) {
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
    unlink(cell, bidi) {
        if (undefined == bidi) {
            bidi = true;
        }
        let index = this.links.indexOf(cell);
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
    isLinked(cell) {
        if (!cell)
            return false;
        return this.links.indexOf(cell) >= 0;
    }
    getCellWalls() {
        let walls = {
            top: this.position.row == 0 ? true : false,
            bottom: this.isLinked(this.south) ? false : true,
            left: this.position.column == 0 ? true : false,
            right: this.isLinked(this.east) ? false : true
        };
        return walls;
    }
}
exports.Cell = Cell;
class Grid {
    constructor(rows, columns) {
        this.rows = rows;
        this.columns = columns;
        this.grid = this.prepareGrid();
        this.configureCells();
    }
    prepareGrid() {
        let gridRows = [];
        gridRows.length = this.rows;
        for (let row = 0; row < gridRows.length; row++) {
            let rowCells = [];
            rowCells.length = this.columns;
            for (let column = 0; column < rowCells.length; column++) {
                rowCells[column] = new Cell(new GridPosition(row, column));
            }
            gridRows[row] = rowCells;
        }
        return gridRows;
    }
    *eachCell() {
        for (let row of this.grid) {
            for (let cell of row) {
                console.log(`column: ${cell.position.column} row: ${cell.position.row}`);
                yield cell;
            }
        }
    }
    *eachRow() {
        for (let row of this.grid) {
            yield row;
        }
    }
    cellAt(position) {
        let { column, row } = position;
        if (this.grid[row]) {
            let gridRow = this.grid[row];
            return gridRow.hasOwnProperty(column) ? this.grid[row][column] : null;
        }
        return null;
    }
    configureCells() {
        for (let cell of this.eachCell()) {
            let { column, row } = cell.position;
            cell.north = this.cellAt(new GridPosition(row - 1, column));
            cell.south = this.cellAt(new GridPosition(row + 1, column));
            cell.east = this.cellAt(new GridPosition(row, column + 1));
            cell.west = this.cellAt(new GridPosition(row, column - 1));
        }
    }
    size() {
        return this.rows * this.columns;
    }
    randomCell() {
        let row = this.grid[Math.floor(Math.random() * this.grid.length)];
        return row[Math.floor(Math.random() * row.length)];
    }
}
exports.Grid = Grid;

},{}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PauseAfter = exports.SVGRenderer = exports.TranslationParameters = exports.Orientation = exports.Line = exports.Point = void 0;
var PauseAfter;
(function (PauseAfter) {
    PauseAfter[PauseAfter["line"] = 1] = "line";
    PauseAfter[PauseAfter["cell"] = 2] = "cell";
})(PauseAfter || (PauseAfter = {}));
exports.PauseAfter = PauseAfter;
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    compare(other) {
        if (this.x < other.x) {
            return -1;
        }
        else if (this.x > other.x) {
            return 1;
        }
        else if (this.y < other.y) {
            return -1;
        }
        else if (this.y > other.y) {
            return 1;
        }
        return 0;
    }
    toString() {
        return `(${this.x},${this.y})`;
    }
}
exports.Point = Point;
function comparePoints(point1, point2) {
    return point1.compare(point2);
}
function getSVGElementDimensions(svgElement) {
    var dimensions = svgElement.getAttribute('viewBox').split(" ");
    return {
        x: Number(dimensions[2]) - Number(dimensions[0]),
        y: Number(dimensions[3]) - Number(dimensions[1])
    };
}
class TranslationParameters {
    constructor(scale, origin) {
        this.origin = origin;
        this.scale = scale;
    }
    translateFrom(point) {
        let p = new Point((point.x / this.scale.x) - this.origin.x, (point.y / this.scale.y) - this.origin.y);
        return p;
    }
    translateTo(point) {
        let p = new Point((point.x + this.origin.x) * this.scale.x, (point.y + this.origin.y) * this.scale.y);
        return p;
    }
}
exports.TranslationParameters = TranslationParameters;
class Orientation {
    constructor(bottomLeft, bottomRight, topLeft, topRight) {
        this.bottomLeft = bottomLeft;
        this.bottomRight = bottomRight;
        this.topLeft = topLeft;
        this.topRight = topRight;
    }
    getTranslationParameters(orientation) {
        let translationParameters = new TranslationParameters({ x: 1, y: 1 }, new Point(0, 0));
        translationParameters.scale.y =
            (this.topLeft.y - this.bottomLeft.y) /
                (orientation.topLeft.y - orientation.bottomLeft.y);
        translationParameters.scale.x =
            (this.topRight.x - this.topLeft.x) /
                (orientation.topRight.x - orientation.topLeft.x);
        translationParameters.origin.x = (this.topRight.x / translationParameters.scale.x) - orientation.topRight.x;
        translationParameters.origin.y = (this.topRight.y / translationParameters.scale.y) - orientation.topRight.y;
        return translationParameters;
    }
}
exports.Orientation = Orientation;
class SVGContext {
    constructor(svgElement, translation) {
        if (!translation) {
            this.translationParameters = NO_TRANSLATION;
        }
        else {
            this.translationParameters = translation;
        }
        this.svgElement = svgElement;
    }
    toSVGPoint(point) {
        return this.translationParameters.translateTo(point);
    }
}
class Line {
    constructor(point1, point2) {
        let points = [point1, point2];
        points.sort(comparePoints);
        this.point1 = points[0];
        this.point2 = points[1];
        this.elements = [];
    }
    renderOn(ctx) {
        let svgEm = ctx.svgElement;
        let lineElement = document.createElementNS("http://www.w3.org/2000/svg", "line");
        let translatedPoint1 = ctx.toSVGPoint(this.point1);
        let translatedPoint2 = ctx.toSVGPoint(this.point2);
        lineElement.setAttribute("x1", translatedPoint1.x.toString());
        lineElement.setAttribute("y1", translatedPoint1.y.toString());
        lineElement.setAttribute("x2", translatedPoint2.x.toString());
        lineElement.setAttribute("y2", translatedPoint2.y.toString());
        lineElement.setAttribute("stroke", "black");
        lineElement.setAttribute("stroke-width", 0.1.toString());
        lineElement.setAttribute("stroke-linecap", "square");
        svgEm.appendChild(lineElement);
        this.elements.push(lineElement);
    }
    toString() {
        return `${this.point1}:${this.point2}`;
    }
}
exports.Line = Line;
class SVGRenderer {
    constructor(svg, grid) {
        let gridUnitsPerCell = 3;
        let gridWidth = ((grid.columns + 1) * gridUnitsPerCell) + 1;
        let gridHeight = ((grid.rows + 1) * gridUnitsPerCell) + 1;
        let gridOrientation = new Orientation(new Point(0, gridHeight), new Point(gridWidth, gridHeight), new Point(0, 0), new Point(gridWidth, 0));
        let svgDimensions = getSVGElementDimensions(svg);
        let svgWidth = svgDimensions.x;
        let svgHeight = svgDimensions.y;
        let svgOrientation = new Orientation(new Point(0, svgHeight), new Point(svgWidth, svgHeight), new Point(0, 0), new Point(svgWidth, 0));
        let svgTranslationParameters = svgOrientation.getTranslationParameters(gridOrientation);
        this.svg = new SVGContext(svg, svgTranslationParameters);
        this.grid = grid;
    }
    *renderGrid(pauseAfter) {
        console.log("Pause after? " + pauseAfter);
        for (let cell of this.grid.eachCell()) {
            let walls = cell.getCellWalls();
            let pos = cell.position;
            let top = pos.row * 3;
            let bottom = (pos.row + 1) * 3;
            let left = pos.column * 3;
            let right = (pos.column + 1) * 3;
            if (walls.top) {
                let topLine = new Line(new Point(left, top), new Point(right, top));
                topLine.renderOn(this.svg);
                if (pauseAfter && pauseAfter == PauseAfter.line) {
                    yield;
                }
            }
            if (walls.bottom) {
                let bottomLine = new Line(new Point(left, bottom), new Point(right, bottom));
                bottomLine.renderOn(this.svg);
                if (pauseAfter && pauseAfter == PauseAfter.line) {
                    yield;
                }
            }
            if (walls.left) {
                let leftLine = new Line(new Point(left, top), new Point(left, bottom));
                leftLine.renderOn(this.svg);
                if (pauseAfter && pauseAfter == PauseAfter.line) {
                    yield;
                }
            }
            if (walls.right) {
                let rightLine = new Line(new Point(right, top), new Point(right, bottom));
                rightLine.renderOn(this.svg);
                if (pauseAfter && pauseAfter == PauseAfter.line) {
                    yield;
                }
            }
            if (pauseAfter && pauseAfter == PauseAfter.cell) {
                yield;
            }
        }
        yield;
    }
}
exports.SVGRenderer = SVGRenderer;
const NO_TRANSLATION = new TranslationParameters({ x: 1, y: 1 }, new Point(0, 0));

},{}]},{},[1]);
