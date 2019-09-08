import {
  PlaneGeometry,
  Mesh,
  AmbientLight,
  PointLight,
  Matrix4,
  MeshPhongMaterial,
  BoxGeometry,
  MeshBasicMaterial,
} from 'three';
import BasicScene, { BasicSceneProps } from '@/core/Scene';
import { PI_180 } from '@/utils';
import PhysicsBox from '@/SolidBody/PhysicsBox';

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

class TestScene extends BasicScene {
  pointLight: PointLight;
  cubes: PhysicsBox[];

  constructor(props: BasicSceneProps) {
    super(props);

    // lights
    this.scene.add(new AmbientLight(0x404040, 5));
    this.pointLight = new PointLight(0xffffff, 50, 100);
    this.pointLight.castShadow = true;
    this.pointLight.shadow.camera.near = 0.1;
    this.pointLight.shadow.camera.far = 25;
    this.scene.add(this.pointLight);

    const floorGeometry = new PlaneGeometry(300, 300, 50, 50);
    floorGeometry.applyMatrix(new Matrix4().makeRotationX(- Math.PI / 2));
    const floormaterial = new MeshPhongMaterial({ color: 'white' });
    const floormesh = new Mesh(floorGeometry, floormaterial);
    floormesh.castShadow = true;
    floormesh.receiveShadow = true;
    this.scene.add(floormesh);

    this.cubes = [];
    this.spawnObjects();
  }

  spawnCube(coordinates: { x: number, y: number }) {
    const cube = new PhysicsBox(
      new BoxGeometry(3, 3, 3),
      new MeshBasicMaterial({ color: 'blue' }),
      { x: coordinates.x, y: 3, z: coordinates.y }
    );

    this.cubes.push(cube);
    this.scene.add(cube.mesh!);
    this.world.addBody(cube.body!);
  }

  spawnObjects() {
    const angleStep = 45;
    const cubeSpawnRadius = 30;
    const cubeSpawnCoordinates = calculateCirclePoints(angleStep, cubeSpawnRadius);

    cubeSpawnCoordinates.forEach(coordinates => this.spawnCube(coordinates));
  }

  update(delta: number) {
    super.update(delta);
    this.pointLight.position.copy(this.player.actor.solidBody.body.position);
    this.cubes.forEach(cube => cube.update());
  }
}

export default TestScene;
