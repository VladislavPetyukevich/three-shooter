import Actor from './Actor';
import PhysicsBullet from '@/SolidBody/PhysicsBullet';

export default class BulletActor extends Actor {
  constructor(position = { x: 0, y: 0, z: 0 }) {
    super({ solidBody: new PhysicsBullet(position) });
  }
}
