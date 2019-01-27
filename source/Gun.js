import { Vector3, Ray } from 'three';
import Bullet from './Bullet';

function getShootDir(camera) {
  const shootDirection = new Vector3();
  const vector = shootDirection;
  shootDirection.set(0, 0, 1);
  vector.unproject(camera);
  const ray = new Ray(camera.position, vector.sub(camera.position).normalize());
  shootDirection.copy(ray.direction);
  return shootDirection;
}

export default class Gun {
  constructor(props) {
    this.playerControls = props.controls;
    this.playerscene = props.scene;

    window.addEventListener('mousedown', () => {
      if (event.which === 1) {
        this.shoot();
      }
    });
  }

  shoot = () => {
    const shootDirection = getShootDir(this.playerControls.getCamera());
    const bullet = new Bullet(shootDirection);
    bullet.position.copy(this.playerControls.getObject().position);
    this.playerscene.add(bullet);
  }
}
