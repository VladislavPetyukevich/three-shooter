import { GunFireType } from '../Gun';
import { InheritorGunProps } from './InheritorTypes';
import { GunBullet } from '../GunBullet';
import { Boomerang } from '@/Entities/Boomerang/Boomerang';
import { texturesStore } from '@/core/loaders';

export class BoomerangGun extends GunBullet {
  canShoot: boolean;

  constructor(props: InheritorGunProps) {
    super({
      ...props,
      BulletClass: Boomerang,
      shootOffsetAngle: 2.5,
      shootOffsetInMoveAngle: 4.5,
      shootOffsetY: true,
      bulletsPerShoot: 1,
      recoilTime: 0.15,
      fireType: GunFireType.single,
      shootsToMaxHeat: 1000,
      hudTextures: {
        idle: texturesStore.getTexture('boomerangTextureFile'),
        fire: texturesStore.getTexture('boomerangFireTextureFile'),
      },
      orderIndex: 2,
      shootSoundName: 'shootShotgun',
    });
    this.canShoot = true;
  }

  shoot() {
    if (!this.canShoot) {
      return;
    }
    super.shoot();
    this.canShoot = false;
  }
}
