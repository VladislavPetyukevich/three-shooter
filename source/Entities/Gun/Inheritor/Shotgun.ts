import { Gun, GunFireType } from '../Gun';
import { InheritorGunProps } from './InheritorTypes';
import { texturesStore } from '@/core/loaders/TextureLoader';
import { GAME_TEXTURE_NAME } from '@/constants';

export class Shotgun extends Gun {
  constructor(props: InheritorGunProps) {
    super({
      ...props,
      shootOffsetAngle: 2.5,
      shootOffsetInMoveAngle: 4.5,
      maxEffectiveDistance: 25,
      bulletsPerShoot: 2,
      recoilTime: 0.2,
      fireType: GunFireType.single,
      hudTextures: {
        idle: texturesStore.getTexture(GAME_TEXTURE_NAME.gunTextureFile),
        fire: texturesStore.getTexture(GAME_TEXTURE_NAME.gunFireFile),
      },
    });
  }
}
