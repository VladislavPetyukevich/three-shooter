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
    this.playerWorld = props.world;
    this.bullets = [];
    this.isShoots = false;
    this.shootInterval = props.shootInterval;
    this.lastShotInterval = 0;

    window.addEventListener('mousedown', () => {
      if (event.which === 1) {
        this.isShoots = true;
        this.shoot();
      }
    });

    window.addEventListener('mouseup', () => {
      if (event.which === 1) {
        this.isShoots = false;
        this.lastShotInterval = 0;
      }
    });
  }

  shoot = () => {
    const shootDirection = getShootDir(this.playerControls.getCamera());
    const bulletShapeRadius = 0.3;
    var shootVelocity = 70;
    const playerSphere = this.playerControls.getCannonBody();
    const bulletPositionOffset = playerSphere.shapes[0].radius * 1.02 + bulletShapeRadius;
    const bulletPosition = new Vector3(
      playerSphere.position.x + shootDirection.x * bulletPositionOffset,
      playerSphere.position.y + shootDirection.y * bulletPositionOffset,
      playerSphere.position.z + shootDirection.z * bulletPositionOffset
    );
    const bullet = new Bullet(
      bulletShapeRadius,
      bulletPosition,
      1
    );
    bullet.body.velocity.set(
      shootDirection.x * shootVelocity,
      shootDirection.y * shootVelocity,
      shootDirection.z * shootVelocity
    );
    this.playerscene.add(bullet.mesh);
    this.playerWorld.addBody(bullet.body)
    this.bullets.push(bullet);
  }

  deleteBulletByUuid(uuid) {
    const bullets = this.bullets;
    for (var i = bullets.length; i--;) {
      const bullet = bullets[i];
      if (bullet.mesh.uuid === uuid) {
        this.bullets.splice(i, 1);
        return;
      }
    }
  }

  update(delta) {
    if (this.isShoots) {
      this.lastShotInterval += delta;
      if (this.lastShotInterval >= this.shootInterval) {
        this.lastShotInterval -= this.shootInterval;
        this.shoot();
      }
    }
    this.bullets.forEach(bullet => bullet.update(delta));
    const bulletToDelete = this.bullets.filter(bullet => bullet.lifeTimeRemaining <= 0);
    bulletToDelete.forEach(bullet => {
      this.playerscene.remove(bullet.mesh);
      this.playerWorld.remove(bullet.body);
      this.deleteBulletByUuid(bullet.mesh.uuid);
    });
  }
}
