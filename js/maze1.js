var point = function(x, y) {
    return {x: x, y: y};
}

var comparePoints = function(a, b) {
    if (a.x < b.x) {
        return -1;
    } else if (a > b) {
        return 1;
    } else if (a.y < b.y) {
        return -1;
    } else if (a.v > b.y) {
        return 1;
    }
    return 0;
}

var line = function(point1, point2) {
    points = [point1, point2];
    points.sort(comparePoints);
    return {point1: points[0], point2: points[1]};
}

var drawLine = function(line) {
    var svgEm = document.getElementById("maze");

    var lineElement = document.createElementNS("http://www.w3.org/2000/svg", "line");
    lineElement.setAttribute("x1", line.point1.x);
    lineElement.setAttribute("y1", line.point1.y);
    lineElement.setAttribute("x2", line.point2.x);
    lineElement.setAttribute("y2", line.point2.y);
    lineElement.setAttribute("stroke","black");
    lineElement.setAttribute("stroke-width", 0.1); 
    lineElement.setAttribute("stroke-linecap", "square");

    svgEm.appendChild(lineElement);
}

var drawCell = function(position, cellWalls) {
    var svgEm = document.getElementById("maze");

    var dimensions = maze.getAttribute('viewBox').split(" ");
    var width = Number(dimensions[2]) - Number(dimensions[0]);
    var height = Number(dimensions[3]) - Number(dimensions[1]);

    var cellsWide = 200;
    var cellsHigh = 100;

    // TODO: We should only care about the logical coordinates here - let the stuff that juggles the actual DOM worry about conversion

    var cellWidth = (width / cellsWide);
    var cellHeight = (height / cellsHigh);

    var minPoint = {x: cellWidth * position.x, y: cellHeight * position.y};
    var maxPoint = {x: cellWidth * (position.x + 1), y: cellHeight * (position.y + 1)};

    var tl = point(minPoint.x, minPoint.y);
    var tr = point(maxPoint.x, minPoint.y);
    var bl = point(minPoint.x, maxPoint.y);
    var br = point(maxPoint.x, maxPoint.y);

    if (cellWalls.top) {
        drawLine(line(tl, tr));
    }

    if (cellWalls.bottom) {
        drawLine(line(bl, br));
    }

    if (cellWalls.left) {
        drawLine(line(tl, bl));
    }

    if (cellWalls.right) {
        drawLine(line(tr, br));
    }
};


setTimeout(function() {
    document.getElementById("btn1").addEventListener("click", function() {
        var pos = {
            x: Number(document.getElementById('pos_x').value),
            y: Number(document.getElementById('pos_y').value)
        };
        var cellWalls = {
            top: Number(document.getElementById('top').value),
            bottom: Number(document.getElementById('bottom').value),
            left: Number(document.getElementById('left').value),
            right: Number(document.getElementById('right').value)
        };

        drawCell(pos, cellWalls);
        return false;
    });
}, 1000);