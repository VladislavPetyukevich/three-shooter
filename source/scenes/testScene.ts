import {
  PlaneGeometry,
  Mesh,
  AmbientLight,
  PointLight,
  Matrix4,
  MeshPhongMaterial,
  Vector3,
  Fog
} from 'three';
import { BasicSceneProps, BasicScene } from '@/core/Scene';
import { PI_180 } from '@/constants';
import { Player } from '@/Entities/Player/Player';
import { PLAYER } from '@/constants';
import { Wall } from '@/Entities/Wall/Wall';
import { Enemy } from '@/Entities/Enemy/Enemy';

const calculateCirclePoints = (angleStep: number, radius: number) => {
  const points = [];
  const maxAngle = 360;
  for (let angle = 0; angle < maxAngle; angle += angleStep) {
    const angleRadians = angle * PI_180;
    points.push({
      x: Math.cos(angleRadians) * radius,
      y: Math.sin(angleRadians) * radius
    });
  }
  return points;
};

export class TestScene extends BasicScene {
  pointLight: PointLight;
  cubes: Mesh[];
  player: Player;

  constructor(props: BasicSceneProps) {
    super(props);

    // lights
    this.scene.add(new AmbientLight(0x404040, 0.15));
    this.pointLight = new PointLight(0xffffff, 50, 100);
    this.pointLight.castShadow = true;
    this.pointLight.shadow.camera.near = 0.1;
    this.pointLight.shadow.camera.far = 25;
    this.scene.add(this.pointLight);

    this.scene.fog = new Fog(0x000000, 0.15, 80);

    const floorGeometry = new PlaneGeometry(300, 300, 50, 50);
    floorGeometry.applyMatrix(new Matrix4().makeRotationX(- Math.PI / 2));
    const floormaterial = new MeshPhongMaterial({ color: 'white' });
    const floormesh = new Mesh(floorGeometry, floormaterial);
    floormesh.receiveShadow = true;
    this.scene.add(floormesh);

    this.cubes = [];
    this.spawnObjects();

    this.player = this.entitiesContainer.add(
      new Player({
        camera: this.camera,
        position: new Vector3(0, PLAYER.BODY_HEIGHT, 0),
        container: this.entitiesContainer
      })
    );

    const enemy = this.entitiesContainer.add(
      new Enemy({
        position: { x: 5, y: 1, z: -5 },
        player: this.player
      })
    );
  }

  spawnCube(coordinates: { x: number, y: number }) {
    const wall = new Wall({
      position: new Vector3(coordinates.x, 1.5, coordinates.y)
    });
    this.entitiesContainer.add(wall);
  }

  spawnObjects() {
    const angleStep = 45;
    const cubeSpawnRadius = 30;
    const cubeSpawnCoordinates = calculateCirclePoints(angleStep, cubeSpawnRadius);

    cubeSpawnCoordinates.forEach(coordinates => this.spawnCube(coordinates));
  }

  update(delta: number) {
    super.update(delta);
    this.pointLight.position.copy(this.player.actor.mesh.position);
  }
}
