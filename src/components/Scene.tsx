import React from 'react';
import styled from 'styled-components';
import { SceneObject, MouseEventObject } from '../SceneObject';
import * as THREE from 'three';
import RubikView from '../rubik/view';
import RubikUI from './RubikUI';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const createCamera = (width: number = 0, height: number = 0) => {
  const fov = 75;
  const aspect = width / height;
  const near = 0.1;
  const far = 20;
  return new THREE.PerspectiveCamera(fov, aspect, near, far);
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

interface SceneProps {
}

type SceneState = {
  rubik: RubikView,
}

const Canvas = styled.div`
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    user-select: none;
    overflow: hidden;
`;

export default class Scene extends React.Component<SceneProps, SceneState> {
  private frameId: number | null = null;

  private renderer: THREE.WebGLRenderer

  private mount: HTMLDivElement | null = null;

  private controls: OrbitControls

  private light: THREE.DirectionalLight

  private mouse: THREE.Vector3

  private canvas: HTMLCanvasElement

  private mouseEO: MouseEventObject | null;

  private camera: THREE.PerspectiveCamera

  private scene: THREE.Scene

  constructor(props: SceneProps) {
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
    this.mount?.appendChild(this.canvas);

    window.addEventListener('resize', this.handleResize);

    document.addEventListener('mousemove', this.onMouseMove, false);
    document.addEventListener('mousedown', this.onMouseDown, false);
    document.addEventListener('mouseup', this.onMouseUp, false);

    this.handleResize();

    this.start();
  }

  renderScene = (time: number) => {
    this.state.rubik.render(time);

    this.light.position.copy(this.camera.getWorldPosition(new THREE.Vector3()));

    this.controls.update();

    this.renderer.render(this.scene, this.camera);
  };

  handleResize = () => {
    if (this.mount) {
      const width = this.mount.clientWidth;
      const height = this.mount.clientHeight;
      this.renderer.setSize(width, height);
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
    }
  };

  animate = (time: number) => {
    this.renderScene(time);
    this.frameId = window.requestAnimationFrame(this.animate);
  };

  start = () => {
    if (!this.frameId) {
      this.frameId = requestAnimationFrame(this.animate);
    }
  };

  stop = () => {
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
    }
  };

  getMouseEventObject = (e: MouseEvent): MouseEventObject => {
    return { e, camera: this.camera, mouse: this.mouse, controls: this.controls };
  };

  onMouseUp = (event: MouseEvent) => {
    if (this.mouseEO) {
      this.mouseEO.e = event;

      this.state.rubik.onMouseUp(this.mouseEO);
    }
  };

  onMouseDown = (event: MouseEvent) => {
    if (this.mouseEO) {
      this.mouseEO.e = event;
      this.state.rubik.onMouseDown(this.mouseEO);
    }
  };

  onMouseMove = (event: MouseEvent) => {
    this.mouseEO = this.getMouseEventObject(event);
    const rect = this.canvas.getBoundingClientRect();
    this.mouse.x = (event.clientX / rect.width) * 2 - 1;
    this.mouse.y = -(event.clientY / rect.height) * 2 + 1;

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

  componentDidUpdate(prevProps: SceneProps, prevState: SceneState) {
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

      if (this.mount) {
        this.mount.removeChild(this.canvas);
      }
    };
  }

  render() {
    return (
      <>
        <Canvas
          id='c' ref={(mount: HTMLDivElement) => { this.mount = mount; }}
        />
        <RubikUI rubik={this.state.rubik} setRubik={this.setRubik} />
      </>
    );
  }
}

