import { GunFireType } from '../Gun';
import { InheritorGunProps } from './InheritorTypes';
import { texturesStore } from '@/core/loaders/TextureLoader';
import { GunRaycast } from '../GunRaycast';

export class Shotgun extends GunRaycast {
  constructor(props: InheritorGunProps) {
    super({
      ...props,
      damage: 1,
      maxEffectiveDistance: 25,
      shootOffsetAngle: 2.5,
      shootOffsetInMoveAngle: 4.5,
      bulletsPerShoot: 2,
      recoilTime: 0.2,
      shootsToMaxHeat: 1000,
      fireType: GunFireType.single,
      hudTextures: {
        idle: texturesStore.getTexture('gunTextureFile'),
        fire: texturesStore.getTexture('gunFireFile'),
      },
      orderIndex: 0,
    });
  }
}
