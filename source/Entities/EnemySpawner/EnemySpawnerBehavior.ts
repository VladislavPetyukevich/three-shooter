import { Vector3 } from 'three';
import { Behavior } from '@/core/Entities/Behavior';
import { randomNumbers } from '@/RandomNumbers';
import { TimeoutsManager } from '@/TimeoutsManager';
import { EntitiesContainer } from '@/core/Entities/EntitiesContainer';

interface EnemySpawnerBehaviorProps {
  position: Vector3;
  positionPadding: number;
  container: EntitiesContainer;
  spawnsCount: number;
  onTrigger: (position: Vector3) => boolean;
}

export class EnemySpawnerBehavior implements Behavior {
  position: Vector3;
  positionPadding: number;
  container: EntitiesContainer;
  spawnsCount: number;
  onTrigger: (position: Vector3) => boolean;
  spawnTiumeoutManager: TimeoutsManager<'spawnEnemy'>;
  onDestroy?: () => void;

  constructor(props: EnemySpawnerBehaviorProps) {
    this.position = props.position;
    this.positionPadding = props.positionPadding;
    this.container = props.container;
    this.spawnsCount = props.spawnsCount;
    this.onTrigger = props.onTrigger;
    this.spawnTiumeoutManager = new TimeoutsManager({
      spawnEnemy: 3,
    });
  }

  getPositionWithOffset(direction: [number, number]) {
    const padding = this.positionPadding;
    return new Vector3(
      this.position.x + direction[0] * padding,
      this.position.y,
      this.position.z + direction[1] * padding,
    );
  }

  getRandomNearPosition() {
    const randNumber = randomNumbers.getRandom();
    if (randNumber >= 0.75) {
      return this.getPositionWithOffset([-1, 0]);
    }
    if (randNumber >= 0.5) {
      return this.getPositionWithOffset([1, 0]);
    }
    if (randNumber >= 0.25) {
      return this.getPositionWithOffset([0, -1]);
    }
    return this.getPositionWithOffset([0, 1]);
  }

  onSpawnEnemy() {
    for (let i = 10; i--;) {
      const enemyPosition = this.getRandomNearPosition();
      if (this.onTrigger(enemyPosition)) {
        break;
      }
    }
    this.spawnsCount--;
    if (this.spawnsCount <= 0) {
      this.onDestroy && this.onDestroy();
    }
  }
  update(delta: number) {
    if (this.spawnTiumeoutManager.checkIsTimeOutExpired('spawnEnemy')) {
      this.spawnTiumeoutManager.updateExpiredTimeOut('spawnEnemy');
      this.onSpawnEnemy();
      return;
    }
    this.spawnTiumeoutManager.updateTimeOut('spawnEnemy', delta);
  }
}

