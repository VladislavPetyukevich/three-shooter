import { Vector3 } from 'three';
import { BehaviorProps, GunBehavior } from './GunBehavior';
import { Bullet } from '../Bullet/Bullet';

interface BehaviorBulletProps extends BehaviorProps {
  BulletClass: typeof Bullet;
}

export class GunBehaviorBullet extends GunBehavior {
  BulletClass: typeof Bullet;

  constructor(props: BehaviorBulletProps) {
    super(props);
    this.BulletClass = props.BulletClass;
  }

  shoot() {
    if (this.isShoot) {
      return;
    }
    if (!this.pullBullet()) {
      return;
    }
    this.handleShoot();
    this.lastShootBulletClass = this.BulletClass;
    const offsetX = this.bulletPositionOffset * Math.sin(this.rotationY);
    const offsetZ = this.bulletPositionOffset * Math.cos(this.rotationY);
    const bulletPosition = new Vector3(
      this.position.x + offsetX,
      this.position.y - (this.bulletPositionOffsetY || 0),
      this.position.z + offsetZ
    );
    const bulletDirection = new Vector3(
      Math.sin(this.rotationY),
      0,
      Math.cos(this.rotationY)
    ).normalize();
    for (let i = this.bulletsPerShoot; i--;) {
      const bulletDirectionWithOffset = bulletDirection.clone();
      const angleOffset = this.getAngleOffset();
      this.setHorizontalRecoil(bulletDirectionWithOffset, angleOffset);
      const bullet = new this.BulletClass({
        position: bulletPosition,
        direction: bulletDirectionWithOffset,
        container: this.container,
        author: this.bulletAuthor,
      });
      this.container.add(bullet);
    }
  }
};
