import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { BlobColors, BlobTypes, ControllerTypes } from './interfaces';
import KeyboardController from './KeyboardController';
import Wall from './Wall';

interface BlobArguments {
  x: number;
  z: number;
  controllerType: ControllerTypes | null;
}

const baseSpeed = 0.05;
const sprintMultiplier = 2;
const angularVelocity = 0.05;
const model = '/blob.glb';
const wallSensingRayDirections = [
  {
    offset: new THREE.Vector3(0, 0, -0.5),
    direction: new THREE.Vector3(0, 0, -1),
  },
  {
    offset: new THREE.Vector3(0, 0, 0.5),
    direction: new THREE.Vector3(0, 0, 1),
  },
  {
    offset: new THREE.Vector3(-0.5, 0, 0),
    direction: new THREE.Vector3(-1, 0, 0),
  },
  {
    offset: new THREE.Vector3(0.5, 0, 0),
    direction: new THREE.Vector3(1, 0, 0),
  },
];

class Blob extends THREE.Object3D {
  protected baseSpeed = baseSpeed;
  protected sprintMultiplier = sprintMultiplier;
  protected speed = baseSpeed;
  protected angularVelocity = angularVelocity;
  protected controller: KeyboardController | null = null;
  // protected wallSensingRayDirections = [
  //   new THREE.Vector3(0, 0, -1),
  //   new THREE.Vector3(0, 0, 1),
  //   new THREE.Vector3(-1, 0, 0),
  //   new THREE.Vector3(1, 0, 0),
  // ];
  protected wallSensingRayLength = 70;
  protected topWallDistance = 0;
  protected bottomWallDistance = 0;
  protected leftWallDistance = 0;
  protected rightWallDistance = 0;
  private WallSensingRaycaster = new THREE.Raycaster(); // 🚀 Create Raycaster

  constructor({ x, z, controllerType }: BlobArguments) {
    super();

    if (controllerType === ControllerTypes.KEYBOARD) {
      this.controller = new KeyboardController();
    }

    this.position.set(x, 0.5, z);
  }

  protected loadModel(blobType: BlobTypes) {
    const loader = new GLTFLoader();
    loader.load(model, (gltf) => {
      const blob = gltf.scene.children[0] as THREE.Mesh;
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

  private castWallSensingRays(walls: Wall[]) {
    const origin = this.position;
    for (let i = 0; i < wallSensingRayDirections.length; i++) {
      this.WallSensingRaycaster.set(
        origin.clone().add(wallSensingRayDirections[i].offset),
        wallSensingRayDirections[i].direction
      );
      this.WallSensingRaycaster.far = this.wallSensingRayLength;

      const intersects = this.WallSensingRaycaster.intersectObjects(
        walls,
        false
      );

      this.visualizeWallSensingRay(this.WallSensingRaycaster);

      if (intersects.length > 0) {
        switch (i) {
          case 0:
            this.topWallDistance = parseFloat(
              intersects[0].distance.toFixed(2)
            );
            break;
          case 1:
            this.bottomWallDistance = parseFloat(
              intersects[0].distance.toFixed(2)
            );
            break;
          case 2:
            this.leftWallDistance = parseFloat(
              intersects[0].distance.toFixed(2)
            );
            break;
          case 3:
            this.rightWallDistance = parseFloat(
              intersects[0].distance.toFixed(2)
            );
            break;
        }
        // console.log(intersects[0]); // Log first hit object
        // console.log(this);
      }
    }
  }

  private visualizeWallSensingRay(raycaster: THREE.Raycaster) {
    const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
    const direction = raycaster.ray.direction
      .clone()
      .multiplyScalar(raycaster.far);

    const points = [
      raycaster.ray.origin.clone(),
      raycaster.ray.origin.clone().add(direction),
    ];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, material);

    this.parent?.add(line); // Add line to the scene
    setTimeout(() => this.parent?.remove(line), 1); // Remove after 100ms
  }

  // private visualizeWallSensingRay(
  //   raycaster: THREE.Raycaster,
  //   origin: THREE.Vector3
  // ) {
  //   const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
  //   const direction = raycaster.ray.direction
  //     .clone()
  //     .multiplyScalar(raycaster.far);

  //   const points = [origin.clone(), origin.clone().add(direction)];
  //   const geometry = new THREE.BufferGeometry().setFromPoints(points);
  //   const line = new THREE.Line(geometry, material);

  //   this.parent?.add(line); // Add line to the scene
  //   setTimeout(() => this.parent?.remove(line), 1); // Remove after 100ms
  // }

  // protected update(walls: Wall[]) {
  //   this.castWallSensingRays(walls);
  //   if (!this.controller) return;
  //   let direction = new THREE.Vector3();
  //   this.getWorldDirection(direction);

  //   if (this.controller.forward) {
  //     const currentZ = this.position.z;
  //     this.position.addScaledVector(direction, this.speed);
  //     if (this.topWallDistance <= 0) this.position.z = currentZ;
  //   }
  //   if (this.controller.backward) {
  //     this.position.addScaledVector(direction, -this.speed * 0.7);
  //   }
  //   if (this.controller.left) {
  //     this.rotation.y += this.angularVelocity;
  //   }
  //   if (this.controller.right) {
  //     this.rotation.y -= this.angularVelocity;
  //   }
  // }

  protected update() {
    const mapWidth = 70; // Map width
    const mapHeight = 36; // Map height
    const entityRadius = 0.5; // Entity radius

    // Map boundaries considering the center (0, 0)
    const leftBoundary = -mapWidth / 2; // -35
    const rightBoundary = mapWidth / 2; // 35
    const topBoundary = mapHeight / 2; // 18
    const bottomBoundary = -mapHeight / 2; // -18

    if (!this.controller) return;

    let direction = new THREE.Vector3();
    this.getWorldDirection(direction);

    // Calculate movement deltas (based on speed and direction)
    let deltaX = direction.x * this.speed;
    let deltaZ = direction.z * this.speed;

    let newX = this.position.x;
    let newZ = this.position.z;

    // Prevent moving past left and right boundaries (X-axis)
    if (this.controller.forward || this.controller.backward) {
      if (newX + deltaX - entityRadius < leftBoundary) {
        newX = leftBoundary + entityRadius; // Block movement if past the left boundary
      } else if (newX + deltaX + entityRadius > rightBoundary) {
        newX = rightBoundary - entityRadius; // Block movement if past the right boundary
      } else {
        newX += deltaX; // Otherwise, move as usual
      }
    }

    // Prevent moving past top and bottom boundaries (Z-axis)
    if (this.controller.forward || this.controller.backward) {
      if (newZ + deltaZ - entityRadius < bottomBoundary) {
        newZ = bottomBoundary + entityRadius; // Block movement if past the bottom boundary
      } else if (newZ + deltaZ + entityRadius > topBoundary) {
        newZ = topBoundary - entityRadius; // Block movement if past the top boundary
      } else {
        newZ += deltaZ; // Otherwise, move as usual
      }
    }

    // Apply the calculated position
    this.position.x = newX;
    this.position.z = newZ;

    // Handle rotation (left and right)
    if (this.controller.left) {
      this.rotation.y += this.angularVelocity;
    }
    if (this.controller.right) {
      this.rotation.y -= this.angularVelocity;
    }

    // Debug log (optional)
    console.log(`Position: x = ${this.position.x}, z = ${this.position.z}`);
  }
}

export default Blob;
