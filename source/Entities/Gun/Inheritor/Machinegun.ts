import { GunFireType } from '../Gun';
import { InheritorGunProps } from './InheritorTypes';
import { texturesStore } from '@/core/loaders/TextureLoader';
import { GAME_TEXTURE_NAME } from '@/constants';
import { GunRaycast } from '../GunRaycast';

export class Machinegun extends GunRaycast {
  constructor(props: InheritorGunProps) {
    super({
      ...props,
      damage: 1,
      maxEffectiveDistance: 0,
      shootOffsetAngle: 2.5,
      shootOffsetInMoveAngle: 4.5,
      bulletsPerShoot: 1,
      recoilTime: 0.15,
      fireType: GunFireType.automatic,
      hudTextures: {
        idle: texturesStore.getTexture(GAME_TEXTURE_NAME.machinegunTextureFile),
        fire: texturesStore.getTexture(GAME_TEXTURE_NAME.machinegunFireFile),
      },
    });
  }
}
