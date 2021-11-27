import { Gun } from '../Gun';
import { InheritorGunProps } from './InheritorTypes';
import { texturesStore } from '@/core/loaders/TextureLoader';
import { GAME_TEXTURE_NAME } from '@/constants';

export class Machinegun extends Gun {
  constructor(props: InheritorGunProps) {
    super({
      ...props,
      shootOffsetAngle: 2.5,
      shootOffsetInMoveAngle: 4.5,
      bulletsPerShoot: 2,
      recoilTime: 0.2,
      fireType: 'automatic',
      hudTextures: {
        idle: texturesStore.getTexture(GAME_TEXTURE_NAME.machinegunTextureFile),
        fire: texturesStore.getTexture(GAME_TEXTURE_NAME.machinegunFireFile),
      },
    });
  }
}