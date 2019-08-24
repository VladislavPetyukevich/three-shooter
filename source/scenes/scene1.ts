import {
  PlaneGeometry,
  Mesh,
  AmbientLight,
  PointLight,
  Matrix4,
  MeshPhongMaterial,
} from 'three';
import { Vec3 } from 'cannon';
import BasicScene, { BasicSceneProps } from './Scene';
import EventChannel from '../EventChannel';
import { EVENT_TYPES } from '../constants';
import shootSoundMp3 from '../assets/shoot.mp3';
import SoundsBuffer from '../Entities/Sounds/SoundsBuffer';
import { PI_180 } from '../utils';
import Enemy from '../Entities/Enemy';
import FlyingEnemy from '../Entities/FlyingEnemy';
import Entity from '../Entities/Entity';

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

class Scene1 extends BasicScene {
  enemiesCount: number;
  enemySoundsBuffer: SoundsBuffer;
  pointLight: PointLight;

  constructor(props: BasicSceneProps) {
    super(props);
    this.enemiesCount = 0;
    EventChannel.addSubscriber(this.enemiesEventsSubscriber);

    // Audio
    this.enemySoundsBuffer = new SoundsBuffer();
    this.enemySoundsBuffer.loadSound(shootSoundMp3);

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

    this.spawnEnemies();
  }

  spawnEnemy(coordinates: { x: number, y: number }) {
    this.entitiesContainer.createEntity(
      Enemy,
      {
        playerBody: this.player.actor.solidBody.body,
        position: new Vec3(coordinates.x, 1.5, coordinates.y),
        audioListener: this.audioListener,
        soundsBuffer: this.enemySoundsBuffer
      }
    );
    this.enemiesCount++;
  }

  spawnFlyingEnemy(coordinates: { x: number, y: number }) {
    this.entitiesContainer.createEntity(
      FlyingEnemy,
      {
        playerBody: this.player.actor.solidBody.body,
        position: new Vec3(coordinates.x, 5, coordinates.y)
      }
    );
    this.enemiesCount++;
  }

  spawnEnemies() {
    const angleStep = 45;
    const enemySpawnRadius = 100;
    const flyingEnemySpawnRadius = 150;
    const enemySpawnCoordinates = calculateCirclePoints(angleStep, enemySpawnRadius);
    const flyingEnemySpawnCoordinates = calculateCirclePoints(angleStep, flyingEnemySpawnRadius);

    enemySpawnCoordinates.forEach(coordinates => this.spawnEnemy(coordinates));
    flyingEnemySpawnCoordinates.forEach(coordinates => this.spawnFlyingEnemy(coordinates));
  }

  enemiesEventsSubscriber = (eventType: EVENT_TYPES, entity: Entity) => {
    switch (eventType) {
      case EVENT_TYPES.DELETE_ENTITIY:
        const isEnemy = entity instanceof Enemy;
        const isFlyingEnemy = entity instanceof FlyingEnemy;
        if (!isEnemy && !isFlyingEnemy) {
          break;
        }
        this.enemiesCount--;
        if (this.enemiesCount <= 0) {
          this.spawnEnemies();
        }
        break;
    }
  }

  update(delta: number) {
    super.update(delta);
    this.pointLight.position.copy(this.player.actor.solidBody.body.position);
  }
}

export default Scene1;
