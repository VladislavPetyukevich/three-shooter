import { ENEMY } from '@/constants';
import { randomNumbers } from '@/RandomNumbers';
import { EnemyBehavior } from '@/Entities/Enemy/EnemyBehavior';
import { BehaviorTreeNode } from '../BehaviorTree';
import { Vector3 } from 'three';
import { Enemy } from '../Enemy';

const busyNode = (behavior: EnemyBehavior) => !behavior.isBusy;

const followPlayerNode = (behavior: EnemyBehavior, delta: number) => {
  const directionToPlayer = new Vector3();
  behavior.actor.meshInner.getWorldDirection(directionToPlayer);
  behavior.raycaster.set(
    behavior.actor.mesh.position,
    directionToPlayer
  );
  const intersectObjects = behavior.raycaster.intersectObjects(behavior.container.entitiesMeshes);
  const playerIntersectIndex = intersectObjects.findIndex(intersect =>
    intersect.object.uuid === behavior.player.mesh.uuid
  );
  if (playerIntersectIndex === 0) {
    behavior.velocityToPlayer();
  } else {
    behavior.timeoutsManager.updateTimeOut('findPathToPlayer', delta);
    if (!behavior.timeoutsManager.checkIsTimeOutExpired('findPathToPlayer')) {
      return true;
    }
    behavior.timeoutsManager.updateExpiredTimeOut('findPathToPlayer');
    behavior.findPathToPlayer();
  }
  return true;
};

const randomStrafeNode = (behavior: EnemyBehavior, delta: number) => {
  behavior.timeoutsManager.updateTimeOut('strafe', delta);
  if (!behavior.timeoutsManager.checkIsTimeOutExpired('strafe')) {
    return true;
  }
  behavior.timeoutsManager.updateExpiredTimeOut('strafe');
  const angleDegrees = 45;
  const angle = randomNumbers.getRandom() > 0.5 ? angleDegrees : -angleDegrees;
  behavior.velocity.set(
    behavior.velocity.x * Math.cos(angle) - behavior.velocity.z * Math.sin(angle),
    0,
    behavior.velocity.x * Math.sin(angle) + behavior.velocity.z * Math.cos(angle),
  );
  return true;
};

const attackNode: BehaviorTreeNode = (behavior: EnemyBehavior, delta: number) => {
  behavior.timeoutsManager.updateTimeOut('shoot', delta);
  if (behavior.timeoutsManager.checkIsTimeOutExpired('shoot')) {
    behavior.gun.behavior.setRemainingBullets(behavior.bulletsPerShoot);
    behavior.timeoutsManager.updateExpiredTimeOut('shoot');
  }
  if (behavior.gun.behavior.remainingBullets === -1) {
    return true;
  }
  behavior.updateGun();
  if (!behavior.gun.checkIsRecoil()) {
    behavior.shoot();
    return false;
  }
  return true;
};

const apathyAttackSequence: BehaviorTreeNode = {
  sequence: [attackNode, randomStrafeNode],
};

const apathyAttackCond: BehaviorTreeNode = {
  condition: (behavior: EnemyBehavior) =>
    behavior.getDistanceToPlayer() < ENEMY.ATTACK_DISTANCE,
  nodeTrue: apathyAttackSequence,
  nodeFalse: followPlayerNode,
};

const collidedPlayerNode: BehaviorTreeNode = (behavior: EnemyBehavior, _, enemy: Enemy) => {
  if (behavior.collidedPlayer) {
    behavior.player.onHit(1);
    enemy.handleDeath();
    return false;
  }
  return true;
};

const thinkPauseNode: BehaviorTreeNode = (behavior: EnemyBehavior, delta: number) => {
  behavior.timeoutsManager.updateTimeOut('thinkPause', delta);
  if (!behavior.timeoutsManager.checkIsTimeOutExpired('thinkPause')) {
    return false;
  }
  behavior.timeoutsManager.updateExpiredTimeOut('thinkPause');
  return true;
};

const followPlayerAndStrafeCond: BehaviorTreeNode = {
  condition: (behavior: EnemyBehavior) => behavior.inPlayerGunpoint,
  nodeTrue: randomStrafeNode,
  nodeFalse: followPlayerNode,
};

export const apathyEnemyTree: BehaviorTreeNode = {
  sequence: [busyNode, apathyAttackCond],
};

export const sexualPerversionsEnemyTree: BehaviorTreeNode = {
  sequence: [busyNode, collidedPlayerNode, thinkPauseNode, followPlayerAndStrafeCond],
};
