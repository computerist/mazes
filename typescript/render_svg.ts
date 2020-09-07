import {Cell, Grid, GridPosition} from './mazes';

enum PauseAfter {
    line = 1,
    cell
}

interface Dimension {
    x: number;
    y: number;
}

class Point {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    compare(other: Point): number {
        if (this.x < other.x) {
            return -1;
        } else if (this.x > other.x) {
            return 1;
        } else if (this.y < other.y) {
            return -1;
        } else if (this.y > other.y) {
            return 1;
        }
        return 0;
    }

    toString(): String {
        return `(${this.x},${this.y})`;
    }
}

function comparePoints(point1: Point, point2: Point): number {
    return point1.compare(point2);
}

/**
 * Get the dimensions of an SVG Element
 * @param svgElement the SVG Element
 */
function getSVGElementDimensions(svgElement: SVGElement) {
    // TODO: Can we do this with getBoundingClientRectangle ?
    var dimensions = svgElement.getAttribute('viewBox').split(" ");
    return {
        x: Number(dimensions[2]) - Number(dimensions[0]),
        y: Number(dimensions[3]) - Number(dimensions[1])
    };
}

class TranslationParameters {
    scale: Dimension;
    origin: Point;

    constructor(scale: Dimension, origin: Point) {
        this.origin = origin;
        this.scale = scale;
    }

    translateFrom(point: Point): Point {
        let p = new Point((point.x / this.scale.x) - this.origin.x, (point.y / this.scale.y) - this.origin.y);
        return p;
    }

    translateTo(point: Point): Point {
        let p = new Point((point.x + this.origin.x ) * this.scale.x, (point.y + this.origin.y) * this.scale.y);
        return p;
    }
}

class Orientation {
    bottomLeft: Point;
    bottomRight: Point;
    topLeft: Point;
    topRight: Point;

    constructor(bottomLeft: Point, bottomRight: Point, topLeft: Point, topRight: Point) {
        this.bottomLeft = bottomLeft;
        this.bottomRight = bottomRight;
        this.topLeft = topLeft;
        this.topRight = topRight;
    }

    getTranslationParameters(orientation: Orientation): TranslationParameters {
        let translationParameters = new TranslationParameters({x: 1, y: 1}, new Point(0, 0));

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

/**
 * A class representing a rendering context for maze elemeents on an SVG document.
 */
class SVGContext {
    svgElement: SVGElement;
    visibleArea: Dimension;
    translationParameters: TranslationParameters;

    /**
     * Constructs an SVG context for the given element. Defaults to providing
     * an origin and scale mapping to the SVG element's origin and scale but
     * allows translation of coordinates to the specified origin and scale when
     * translation parameters are specified.
     * @param svgElement an SVG element to attach this SVGContext to.
     * @param translation translaton parameters for converting to / from the
     * svg element's coordinate system.
     */
    constructor(svgElement: SVGElement, translation?: TranslationParameters) {
        if (! translation) {
            this.translationParameters = NO_TRANSLATION;
        } else {
            this.translationParameters = translation;
        }
        this.svgElement = svgElement;
    }

    toSVGPoint(point: Point): Point {
        return this.translationParameters.translateTo(point);
    }
}


/**
 * A class for representing a line to be rendered as SVG.
 */
class Line {
    point1: Point;
    point2: Point;
    elements: Element[];

    /**
     * Constructs a Line from two points. Points have a natural ordering (see
     * the documentation for the Point type); the points in the line are
     * sorted according to this ordering so that a line has a canonical form:
     * This is useful for testing equality and to aid in de-duplication, and
     * likely also for path joining / grouping operations in future.
     * 
     * @param point1 a point at one end of the line
     * @param point2 a point at the other end of the line.
     */
    constructor(point1: Point, point2: Point) {
        // sort the points so each line segment has a canonical form
        let points: Point[] = [point1, point2];
        points.sort(comparePoints);
        this.point1 = points[0];
        this.point2 = points[1];
        this.elements = [];
    }

    /**
     * Renders this Line on the provided SVG context.
     * @param ctx The SVGContext on which this line should be rendered.
     */
    renderOn(ctx: SVGContext) {
        let svgEm = ctx.svgElement;
        let lineElement = document.createElementNS("http://www.w3.org/2000/svg", "line");
        let translatedPoint1 = ctx.toSVGPoint(this.point1);
        let translatedPoint2 = ctx.toSVGPoint(this.point2);

        lineElement.setAttribute("x1", translatedPoint1.x.toString());
        lineElement.setAttribute("y1", translatedPoint1.y.toString());
        lineElement.setAttribute("x2", translatedPoint2.x.toString());
        lineElement.setAttribute("y2", translatedPoint2.y.toString());
        lineElement.setAttribute("stroke","black");
        lineElement.setAttribute("stroke-width", 0.1.toString()); 
        lineElement.setAttribute("stroke-linecap", "square");
    
        svgEm.appendChild(lineElement);
        this.elements.push(lineElement);
    }

    toString(): string {
        return `${this.point1}:${this.point2}`;
    }
}

class SVGRenderer {
    svg: SVGContext;
    grid: Grid;

    constructor(svg: SVGElement, grid: Grid) {
        // calculate translation parameters and create an SVG Context

        // 3 units per cell allows us to draw cell walls and position something
        // within the cell
        let gridUnitsPerCell = 3;

        let gridWidth = ((grid.columns + 1) * gridUnitsPerCell) + 1;
        let gridHeight = ((grid.rows + 1) * gridUnitsPerCell) + 1;

        // When we talk about 'cells', 'rows' and 'columns', we assume
        // something like tabular display. This means, for people used to LTR
        // languages, it makes sense to think of our coordinate system as
        // having its origin at the top left of the grid.

        // If we want to flip the grid top to bottom, we'd flip the two pairs
        // of points.
        let gridOrientation = new Orientation(
            new Point(0, gridHeight),
            new Point(gridWidth, gridHeight),
            new Point(0, 0),
            new Point(gridWidth, 0));

        let svgDimensions = getSVGElementDimensions(svg);
        let svgWidth = svgDimensions.x;
        let svgHeight = svgDimensions.y;

        // SVG coordinates also have their origin at the top-left of the element.
        let svgOrientation = new Orientation(
            new Point(0, svgHeight),
            new Point(svgWidth, svgHeight),
            new Point(0, 0),
            new Point(svgWidth, 0));
        
        let svgTranslationParameters =
            svgOrientation.getTranslationParameters(gridOrientation);

        this.svg = new SVGContext(svg, svgTranslationParameters);
        this.grid = grid;
    }

    *renderGrid(pauseAfter?: PauseAfter): any {
        console.log("Pause after? " + pauseAfter);
        for(let cell of this.grid.eachCell()) {
            let walls = cell.getCellWalls();
            let pos = cell.position;
            let top = pos.row * 3;
            let bottom = (pos.row + 1) * 3;
            let left = pos.column * 3;
            let right = (pos.column + 1) * 3;

            if(walls.top) {
                let topLine = new Line(new Point(left, top), new Point(right, top));
                topLine.renderOn(this.svg);
                if (pauseAfter && pauseAfter == PauseAfter.line) {
                    yield;
                }
            }

            if(walls.bottom) {
                let bottomLine = new Line(new Point(left, bottom), new Point(right, bottom));
                bottomLine.renderOn(this.svg);
                if (pauseAfter && pauseAfter == PauseAfter.line) {
                    yield;
                }
            }

            if(walls.left) {
                let leftLine = new Line(new Point(left, top), new Point(left, bottom));
                leftLine.renderOn(this.svg);
                if (pauseAfter && pauseAfter == PauseAfter.line) {
                    yield;
                }
            }

            if(walls.right) {
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

const NO_TRANSLATION: TranslationParameters = new TranslationParameters({x:1, y:1}, new Point(0, 0));

export {Point, Line, Orientation, TranslationParameters, SVGRenderer, PauseAfter};