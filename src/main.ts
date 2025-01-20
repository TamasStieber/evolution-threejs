import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import Carnivore from './Carnivore';
import Herbivore from './Herbivore';
import Map from './Map';
import { ControllerTypes } from './interfaces';
import { getRandomFloat } from './commonFunctions';

const scene = new THREE.Scene();

const mapWidth = 70;
const mapHeight = 36;

const hdr = 'https://sbcode.net/img/rustig_koppie_puresky_1k.hdr';

let environmentTexture: THREE.DataTexture;

new RGBELoader().load(hdr, (texture) => {
  environmentTexture = texture;
  environmentTexture.mapping = THREE.EquirectangularReflectionMapping;
  environmentTexture.offset.set(0.3, 0.2);
  scene.environment = environmentTexture;
  // scene.background = environmentTexture;
  scene.environmentIntensity = 0.8; // added in Three r163
  const planeGeometry = new THREE.PlaneGeometry(500, 500);
  const planeMaterial = new THREE.MeshBasicMaterial({
    map: environmentTexture,
  });
  const backgroundPlane = new THREE.Mesh(planeGeometry, planeMaterial);
  backgroundPlane.rotation.x = Math.PI * 1.5;
  backgroundPlane.position.set(0, -1, 0);
  scene.add(backgroundPlane);
});

const directionallight = new THREE.DirectionalLight(0xebfeff, Math.PI * 1);
directionallight.position.set(10, 20, 10);
directionallight.visible = true;
directionallight.shadow.camera.near = 0;
directionallight.shadow.camera.far = 100;
directionallight.shadow.camera.left = -40;
directionallight.shadow.camera.right = 40;
directionallight.shadow.camera.top = 40;
directionallight.shadow.camera.bottom = -40;
directionallight.castShadow = true;
directionallight.shadow.mapSize.width = 2048;
directionallight.shadow.mapSize.height = 2048;
scene.add(directionallight);

// const camera = new THREE.PerspectiveCamera(
//   75,
//   window.innerWidth / window.innerHeight,
//   0.1,
//   100
// );

const mapAspectRatio = mapWidth / mapHeight;
const cameraMargin = 10;
const mapWidthMargin = cameraMargin;
const mapHeightMargin = cameraMargin / mapAspectRatio;

const left = -(mapWidth + mapWidthMargin) / 2;
const right = (mapWidth + mapWidthMargin) / 2;
const top = (mapHeight + mapHeightMargin) / 2;
const bottom = -(mapHeight + mapHeightMargin) / 2;

const camera = new THREE.OrthographicCamera(left, right, top, bottom);
// const camera = new THREE.OrthographicCamera(-50, 50, 30, -30);
camera.position.set(0, 100, 0);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

window.addEventListener('resize', () => {
  // camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// const controls = new OrbitControls(camera, renderer.domElement);
// controls.enableDamping = true;

const texture = new THREE.TextureLoader().load(
  'https://sbcode.net/img/grid.png'
);
texture.colorSpace = THREE.SRGBColorSpace;

const carnivoreCount = 50;
const herbivoreCount = 50;

const map = new Map(mapWidth, mapHeight, true);
scene.add(map);

// const blobs: Carnivore | Herbivore[] = [];
const blobs: THREE.Object3D[] = [];

const model = '/blob.glb';
let dummyBlob;
let modelSize = new THREE.Vector3();

await new GLTFLoader().loadAsync(model).then((gltf) => {
  dummyBlob = gltf.scene.children[0] as THREE.Object3D;
});

if (dummyBlob) {
  const boundingBox = new THREE.Box3().setFromObject(dummyBlob);
  modelSize = boundingBox.getSize(new THREE.Vector3());
}

const minX = -mapWidth / 2 + modelSize.x / 2;
const maxX = mapWidth / 2 - modelSize.x / 2;
const minZ = -mapHeight / 2 + modelSize.z / 2;
const maxZ = mapHeight / 2 - modelSize.z / 2;

for (let i = 0; i < carnivoreCount; i++) {
  const x = getRandomFloat(minX, maxX);
  const z = getRandomFloat(minZ, maxZ);
  blobs.push(
    new Carnivore({
      x: x,
      z: z,
      controllerType: ControllerTypes.NONE,
      intersectingObjects: blobs,
    })
  );
}
// for (let i = 0; i < herbivoreCount; i++) {
//   const x = getRandomFloat(minX, maxX);
//   const z = getRandomFloat(minZ, maxZ);
//   blobs.push(new Herbivore(x, z));
// }

const carnivoreData = {
  x: 0,
  z: 0,
  controllerType: ControllerTypes.KEYBOARD,
  intersectingObjects: blobs,
};
const herbivoreDate = {
  x: 10,
  z: 10,
  controllerType: ControllerTypes.NONE,
  intersectingObjects: map.walls,
};

const carnivore = new Carnivore(carnivoreData);
blobs.push(carnivore);
// scene.add(carnivore);
const herbivore = new Herbivore(herbivoreDate);
scene.add(herbivore);
blobs.push(herbivore);

scene.add(...blobs);
// carnivore.position.z = minZ;

const data = {
  environment: true,
  background: true,
  mapEnabled: false,
  planeVisible: false,
};

const gui = new GUI();

gui.add(data, 'environment').onChange(() => {
  if (data.environment) {
    scene.environment = environmentTexture;
    directionallight.visible = false;
  } else {
    scene.environment = null;
    directionallight.visible = true;
  }
});

gui.add(scene, 'environmentIntensity', 0, 2, 0.01); // new in Three r163. Can be used instead of `renderer.toneMapping` with `renderer.toneMappingExposure`

gui.add(renderer, 'toneMappingExposure', 0, 2, 0.01);

gui.add(data, 'background').onChange(() => {
  if (data.background) {
    scene.background = environmentTexture;
  } else {
    scene.background = null;
  }
});

gui.add(scene, 'backgroundBlurriness', 0, 1, 0.01);

gui.add(data, 'mapEnabled').onChange(() => {
  if (data.mapEnabled) {
    // material.map = texture;
  } else {
    // material.map = null;
  }
  // material.needsUpdate = true;
});

gui.add(data, 'planeVisible').onChange((v) => {
  // plane.visible = v;
});

const stats = new Stats();
document.body.appendChild(stats.dom);

function animate() {
  requestAnimationFrame(animate);

  // controls.update();

  carnivore.update();

  renderer.render(scene, camera);

  stats.update();
}

animate();
