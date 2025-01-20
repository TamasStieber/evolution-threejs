import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { BlobColors, BlobTypes, ControllerTypes } from './interfaces';
import KeyboardController from './KeyboardController';

interface BlobArguments {
  x: number;
  z: number;
  controllerType: ControllerTypes | null;
  intersectingObjects: THREE.Object3D[];
}

const baseSpeed = 0.05;
const sprintMultiplier = 2;
const angularVelocity = 0.05;
const model = '/blob2.glb';

class Blob extends THREE.Object3D {
  protected baseSpeed: number;
  protected sprintMultiplier: number;
  protected speed: number;
  protected angularVelocity: number;
  protected controller: KeyboardController | null = null;
  intersectingObjects: THREE.Object3D[] = [];

  constructor({ x, z, controllerType, intersectingObjects }: BlobArguments) {
    super();

    if (controllerType === ControllerTypes.KEYBOARD) {
      this.controller = new KeyboardController();
    }

    this.baseSpeed = baseSpeed;
    this.sprintMultiplier = sprintMultiplier;
    this.speed = this.baseSpeed;
    this.angularVelocity = angularVelocity;
    this.intersectingObjects = intersectingObjects;
    this.position.set(x, 0.5, z);
  }

  protected loadModel(blobType: BlobTypes) {
    const loader = new GLTFLoader();
    loader.load(model, (gltf) => {
      const blob = gltf.scene.children[0] as THREE.Mesh;
      // const material = outer.material as THREE.MeshBasicMaterial;

      // const outer = blob.children[0].children[0].children[0].children[0]
      //   .children[0] as THREE.Mesh;
      // blob.material.color = new THREE.Color(color);
      const color =
        blobType === BlobTypes.CARNIVORE
          ? BlobColors.CARNIVORE
          : BlobColors.HERBIVORE;
      blob.material = new THREE.MeshBasicMaterial({ color: color });
      blob.castShadow = true;
      blob.receiveShadow = true;
      this.add(blob);
    });
  }

  update() {
    if (!this.controller) return;
    let direction = new THREE.Vector3();
    this.getWorldDirection(direction);

    if (this.controller.forward) {
      this.position.addScaledVector(direction, this.speed);
    }
    if (this.controller.backward) {
      this.position.addScaledVector(direction, -this.speed * 0.7);
    }
    if (this.controller.left) {
      this.rotation.y += this.angularVelocity;
    }
    if (this.controller.right) {
      this.rotation.y -= this.angularVelocity;
    }
  }
}

export default Blob;
