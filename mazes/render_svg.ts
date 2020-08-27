import {Cell, Grid, GridPosition} from './mazes';

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
    origin: Point;
    scale: Dimension;
    visibleArea: Dimension;

    /**
     * Constructs an SVG context for the given element. Defaults to providing
     * an origin and scale mapping to the SVG element's origin and scale but
     * allows translation of coordinates to the specified origin and scale.
     * @param svgElement 
     * @param origin 
     * @param scale 
     */
    constructor(svgElement: SVGElement, origin?: Point, scale?: Dimension) {
        this.origin = origin ? origin : new Point(0,0);
        this.scale = scale ? scale : {x: 1, y: 1};
        this.svgElement = svgElement;
        this.visibleArea = getSVGElementDimensions(this.svgElement);
    }
}

class Line {
    point1: Point;
    point2: Point;

    constructor(point1: Point, point2: Point) {
        // sort the points so each line segment has a canonical form
        let points: Point[] = [point1, point2];
        points.sort(comparePoints);
        point1 = points[0];
        point2 = points[1];
    }

    renderOn(ctx: SVGContext) {
        var svgEm = document.getElementById("maze");
    
        var lineElement = document.createElementNS("http://www.w3.org/2000/svg", "line");
        lineElement.setAttribute("x1", this.point1.x.toString());
        lineElement.setAttribute("y1", this.point1.y.toString());
        lineElement.setAttribute("x2", this.point2.x.toString());
        lineElement.setAttribute("y2", this.point2.y.toString());
        lineElement.setAttribute("stroke","black");
        lineElement.setAttribute("stroke-width", 0.1.toString()); 
        lineElement.setAttribute("stroke-linecap", "square");
    
        svgEm.appendChild(lineElement);
    }
}

class SVGRenderer {
    svg: SVGElement;
    grid: Grid;

    constructor(svg: SVGElement, grid: Grid) {
        this.svg = svg;
        this.grid = grid;
    }
}

export {Point, Line, Orientation, TranslationParameters};