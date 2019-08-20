import Entity from './Entity';
import BulletActor from './Actors/BulletActor';
import BulletBehavior from './Behaviors/BulletBehavior';
import EntitiesContainer from './EntitiesContainer';
import { ENTITY_TYPE } from '../constants';

export interface BulletProps {
  container: EntitiesContainer;
  position: { x: number, y: number, z: number };
}

export default class Bullet extends Entity {
  container: EntitiesContainer;

  constructor(props: BulletProps) {
    super(
      ENTITY_TYPE.INANIMATE,
      new BulletActor(props.position),
      new BulletBehavior(props.container)
    );
    this.container = props.container;
    (<BulletBehavior>this.behavior).setLifeTimeExpiredCallback(this.handleLifeTimeExpired);
  }

  handleLifeTimeExpired = () => {
    this.container.deleteEntity(this);
  }

  update(delta: number) {
    this.actor.update();
    this.behavior.update(delta);
  }
}
