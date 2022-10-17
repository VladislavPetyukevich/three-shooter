import { GunProps } from '../Gun';

export type InheritorGunProps =
  Pick<
    GunProps,
    'playerCamera' |
    'container' |
    'audioListener' |
    'holderMesh'
  >;
