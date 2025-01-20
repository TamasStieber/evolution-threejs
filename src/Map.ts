import * as THREE from 'three';
import Wall from './Wall';

class Map extends THREE.Mesh {
  walls: Wall[] = [];
  constructor(mapWidth = 20, mapHeight = 20, buildWalls = true) {
    super();

    const texture = new THREE.TextureLoader().load('/rb_1308.png');
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(10, 5);

    const material = new THREE.MeshStandardMaterial({
      color: 0x98c687,
      map: texture,
    });

    this.geometry = new THREE.PlaneGeometry(mapWidth, mapHeight);
    this.material = material;

    if (buildWalls) this.buildWalls(mapWidth, mapHeight, 10);

    this.rotation.x = -Math.PI / 2;
    this.receiveShadow = true;
    this.visible = true;
  }

  private buildWalls(mapWidth: number, mapHeight: number, wallHeight: number) {
    const topWall = new Wall(mapWidth, wallHeight);
    topWall.position.set(0, mapHeight / 2, 0);
    this.add(topWall);
    this.walls.push(topWall);

    const bottomWall = new Wall(mapWidth, wallHeight);
    bottomWall.position.set(0, -mapHeight / 2, 0);
    bottomWall.rotation.y = Math.PI * 1;
    this.add(bottomWall);
    this.walls.push(bottomWall);

    const leftWall = new Wall(mapHeight, wallHeight);
    leftWall.position.set(-mapWidth / 2, 0, 0);
    leftWall.rotation.y = Math.PI / 2;
    this.add(leftWall);
    this.walls.push(leftWall);

    const rightWall = new Wall(mapHeight, wallHeight);
    rightWall.position.set(mapWidth / 2, 0, 0);
    rightWall.rotation.y = Math.PI * 1.5;
    this.add(rightWall);
    this.walls.push(rightWall);
  }
}

export default Map;
