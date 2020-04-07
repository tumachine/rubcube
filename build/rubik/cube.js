"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var THREE = require("../../node_modules/three/src/Three");
var boxWidth = 0.95;
var boxHeight = 0.95;
var boxDepth = 0.95;
var blue = 0x0000FF;
var red = 0xFF0000;
var yellow = 0xFFFF00;
var green = 0x008000;
var white = 0xFFFFFF;
var orange = 0xFFA500;
var colors = [green, blue, orange, red, white, yellow];
var Cube = (function () {
    function Cube(x, y, z) {
        this.material = new THREE.MeshPhongMaterial({ color: 0xFFFFFF, vertexColors: true });
        this.geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
        this.cube = new THREE.Mesh(this.geometry, this.material);
        this.cube.position.set(x, y, z);
    }
    Cube.prototype.setColor = function (faceSide, color) {
        this.geometry.faces[faceSide].color.setHex(colors[color]);
        this.geometry.faces[faceSide + 1].color.setHex(colors[color]);
    };
    Cube.prototype.getCube = function () {
        return this.cube;
    };
    return Cube;
}());
exports.default = Cube;
//# sourceMappingURL=cube.js.map