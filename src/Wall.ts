import * as THREE from 'three';

class Wall extends THREE.Mesh {
  constructor(width: number, height: number) {
    super();

    const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
    // material.side = THREE.DoubleSide;

    this.geometry = new THREE.PlaneGeometry(width, height);
    this.material = material;

    this.rotation.x = Math.PI / 2;
    // this.castShadow = true;
    // this.receiveShadow = true;
    this.visible = true;
  }
}

export default Wall;
