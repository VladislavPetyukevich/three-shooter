import { GunProps } from '../Gun';

export type InheritorGunProps =
  Pick<
    GunProps,
    'playerCamera' |
    'container' |
    'audioListener' |
    'holderMesh' |
    'audioSlices'
  >;

export type EnemyInheritorGunProps =
  Pick<
    GunProps,
    'playerCamera' |
    'container' |
    'audioListener' |
    'holderMesh' |
    'fireType' |
    'recoilTime' |
    'audioSlices'
  >;
