import * as THREE from './someFolder/build/three.module.js';
import { OrbitControls } from './someFolder/examples/jsm/controls/OrbitControls.js';
import Cube from './cube.js';

const sides = {
  left: 0,
  right: 1,
  top: 2,
  bottom: 3,
  front: 4,
  back: 5,
};

function main() {
  const canvas = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({ canvas });

  const fov = 75;
  const aspect = 2;
  const near = 0.1;
  const far = 15;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

  const controls = new OrbitControls(camera, renderer.domElement);
  camera.position.z = 8;
  controls.update();
  // camera.position.set(0, 50, 0)
  // camera.up.set(0, 0, 1)
  // camera.lookAt(0, 0, 0)

  const scene = new THREE.Scene();


  const objects = [];

  const light = createLight();

  scene.add(light);

  const rubick = new THREE.Object3D();
  scene.add(rubick);
  objects.push(rubick);
  const rubikSideLength = 7;

  const cubes = createGraphicRubik(rubikSideLength);
  cubes.map((cube) => (cube ? rubick.add(cube.getCube()) : null));

  const matrixReference = createMatrix(cubes, rubikSideLength);

  const matrix = createMatrixRubik(rubikSideLength);
  const posHor = PositionHorizontal(rubikSideLength, matrix);
  const posVer = PositionVertical(rubikSideLength);
  const posDep = PositionDepth(rubikSideLength);
  const sequenceHor = [sides.front, sides.left, sides.back, sides.right, sides.front];
  const sequenceVert = [sides.top, sides.back, sides.bottom, sides.front, sides.top];
  const sequenceDepth = [sides.left, sides.top, sides.right, sides.bottom, sides.left];
//   rotate(matrix, posVer, sequenceVert, 0);
console.log(posDep)
  rotate(matrix, posDep, sequenceDepth, 0);
  // const matrix = createOrderedByColor(rubikSideLength)
  // turnLeftRight(matrix, 2, rubikSideLength, false)
  colorRubik(matrix, matrixReference, cubes, rubikSideLength);

  // scene.add(solarSystem)
  // objects.push(solarSystem)

  objects.forEach((node) => {
    const axes = new THREE.AxesHelper();
    axes.material.depthTest = false;
    axes.renderOrder = 1;
    node.add(axes);
  });

  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

  function render(time) {
    time *= 0.001;
    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    objects.forEach((obj) => {
      // obj.rotation.y = time
    });

    controls.update();
    light.position.copy(camera.getWorldPosition(new THREE.Vector3()));
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

function createGraphicRubik(sideLength) {
  const cubes = [];
  // draw rubic
  // depend on a side length
  const limit = Math.floor(sideLength / 2);
  for (let y = -limit; y <= limit; y += 1) {
    for (let z = -limit; z <= limit; z += 1) {
      for (let x = -limit; x <= limit; x += 1) {
        // add only those cubes that are on the outside
        if (y === -limit || y === limit || z === -limit || z === limit || x === -limit || x === limit) {
          const cube = new Cube(x, y, z);
          cubes.push(cube);
        } else {
          cubes.push(null);
        }
      }
    }
  }
  return cubes;
}

function createMatrixRubik(sideLength) {
  const totalColors = sideLength * sideLength;
  const matrixRubic = [];
  const sides = 6;
  for (let i = 0; i < sides; i += 1) {
    const tempArr = [];
    for (let q = 0; q < totalColors; q += 1) {
      tempArr.push(i);
    }
    matrixRubic.push(tempArr);
  }

  return matrixRubic;
}

// every side length RIGHT
// every first in side length LEFT
// every second - middle vertical
// one side length BOTTOM, MIDDLE HOR, TOP
// from bottom to top
// from left to right
function createTurnRubik(sideLength) {
  const matrixRubic = [
    [2, 0, 0, 2, 0, 0, 2, 0, 0], // left
    [3, 1, 1, 3, 1, 1, 3, 1, 1], // right
    [1, 1, 1, 2, 2, 2, 2, 2, 2], // top
    [0, 0, 0, 3, 3, 3, 3, 3, 3], // bottom
    [4, 4, 4, 4, 4, 4, 4, 4, 4], // front
    [5, 5, 5, 5, 5, 5, 5, 5, 5], // back
  ];
  return matrixRubic;
}


function createOrderedByColor(sideLength) {
  const matrixRubic = [
    [0, 1, 2, 3, 4, 5, 1, 2, 3], // left
    [0, 1, 2, 3, 4, 5, 1, 2, 3], // right
    [0, 1, 2, 3, 4, 5, 1, 2, 3], // top
    [0, 1, 2, 3, 4, 5, 1, 2, 3], // bottom
    [0, 1, 2, 3, 4, 5, 1, 2, 3], // front
    [0, 1, 2, 3, 4, 5, 1, 2, 3], // back
  ];
  return matrixRubic;
}

function turnLeftRight(matrix, slice, sideLength, left = true) {
  let sequence = [sides.front, sides.left, sides.back, sides.right, sides.front];
  if (!left) {
    sequence = [sides.front, sides.right, sides.back, sides.left, sides.front];
  }
  const sliceStart = slice * sideLength;
  const sliceEnd = sliceStart + sideLength;

  let first = matrix[sequence[0]].slice(sliceStart, sliceEnd);
  for (let i = 0; i < sequence.length - 1; i += 1) {
    const second = matrix[sequence[i + 1]].slice(sliceStart, sliceEnd);
    for (let m = sliceStart; m < sliceEnd; m += 1) {
      matrix[sequence[i + 1]][m] = first[m - sliceStart];
    }
    first = second;
  }
}

function rotate(matrix, slices, sequence, slice) {
  const layer = slices[slice];
  console.log(slices);
  let first = layer[0];
  // save values of first face
  const firstFace = layer[0].map((i) => matrix[sequence[0]][i]);

  for (let face = 0; face < layer.length - 1; face += 1) {
    const second = layer[face + 1];
    for (let i = 0; i < layer[face].length; i += 1) {
      matrix[sequence[face]][first[i]] = matrix[sequence[face + 1]][second[i]];
    }
    first = second;
  }

  const lastFace = sequence[sequence.length - 2];
  //   console.log(lastFace)
  for (let i = 0; i < layer[0].length; i += 1) {
    // matrix[lastFace][layer[lastFace][i]] = firstFace[i];
    matrix[lastFace][layer[3][i]] = firstFace[i];
  }
}


// slices = [
//     [ // slice
//         [], // face
//         [], // face
//         [], // face
//         [], // face
//     ],
//     [ // slice
//         [], // face
//         [], // face
//         [], // face
//         [], // face
//     ],
//     [ // slice
//         [], // face
//         [], // face
//         [], // face
//         [], // face
//     ],
// ]
function PositionHorizontal(sideLength, matrix) {
  // slices depending on a side length
  const slices = [];
  // slice
  for (let i = 0; i < sideLength; i += 1) {
    const slice = [];
    // 4 faces
    for (let face = 0; face < 4; face += 1) {
      const faces = [];
      slice.push(faces);
    }
    slices.push(slice);
  }

  for (let slice = 0; slice < slices.length; slice += 1) {
    const sliceStart = slice * sideLength;
    const sliceEnd = sliceStart + sideLength;
    for (let face = 0; face < slices[slice].length; face += 1) {
      for (let m = sliceStart; m < sliceEnd; m += 1) {
        slices[slice][face].push(m);
      }
    }
  }
  return slices;
}

function PositionVertical(sideLength) {
  // slices depending on a side length
  const slices = [];
  // slice
  for (let i = 0; i < sideLength; i += 1) {
    const slice = [];
    // 4 faces
    for (let face = 0; face < 4; face += 1) {
      const faces = [];
      slice.push(faces);
    }
    slices.push(slice);
  }

  for (let slice = 0; slice < slices.length; slice += 1) {
    for (let face = 0; face < slices[slice].length; face += 1) {
      for (let m = 0; m < sideLength; m += 1) {
        slices[slice][face].push(slice + sideLength * m);
      }
    }
  }
  console.log(slices);
  return slices;
}

function PositionDepth(sideLength) {
  // slices depending on a side length
  const slices = [];
  // slice
  for (let i = 0; i < sideLength; i += 1) {
    const slice = [];
    // 4 faces
    for (let face = 0; face < 4; face += 1) {
      const faces = [];
      slice.push(faces);
    }
    slices.push(slice);
  }

  for (let slice = 0; slice < slices.length; slice += 1) {
    // sideLength = 3
    // slice 0
    // [0, 3, 6]
    // second
    // [0, 1, 2]
    // first reversed
    // second reversed
    // slice 1
    // [1,4,7]
    // [3,4,5]
    // slice 2
    // [2,5,8]
    // [6,7,8]
    for (let m = 0; m < sideLength; m += 1) {
      slices[slice][0].push(slice + sideLength * m);
      slices[slice][1].push(slice * sideLength + m);
    }
    slices[slice][2] = slices[slice][0].reverse();
    slices[slice][3] = slices[slice][1].reverse();
  }
  console.log(slices);
  return slices;
}

function createMatrix(cubes, sideLength) {
  const totalColors = sideLength * sideLength;
  const matrixRubic = [
    [],
    [],
    [],
    [],
    [],
    [],
  ];

  // indexes bottom
  for (let cube = 0; cube < totalColors; cube += 1) {
    matrixRubic[sides.bottom].push(cube);
  }

  // indexes top
  for (let cube = cubes.length - totalColors; cube < cubes.length; cube += 1) {
    matrixRubic[sides.top].push(cube);
  }

  // indexes left
  for (let cube = 0; cube < cubes.length; cube += sideLength) {
    matrixRubic[sides.left].push(cube);
  }
  // indexes right
  for (let cube = sideLength - 1; cube < cubes.length; cube += sideLength) {
    matrixRubic[sides.right].push(cube);
  }

  // indexes back and front
  const lastSide = sideLength * sideLength - sideLength;
  for (let slice = 0; slice < sideLength; slice += 1) {
    const start = slice * totalColors;
    const end = start + sideLength;
    for (let cube = start; cube < end; cube += 1) {
      // color back
      matrixRubic[sides.back].push(cube);
      // color front
      matrixRubic[sides.front].push(cube + lastSide);
    }
  }
  return matrixRubic;
}

function colorRubik(matrix, matrixReference, cubes, sideLength) {
  const totalColors = sideLength * sideLength;
  const faceSides = {
    left: 0,
    right: 2,
    top: 4,
    bottom: 6,
    front: 8,
    back: 10,
  };

  console.log(matrixReference);
  console.log(matrix);
  for (let cube = 0; cube < totalColors; cube += 1) {
    // color bottom
    cubes[matrixReference[sides.bottom][cube]].setColor(faceSides.bottom, matrix[sides.bottom][cube]);
    // color top
    cubes[matrixReference[sides.top][cube]].setColor(faceSides.top, matrix[sides.top][cube]);
    // color left
    cubes[matrixReference[sides.left][cube]].setColor(faceSides.right, matrix[sides.left][cube]);
    // color right
    cubes[matrixReference[sides.right][cube]].setColor(faceSides.left, matrix[sides.right][cube]);
    // color front
    cubes[matrixReference[sides.front][cube]].setColor(faceSides.front, matrix[sides.front][cube]);
    // color back
    cubes[matrixReference[sides.back][cube]].setColor(faceSides.back, matrix[sides.back][cube]);
  }
}


function createLight() {
  const color = 0xFFFFFF;
  const intensity = 1;
  const light = new THREE.DirectionalLight(color, intensity);
  // light.position.set(-1, 2, 4)
  return light;
}

main();
