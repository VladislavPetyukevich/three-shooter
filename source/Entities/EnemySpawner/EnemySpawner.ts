import { Vector3, Color } from 'three';
import { Entity } from '@/core/Entities/Entity';
import { EntitiesContainer } from '@/core/Entities/EntitiesContainer';
import { ENTITY_TYPE } from '@/constants';
import { EnemySpawnerActor } from './EnemySpawnerActor';
import { EnemySpawnerBehavior } from './EnemySpawnerBehavior';

interface EnemySpawnerProps {
  position: Vector3;
  positionPadding: number;
  container: EntitiesContainer;
  spawnsCount: number;
  onTrigger: (position: Vector3) => boolean;
  onDestroy: () => void;
}

export class EnemySpawner extends Entity {
  container: EntitiesContainer;
  onDestroyCallback: () => void;

  constructor(props: EnemySpawnerProps) {
    super(
      ENTITY_TYPE.ENEMY_SPAWNER,
      new EnemySpawnerActor({
        position: props.position,
        size: new Vector3(2, 2, 2),
        color: new Color('green'),
      }),
      new EnemySpawnerBehavior({
        container: props.container,
        position: props.position,
        positionPadding: props.positionPadding,
        onTrigger: props.onTrigger,
        spawnsCount: props.spawnsCount,
      })
    );
    this.hp = 1;
    this.container = props.container;
    this.onDestroyCallback = props.onDestroy;
    (<EnemySpawnerBehavior>this.behavior).onDestroy = this.onDestroy;
  }

  onHit(damage: number) {
    super.onHit(damage);
    this.onDestroy();
  }

  getNewSpawnPosition() {
    return (<EnemySpawnerBehavior>this.behavior).getRandomNearPosition();
  }

  onDestroy = () => {
    this.container.remove(this.actor.mesh);
    this.onDestroyCallback();
  };
}
