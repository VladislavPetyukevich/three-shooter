import { GunFireType } from '../Gun';
import { InheritorGunProps } from './InheritorTypes';
import { GunBullet } from '../GunBullet';
import { Boomerang } from '@/Entities/Boomerang/Boomerang';
import { Player } from '@/Entities/Player/Player';
import { texturesStore } from '@/core/loaders';

interface BoomerangGunProps extends InheritorGunProps {
  player: Player;
}

export class BoomerangGun extends GunBullet {
  canShoot: boolean;

  constructor(props: BoomerangGunProps) {
    super({
      ...props,
      BulletClass: Boomerang,
      shootOffsetAngle: 2.5,
      shootOffsetInMoveAngle: 4.5,
      bulletsPerShoot: 1,
      recoilTime: 0.15,
      fireType: GunFireType.single,
      hudTextures: {
        idle: texturesStore.getTexture('boomerangTextureFile'),
        fire: texturesStore.getTexture('boomerangFireTextureFile'),
      },
    });
    this.canShoot = true;
    this.setBulletAuthor(props.player);
  }

  shoot() {
    if (!this.canShoot) {
      return;
    }
    super.shoot();
    this.canShoot = false;
  }
}
