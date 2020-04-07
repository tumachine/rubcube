"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var THREE = require("../node_modules/three/src/Three");
var OrbitControls_1 = require("../node_modules/three/examples/jsm/controls/OrbitControls");
var view_1 = require("./rubik/view");
var model_1 = require("./rubik/model");
function createLight() {
    var color = 0xFFFFFF;
    var intensity = 1;
    var light = new THREE.DirectionalLight(color, intensity);
    return light;
}
function createCamera() {
    var fov = 75;
    var aspect = 2;
    var near = 0.1;
    var far = 20;
    var camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    return camera;
}
var MainScene = (function () {
    function MainScene() {
        var _this = this;
        this.resizeRendererToDisplaySize = function () {
            var width = _this.canvas.clientWidth;
            var height = _this.canvas.clientHeight;
            var needResize = _this.canvas.width !== width || _this.canvas.height !== height;
            if (needResize) {
                _this.renderer.setSize(width, height, false);
            }
            return needResize;
        };
        this.render = function () {
            if (_this.resizeRendererToDisplaySize()) {
                var canvas = _this.renderer.domElement;
                _this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
                _this.camera.updateProjectionMatrix();
            }
            _this.rubikView.render();
            _this.controls.update();
            _this.light.position.copy(_this.camera.getWorldPosition(new THREE.Vector3()));
            _this.renderer.render(_this.scene, _this.camera);
            requestAnimationFrame(_this.render);
        };
        this.light = createLight();
        this.canvas = document.querySelector('#c');
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas });
        this.camera = createCamera();
        this.controls = new OrbitControls_1.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.update();
        this.scene = new THREE.Scene();
        this.scene.add(this.light);
    }
    MainScene.prototype.createRubik = function (length) {
        if (this.scene.getObjectByName('rubik') !== undefined) {
            this.scene.remove(this.rubikView.rubik);
        }
        var rubikModel = new model_1.default(length);
        this.camera.position.set(length * 1.5, length * 1.2, length * 2);
        this.camera.far = length * 4;
        this.camera.updateProjectionMatrix();
        this.rubikView = new view_1.default(rubikModel);
        this.rubikView.rubik.name = 'rubik';
        this.scene.add(this.rubikView.rubik);
        this.rubikView.colorizeRubik();
    };
    MainScene.prototype.scrambleRubik = function (moves) {
        if (this.rubikView.rubikModel.sideLength > 3) {
            this.rubikView.rubikModel.generateRandomMoves(moves, true);
        }
        else {
            this.rubikView.rubikModel.generateRandomMoves(moves);
        }
        this.rubikView.startNextMove();
    };
    MainScene.prototype.solveRubik = function (animate) {
        if (animate === void 0) { animate = true; }
        if (this.rubikView.rubikModel.sideLength === 3) {
        }
        else {
        }
        if (animate) {
            this.rubikView.startNextMove();
        }
        else {
            this.rubikView.colorizeRubik();
        }
    };
    return MainScene;
}());
var main = new MainScene();
var size = 3;
window.onload = function () {
    var sizeUp = document.getElementById('sizeUp');
    var sizeDown = document.getElementById('sizeDown');
    var scramble = document.getElementById('scramble');
    var solve = document.getElementById('solve');
    sizeUp.onclick = function () {
        size += 2;
        main.createRubik(size);
    };
    sizeDown.onclick = function () {
        if (size > 3) {
            console.log(size);
            size -= 2;
            main.createRubik(size);
        }
    };
    scramble.onclick = function () {
        main.scrambleRubik(30);
    };
    solve.onclick = function () {
        main.solveRubik(true);
    };
};
function init() {
    main.createRubik(3);
    main.render();
}
init();
//# sourceMappingURL=index.js.map