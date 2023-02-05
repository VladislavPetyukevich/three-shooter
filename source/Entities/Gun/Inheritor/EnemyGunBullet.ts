import { GunFireType } from '../Gun';
import { InheritorGunProps } from './InheritorTypes';
import { GunBullet } from '../GunBullet';
import { Bullet } from '@/Entities/Bullet/Bullet';

interface EnemyGunBulletProps extends InheritorGunProps {
  BulletClass: typeof Bullet;
}

export class EnemyGunBullet extends GunBullet {
  constructor(props: EnemyGunBulletProps) {
    super({
      ...props,
      BulletClass: props.BulletClass,
      shootOffsetAngle: 2.5,
      shootOffsetInMoveAngle: 4.5,
      bulletsPerShoot: 1,
      recoilTime: 0.15,
      shootsToMaxHeat: 1000,
      fireType: GunFireType.automatic,
    });
  }
}
