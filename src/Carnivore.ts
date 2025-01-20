import * as THREE from 'three';
import Blob from './Blob';
import { BlobTypes } from './interfaces';

const ENERGY_CONSUMPTION_RATE = 0.5;
const ENERGY_GAIN_RATE = 0.1;
const MAX_ENERGY = 100;
const ENERGY_RECOVERY_THRESHOLD = 30;

class Carnivore extends Blob {
  private energy = MAX_ENERGY;
  private energyDepleted = false;
  private raycaster = new THREE.Raycaster(); // 🚀 Create Raycaster
  private numRays = 15; // Number of rays to cast
  private rayLength = 15; // Fixed ray length
  private fov = 60; // Field of view (degrees)

  constructor(...args: ConstructorParameters<typeof Blob>) {
    super(...args);
    this.loadModel(BlobTypes.CARNIVORE);
  }

  update() {
    super.update();

    // this.castRay();
    this.castMultipleRays(); // Call the method to cast multiple rays

    const isSprinting =
      this.controller?.sprint &&
      this.controller?.forward &&
      !this.energyDepleted;

    this.speed = isSprinting
      ? this.baseSpeed * this.sprintMultiplier
      : this.baseSpeed;

    isSprinting ? this.consumeEnergy() : this.gainEnergy();
  }

  private consumeEnergy() {
    this.energy = Math.max(0, this.energy - ENERGY_CONSUMPTION_RATE);
    this.energyDepleted = this.energy === 0;
  }

  private gainEnergy() {
    this.energy = Math.min(MAX_ENERGY, this.energy + ENERGY_GAIN_RATE);
    if (this.energy > ENERGY_RECOVERY_THRESHOLD) this.energyDepleted = false;
  }

  // private castRay() {
  //   const origin = new THREE.Vector3(
  //     this.position.x + 0.5,
  //     this.position.y,
  //     this.position.z + 0.5
  //   );
  //   let direction = new THREE.Vector3();
  //   this.getWorldDirection(direction);

  //   this.raycaster.set(origin, direction.normalize());
  //   this.raycaster.far = this.rayLength;

  //   const intersects = this.raycaster.intersectObjects(
  //     this.intersectingObjects,
  //     true
  //   );

  //   this.visualizeRay(this.raycaster);

  //   if (intersects.length > 0) {
  //     console.log(intersects[0]); // Log first hit object
  //   }
  // }

  private castMultipleRays() {
    // Get the forward direction of the carnivore
    let forwardDirection = new THREE.Vector3();
    this.getWorldDirection(forwardDirection); // Get the forward direction

    // Define the sphere radius (diameter = 1, so radius = 0.5)
    const modelRadius = 0.51; // Slightly larger than 0.5 to prevent self-intersection

    // Calculate the step for each ray within the field of view
    const step = this.fov / (this.numRays - 1); // Step size for distributing rays

    // Cast rays at different angles within the field of view
    for (let i = 0; i < this.numRays; i++) {
      // Calculate the angle for each ray within the field of view
      const angle = (i * step - this.fov / 2) * (Math.PI / 180); // Convert degrees to radians

      // Rotate the forward direction to get the ray's direction
      const rayDirection = forwardDirection
        .clone()
        .applyAxisAngle(new THREE.Vector3(0, 1, 0), angle) // Rotate around the Y-axis
        .normalize();

      // Offset the ray origin slightly in the direction of the ray to prevent self-intersection
      const rayOrigin = this.position
        .clone()
        .add(rayDirection.clone().multiplyScalar(modelRadius));

      // Cast the ray using the raycaster
      this.raycaster.set(rayOrigin, rayDirection);
      this.raycaster.far = this.rayLength;

      const intersects = this.raycaster.intersectObjects(
        this.intersectingObjects,
        true
      );

      // this.visualizeRay(this.raycaster, i); // Uncomment for debugging

      if (intersects.length > 0) {
        // console.log(`Ray ${i} hit object at distance: ${intersects[0].object}`);
        console.log(intersects[0].object.parent);
      }
    }
  }

  // private castMultipleRays() {
  //   // Get the forward direction of the carnivore
  //   const origin = new THREE.Vector3(
  //     this.position.x,
  //     this.position.y,
  //     this.position.z
  //   );
  //   let direction = new THREE.Vector3();
  //   this.getWorldDirection(direction); // Forward direction of the carnivore

  //   // Calculate the step for each ray within the field of view
  //   const step = this.fov / (this.numRays - 1); // Step size for distributing rays

  //   // Cast rays at different angles within the field of view
  //   for (let i = 0; i < this.numRays; i++) {
  //     // Calculate the angle for each ray within the field of view
  //     const angle = (i * step - this.fov / 2) * (Math.PI / 180); // Convert degrees to radians
  //     const rayDirection = direction
  //       .clone()
  //       .applyAxisAngle(new THREE.Vector3(0, 1, 0), angle); // Rotate direction

  //     // Cast the ray using the raycaster
  //     this.raycaster.set(origin, rayDirection.normalize());
  //     this.raycaster.far = this.rayLength;

  //     const intersects = this.raycaster.intersectObjects(
  //       this.intersectingObjects,
  //       true
  //     );
  //     // this.visualizeRay(this.raycaster, i);

  //     if (intersects.length > 0) {
  //       console.log(`Ray ${i} hit object at distance: ${intersects[0].distance}`)
  //     }
  //   }
  // }

  // private visualizeRay(raycaster: THREE.Raycaster) {
  //   const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
  //   const direction = raycaster.ray.direction
  //     .clone()
  //     .multiplyScalar(raycaster.far);
  //   const origin = new THREE.Vector3(
  //     this.position.x + 0.5,
  //     this.position.y,
  //     this.position.z + 0.5
  //   );
  //   const points = [origin.clone(), origin.clone().add(direction)];
  //   const geometry = new THREE.BufferGeometry().setFromPoints(points);
  //   const line = new THREE.Line(geometry, material);

  //   this.parent?.add(line); // Add line to the scene
  //   setTimeout(() => this.parent?.remove(line), 10); // Remove after 100ms
  // }

  private visualizeRay(raycaster: THREE.Raycaster, rayIndex: number) {
    const material = new THREE.LineBasicMaterial({ color: 0xff0000 });

    // Get the ray's origin from the raycaster (it was already offset in castMultipleRays)
    const rayOrigin = raycaster.ray.origin.clone();

    // Get the ray's direction and extend it to the max ray length
    const rayEnd = rayOrigin
      .clone()
      .add(raycaster.ray.direction.clone().multiplyScalar(raycaster.far));

    // Create a line geometry from the ray origin to the ray end
    const points = [rayOrigin, rayEnd];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, material);

    // Optional: Add a label or identifier for each ray (e.g., rayIndex)
    line.userData = { rayIndex };

    this.parent?.add(line); // Add line to the scene
    setTimeout(() => this.parent?.remove(line), 1); // Remove after 100ms for a smooth effect
  }
}

export default Carnivore;
