import { Gun, GunPropsExternal } from './Gun';
import { GunBehaviorRaycast } from './GunBehaviorRaycast';

interface GunRaycastProps extends GunPropsExternal {
  maxEffectiveDistance: number;
  damage: number;
  shootsToMaxHeat: number;
}

export class GunRaycast extends Gun {
  constructor(props: GunRaycastProps) {
    const behavior = new GunBehaviorRaycast({
      maxEffectiveDistance: props.maxEffectiveDistance,
      damage: props.damage,
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
    });
    super({
      ...props,
      behavior,
    });
  }
}
