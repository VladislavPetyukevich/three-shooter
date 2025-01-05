import { Gun, GunPropsExternal } from './Gun';
import { GunBehaviorRaycast } from './GunBehaviorRaycast';

export interface GunRaycastProps extends GunPropsExternal {
  maxEffectiveDistance: number;
  damage: { min: number; max: number; };
  shootsToMaxHeat: number;
  positionalAudio: boolean;
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
      positionalAudio: props.positionalAudio,
      shootOffsetAngle: props.shootOffsetAngle,
      shootOffsetInMoveAngle: props.shootOffsetInMoveAngle,
      bulletsPerShoot: props.bulletsPerShoot,
      recoilTime: props.recoilTime,
      shootsToMaxHeat: props.shootsToMaxHeat,
      fireType: props.fireType,
      shootSoundName: props.shootSoundName,
      audioSlices: props.audioSlices,
    });
    super({
      ...props,
      behavior,
      shootOffsetY: false,
    });
  }
}
