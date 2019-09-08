import Entity from '@/core/Entities/Entity';
import EntitiesContainer from '@/core/Entities/EntitiesContainer';
import BulletActor from './Actors/BulletActor';
import BulletBehavior from './Behaviors/BulletBehavior';
import { ENTITY_TYPE } from '@/constants';

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
