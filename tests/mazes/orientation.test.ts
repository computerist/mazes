import {Orientation, Point, TranslationParameters} from '../../mazes/render_svg';

var assert = require('assert');

describe('Orientation', function () {
    describe('#getTranslateionParameters()', function () {
        let svgOrientation = new Orientation(
            new Point(0, 200),  // bottom left
            new Point(100, 200),// bottom right
            new Point(0, 0),    // top left
            new Point(100, 0)   // top right
        );

        let mazeOrientation = new Orientation(
            new Point(0, 0),    // bottom left
            new Point(10, 0),   // bottom right
            new Point(0, 10),   // top left
            new Point(10, 10)   // top right
        );

        let tp: TranslationParameters = svgOrientation.getTranslationParameters(mazeOrientation);

        it('should calculate the correct scale', function () {
            assert.equal(tp.scale.x, 10);
            assert.equal(tp.scale.y, -20);
        });

        it('should calculate the correct offsets', function () {
            let svgTopLeft: Point = new Point(0, 0);
            let mazeTopLeft: Point = tp.translateFrom(svgTopLeft);
            assert.deepEqual(new Point(0,10), mazeTopLeft);
            assert.deepEqual(tp.translateTo(mazeTopLeft), svgTopLeft);

            let svgTopRight: Point = new Point(100, 0);
            let mazeTopRight: Point = tp.translateFrom(svgTopRight);
            assert.deepEqual(new Point(10,10), mazeTopRight);
            assert.deepEqual(tp.translateTo(mazeTopRight), svgTopRight);

            let svgBottomLeft: Point = new Point(0, 200);
            let mazeBottomLeft: Point = tp.translateFrom(svgBottomLeft);
            assert.deepEqual(new Point(0,0), mazeBottomLeft);
            assert.deepEqual(tp.translateTo(mazeBottomLeft), svgBottomLeft);

            let svgBottomRight: Point = new Point(100, 200);
            let mazeBottomRight: Point = tp.translateFrom(svgBottomRight);
            assert.deepEqual(new Point(10,0), mazeBottomRight);
            assert.deepEqual(tp.translateTo(mazeBottomRight), svgBottomRight);
        });
    });
});