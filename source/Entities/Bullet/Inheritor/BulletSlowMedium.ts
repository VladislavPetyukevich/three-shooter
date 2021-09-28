import { Bullet, BulletProps } from '../Bullet';
import { ENEMY } from '@/constants';

export class BulletSlowMeidum extends Bullet {
  constructor(props: BulletProps) {
    super(props);
    this.setDamage(2);
    this.setSpeed(ENEMY.BULLET_SPEED);
  }
}

