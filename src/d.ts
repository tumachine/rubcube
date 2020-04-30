export interface RenderInterface {
    render();
}

export interface MouseInterface {
  mouseUp(position: THREE.Vector3);
  mouseDown(position: THREE.Vector3);
  mouseMove(position: THREE.Vector3);
}

// export interface RenderInterface {
//     rubik: THREE.Object3D;
//     raycastMeshes: THREE.Mesh[];
//     calculateCubeOnFace(side: string, point: THREE.Vector3): void;
//     selectedOrientation: planeOrientation;
//     rotateWithMouse(direction: THREE.Vector3);
//     rotate(direction: THREE.Vector3);
//     stopRotation(): void;
//     mouseLargest: string;
//     name: string;
//     render();
// }
