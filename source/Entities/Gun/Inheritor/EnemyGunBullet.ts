import { EnemyInheritorGunProps } from './InheritorTypes';
import { GunBullet } from '../GunBullet';
import { Bullet } from '@/Entities/Bullet/Bullet';

interface EnemyGunBulletProps extends EnemyInheritorGunProps {
  BulletClass: typeof Bullet;
}

export class EnemyGunBullet extends GunBullet {
  constructor(props: EnemyGunBulletProps) {
    super({
      ...props,
      BulletClass: props.BulletClass,
      shootOffsetAngle: 2.5,
      shootOffsetInMoveAngle: 4.5,
      shootOffsetY: false,
      bulletsPerShoot: 1,
      shootsToMaxHeat: 1000,
      shootSoundName: 'shootShotgun',
      positionalAudio: true,
    });
  }
}
