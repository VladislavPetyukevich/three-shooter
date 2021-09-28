import { Bullet, BulletProps } from '../Bullet';
import { ENEMY } from '@/constants';

export class BulletFastEasy extends Bullet {
  constructor(props: BulletProps) {
    super(props);
    this.setDamage(1);
    this.setSpeed(ENEMY.BULLET_SPEED * 1.3);
  }
}

