import { Gun, GunPropsExternal } from './Gun';
import { Bullet } from '../Bullet/Bullet';
import { GunBehaviorBullet } from './GunBehaviorBullet';

interface GunBulletProps extends GunPropsExternal {
  BulletClass: typeof Bullet;
  shootsToMaxHeat: number;
  shootOffsetY: boolean;
}

export class GunBullet extends Gun {
  constructor(props: GunBulletProps) {
    const behavior = new GunBehaviorBullet({
      BulletClass: props.BulletClass,
      container: props.container,
      playerCamera: props.playerCamera,
      holderMesh: props.holderMesh,
      audioListener: props.audioListener,
      shootOffsetAngle: props.shootOffsetAngle,
      shootOffsetInMoveAngle: props.shootOffsetInMoveAngle,
      bulletsPerShoot: props.bulletsPerShoot,
      recoilTime: props.recoilTime,
      shootsToMaxHeat: props.shootsToMaxHeat,
      fireType: props.fireType,
      shootSoundName: 'shootShotgun',
    });
    super({
      ...props,
      behavior,
    });
  }
}
