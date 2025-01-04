import { GunFireType } from '../Gun';
import { InheritorGunProps } from './InheritorTypes';
import { texturesStore } from '@/core/loaders/TextureLoader';
import { GunRaycast } from '../GunRaycast';

export class Machinegun extends GunRaycast {
  constructor(props: InheritorGunProps) {
    super({
      ...props,
      damage: { min: 5, max: 15 },
      maxEffectiveDistance: 0,
      shootOffsetAngle: 2.5,
      shootOffsetInMoveAngle: 4.5,
      bulletsPerShoot: 1,
      recoilTime: 0.10,
      fireType: GunFireType.automatic,
      shootsToMaxHeat: 23,
      hudTextures: {
        idle: texturesStore.getTexture('machinegunTextureFile'),
        fire: texturesStore.getTexture('machinegunFireFile'),
      },
      orderIndex: 1,
      shootSoundName: 'shootMachinegun',
      positionalAudio: false,
    });
  }
}
