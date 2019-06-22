import {
  PlaneGeometry,
  Mesh,
  AmbientLight,
  PointLight,
  Matrix4,
  MeshPhongMaterial,
} from 'three';
import { Vec3 } from 'cannon';
import BasicScene from './Scene';
import EventChannel from '../EventChannel';
import { EVENT_TYPES } from '../constants';
import shootSoundMp3 from '../assets/shoot.mp3';
import SoundsBuffer from '../SoundsBuffer';

class Scene1 extends BasicScene {
  constructor(props) {
    super(props);
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

  spawnEnemies() {
    const angleStep = 45;
    const maxAngle = 360;
    const radius = 100;
    for (let angle = 0; angle < maxAngle; angle += angleStep) {
      const angleRadians = angle * Math.PI / 180;
      const x = Math.cos(angleRadians) * radius;
      const y = Math.sin(angleRadians) * radius;

      this.entitiesContainer.createEntity(
        'Enemy',
        {
          playerBody: this.player.actor.solidBody.body,
          position: new Vec3(x, 1.5, y),
          audioListener: this.audioListener,
          soundsBuffer: this.enemySoundsBuffer
        }
      );
    }
  }

  enemiesEventsSubscriber = (eventType, targetEnemy) => {
    switch (eventType) {
      case EVENT_TYPES.DELETE_ENEMY:
        console.log('EVENT_TYPES.DELETE_ENEMY');
        break;
    }
  }

  update(delta) {
    super.update(delta);
    this.pointLight.position.copy(this.player.actor.solidBody.body.position);
  }
}

export default Scene1;
