import { ENEMY } from '@/constants';
import { randomNumbers } from '@/RandomNumbers';
import { EnemyBehavior } from '@/Entities/Enemy/EnemyBehavior';
import { BehaviorTreeNode } from '../BehaviorTree';

const noop = () => true;

const busyNode = (behavior: EnemyBehavior) => !behavior.isBusy;

const attackCond = {
  condition: (behavior: EnemyBehavior) =>
    behavior.checkIsFollowingEnemyInAttackDistance(0, ENEMY.ATTACK_DISTANCE),
  nodeTrue: (behavior: EnemyBehavior, delta: number) => {
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
    }
    return true;
  },
  nodeFalse: noop,
};

const attackCondLongRange = {
  condition: (behavior: EnemyBehavior) =>
    behavior.checkIsFollowingEnemyInAttackDistance(ENEMY.ATTACK_DISTANCE, ENEMY.ATTACK_DISTANCE_LONG_RANGE),
  nodeTrue: attackCond.nodeTrue,
  nodeFalse: noop,
};

const updateCollisions = (behavior: EnemyBehavior) => {
  const collidedEntity = behavior.collidedEntity;
  if (
    !collidedEntity ||
    !behavior.onHitDamage
  ) {
    return true;
  }
  collidedEntity.onHit(
    randomNumbers.getRandomInRange(
      behavior.onHitDamage.min,
      behavior.onHitDamage.max,
    )
  );
  behavior.followingPath = [];
  behavior.followingPoint = undefined;
  behavior.velocity.negate();
  return true;
};

const updateFollowingEnemy = (behavior: EnemyBehavior) => {
  if (!behavior.followingEnemy) {
    behavior.followingEnemy = behavior.player;
    return true;
  }
  if (
    (typeof behavior.followingEnemy.hp === 'number') &&
    (behavior.followingEnemy.hp <= 0)
  ) {
    behavior.followingEnemy = behavior.player;
  }
  return true;
};

export const followTarget = (behavior: EnemyBehavior) => {
  const followingEnemy = behavior.followingEnemy;
  if (!followingEnemy) {
    return true;
  }
  behavior.setFollowingEnemy(followingEnemy);
  return true;
};

const strafe = (behavior: EnemyBehavior, delta: number) => {
  behavior.timeoutsManager.updateTimeOut('strafe', delta);
  if (behavior.timeoutsManager.checkIsTimeOutExpired('strafe')) {
    behavior.randomStrafe(behavior.strafeAngleLow);
    behavior.timeoutsManager.updateExpiredTimeOut('strafe');
  }
  return true;
}

const gunpointStrafe = (behavior: EnemyBehavior, delta: number) => {
  if (!behavior.isGunpointTriggered) {
    return true;
  }
  behavior.timeoutsManager.updateTimeOut('gunpointStrafe', delta);
  if (!behavior.timeoutsManager.checkIsTimeOutExpired('gunpointStrafe')) {
    return true;
  }
  behavior.timeoutsManager.updateExpiredTimeOut('gunpointStrafe');
  behavior.isGunpointTriggered = false;
  if (!behavior.isOnGunpointCurrent) {
    return true;
  }
  behavior.isOnGunpointCurrent = false;
  behavior.randomStrafe(behavior.strafeAngleHigh);
  return true;
}

const moveToLongRange = (behavior: EnemyBehavior) => {
  if (!behavior.followingEnemy) {
    return true;
  }
  const distanceToEntity = behavior.getDistanceToEntity(behavior.followingEnemy);
  if (distanceToEntity > ENEMY.ATTACK_DISTANCE) {
    return true;
  }
  behavior.velocityToEntity(behavior.followingEnemy);
  behavior.velocity.negate();
  return false;
};

export const basicEnemySeq: BehaviorTreeNode = {
  sequence: [busyNode, updateCollisions, updateFollowingEnemy, attackCond, strafe, gunpointStrafe]
};

export const longRangeEnemySeq: BehaviorTreeNode = {
  sequence: [busyNode, updateCollisions, updateFollowingEnemy, attackCondLongRange, moveToLongRange, strafe, gunpointStrafe]
};

export const kamikazeEnemySeq: BehaviorTreeNode = {
  sequence: [busyNode, updateCollisions, updateFollowingEnemy, strafe, gunpointStrafe]
};

