import { Bullet, BulletProps } from '../Bullet';
import { ENEMY } from '@/constants';

export class BulletShoutgunPlayer extends Bullet {
  constructor(props: BulletProps) {
    super(props);
    this.setDamage(2);
    this.setSpeed(ENEMY.BULLET_SPEED * 2);
  }
}
