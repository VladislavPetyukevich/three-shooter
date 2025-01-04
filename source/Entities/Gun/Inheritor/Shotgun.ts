import { GunFireType } from '../Gun';
import { InheritorGunProps } from './InheritorTypes';
import { texturesStore } from '@/core/loaders/TextureLoader';
import { GunBullet } from '../GunBullet';
import { Bullet } from '@/Entities/Bullet/Bullet';

interface EnemyGunBulletProps extends InheritorGunProps {
  BulletClass: typeof Bullet;
  shootOffsetY: boolean;
}

export class Shotgun extends GunBullet {
  constructor(props: EnemyGunBulletProps) {
    super({
      ...props,
      BulletClass: props.BulletClass,
      shootOffsetAngle: 2.5,
      shootOffsetInMoveAngle: 4.5,
      shootOffsetY: props.shootOffsetY,
      bulletsPerShoot: 8,
      recoilTime: 0.2,
      shootsToMaxHeat: 1000,
      fireType: GunFireType.single,
      hudTextures: {
        idle: texturesStore.getTexture('gunTextureFile'),
        fire: texturesStore.getTexture('gunFireFile'),
      },
      orderIndex: 0,
      shootSoundName: 'shootShotgun',
      positionalAudio: false,
    });
  }
}
