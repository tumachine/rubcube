import React, {useRef, useState, useEffect} from 'react';
import ReactDOM from 'react-dom';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import styled from 'styled-components';
import * as THREE from '../../node_modules/three/src/Three';
import { Object3D, PerspectiveCamera } from '../../node_modules/three/src/Three';
import { SceneObject, MouseEventObject } from '../SceneObject';
import Rubik from './Rubik';
import RubikView from '../rubik/view';
import RubikUI from './RubikUI';

const createCamera = (width: number = 0, height: number = 0) => {
  const fov = 75;
  const aspect = width / height;
  const near = 0.1;
  const far = 20;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  return camera;
};

const addLight = (scene: THREE.Scene) => {
  const downLight = new THREE.HemisphereLight(0xffffff, 0x000088);
  downLight.position.set(-10, 10, 10);
  downLight.intensity = 0.7;
  scene.add(downLight);

  const upLight = new THREE.HemisphereLight(0xffffff, 0x880000);
  upLight.position.set(10, -10, -10);
  upLight.intensity = 0.7;
  scene.add(upLight);
};

type SceneObjectsProps = {
}

type SceneState = {
  rubik: RubikView,
}

export default class Scene extends React.Component<{}, SceneState> {
  private frameId: number

  private renderer: THREE.WebGLRenderer

  private mount: HTMLDivElement

  private controls: OrbitControls

  private light: THREE.DirectionalLight

  private mouse: THREE.Vector3

  private canvas: HTMLCanvasElement

  private mouseEO: MouseEventObject

  private camera: THREE.PerspectiveCamera

  private scene: THREE.Scene

  constructor(props) {
    super(props);

    this.scene = new THREE.Scene();
    this.camera = createCamera();
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.canvas = this.renderer.domElement;
    this.controls = new OrbitControls(this.camera, this.canvas);
    addLight(this.scene);

    this.light = new THREE.DirectionalLight(0xffffff, 0.4);
    this.scene.add(this.light);

    this.mouse = new THREE.Vector3();
    this.mouseEO = null;

    this.state = {
      rubik: new RubikView(4),
    };

    this.addObject(this.state.rubik);
    this.state.rubik.controlCamera(this.camera);
  }

  componentDidMount() {
    this.mount.appendChild(this.canvas);

    window.addEventListener('resize', this.handleResize);

    document.addEventListener('mousemove', this.onMouseMove, false);
    document.addEventListener('mousedown', this.onMouseDown, false);
    document.addEventListener('mouseup', this.onMouseUp, false);

    this.handleResize();

    this.start();
  }

  renderScene = () => {
    this.state.rubik.render();

    this.light.position.copy(this.camera.getWorldPosition(new THREE.Vector3()));

    this.controls.update();

    this.renderer.render(this.scene, this.camera);
  };

  handleResize = () => {
    const width = this.mount.clientWidth;
    const height = this.mount.clientHeight;
    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderScene();
  };

  animate = () => {
    this.renderScene();
    this.frameId = window.requestAnimationFrame(this.animate);
  };

  start = () => {
    if (!this.frameId) {
      this.frameId = requestAnimationFrame(this.animate);
    }
  };

  stop = () => {
    cancelAnimationFrame(this.frameId);
  };

  setMouseEventObject = (e: MouseEvent) => {
    this.mouseEO = { e, camera: this.camera, mouse: this.mouse, controls: this.controls };
  };

  onMouseUp = (event: MouseEvent) => {
    this.mouseEO.e = event;

    this.state.rubik.onMouseUp(this.mouseEO);
  };

  onMouseDown = (event: MouseEvent) => {
    this.mouseEO.e = event;
    this.state.rubik.onMouseDown(this.mouseEO);
  };

  onMouseMove = (event: MouseEvent) => {
    const rect = this.canvas.getBoundingClientRect();
    this.mouse.x = (event.clientX / rect.width) * 2 - 1;
    this.mouse.y = -(event.clientY / rect.height) * 2 + 1;

    this.setMouseEventObject(event);

    this.state.rubik.onMouseMove(this.mouseEO);
  };

  removeObject = (obj: SceneObject) => {
    if (obj) {
      const sceneObject = this.scene.getObjectByName(obj.object.name);
      if (sceneObject) {
        this.scene.remove(sceneObject);
        obj.dispose();
        console.log('removed object');
      }
    }
  };

  addObject = (obj: SceneObject) => {
    this.scene.add(obj.object);
  };

  setRubik = (length: number) => {
    this.removeObject(this.state.rubik);
    this.setState({
      rubik: new RubikView(length),
    });
  };

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.state.rubik !== prevState.rubik) {
      this.addObject(this.state.rubik);
      this.state.rubik.controlCamera(this.camera);
    }
  }

  componentWillUnmount() {
    return () => {
      this.stop();

      window.removeEventListener('resize', this.handleResize);

      document.removeEventListener('mousemove', this.onMouseMove, false);
      document.removeEventListener('mousedown', this.onMouseDown, false);
      document.removeEventListener('mouseup', this.onMouseUp, false);

      this.mount.removeChild(this.canvas);
    };
  }

  render() {
    return (
      <>
        <Canvas
          id='c' ref={(mount: HTMLDivElement) => { this.mount = mount; }}
        />
        <RubikUI rubik={this.state.rubik} setRubik={this.setRubik}></RubikUI>
      </>
    );
  }
}

const Canvas = styled.div`
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    user-select: none;
    overflow: hidden;
`;
