import { SphereGeometry, MeshBasicMaterial } from 'three';
import { Body } from 'cannon';
import PhysicsBall from './PhysicsBall';
import { BULLET } from '@/constants';

export interface BulletBody extends Body {
  isBullet?: true;
}

export default class PhysicsBullet extends PhysicsBall {
  constructor(position = { x: 0, y: 0, z: 0 }) {
    super(
      new SphereGeometry(BULLET.SHAPE_RADIUS, 8, 8),
      new MeshBasicMaterial({ color: BULLET.COLOR }),
      position,
      BULLET.MASS
    );
    (<BulletBody>this.body!).isBullet = true;
  }
}
