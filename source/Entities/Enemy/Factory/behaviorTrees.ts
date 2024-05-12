import { ENTITY_MESSAGES, ENTITY_TYPE, ENEMY } from '@/constants';
import { randomNumbers } from '@/RandomNumbers';
import { EnemyBehavior } from '@/Entities/Enemy/EnemyBehavior';
import { Enemy } from '../Enemy';
import { EnemyKind } from '@/dungeon/DungeonRoom';
import { BehaviorTreeNode } from '../BehaviorTree';

const noop = () => true;

const hurtNode = (behavior: EnemyBehavior) => !behavior.isHurt;

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

const infectCollisions = (behavior: EnemyBehavior) => {
  const collidedEntity = behavior.collidedEntity;
  if (!collidedEntity) {
    return true;
  }
  if (collidedEntity.type === ENTITY_TYPE.PLAYER) {
    collidedEntity.onHit(1);
    behavior.death();
  } else if (collidedEntity.type === ENTITY_TYPE.ENEMY) {
    collidedEntity.onMessage(ENTITY_MESSAGES.infestedByParasite);
    behavior.death();
  }
  return false;
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

const findParasiteTarget = (behavior: EnemyBehavior) => {
  if (
    behavior.followingEnemy &&
    (typeof behavior.followingEnemy.hp === 'number') &&
    (behavior.followingEnemy.hp > 0)
  ) {
    return true;
  }
  const entitiesInCantainer = behavior.container.entities;
  const enemies = entitiesInCantainer.filter(entity =>
    (entity.type === ENTITY_TYPE.ENEMY) &&
    ((<Enemy>entity).kind !== EnemyKind.Parasite)
  );
  if (enemies.length === 0) {
    behavior.followingEnemy = behavior.player;
    return true;
  }
  const enemyIndex = randomNumbers.getRandomInRange(0, enemies.length - 1);
  const enemyTarget = enemies[enemyIndex];
  if (!enemyTarget) {
    return false;
  }
  behavior.followingEnemy = enemyTarget;
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

const strafe = (behavior: EnemyBehavior, delta: number) =>
  behavior.strafe(delta);

const gunpointStrafe = (behavior: EnemyBehavior, delta: number) =>
  behavior.updateGunpointReaction(delta);

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

const bleed = (behavior: EnemyBehavior, delta: number) => {
  behavior.timeoutsManager.updateTimeOut('bleed', delta);
  if (behavior.timeoutsManager.checkIsTimeOutExpired('bleed')) {
    behavior.onBleedCallback && behavior.onBleedCallback();
    behavior.timeoutsManager.updateExpiredTimeOut('bleed');
  }
  return true;
};

export const basicEnemySeq: BehaviorTreeNode = {
  sequence: [hurtNode, updateCollisions, updateFollowingEnemy, attackCond, strafe, gunpointStrafe]
};

export const longRangeEnemySeq: BehaviorTreeNode = {
  sequence: [hurtNode, updateCollisions, updateFollowingEnemy, attackCondLongRange, moveToLongRange, strafe, gunpointStrafe]
};

export const bleedEnemySeq: BehaviorTreeNode = {
  sequence: [bleed, hurtNode, updateCollisions, updateFollowingEnemy, attackCond, strafe, gunpointStrafe]
};

export const kamikazeEnemySeq: BehaviorTreeNode = {
  sequence: [hurtNode, updateCollisions, updateFollowingEnemy, strafe, gunpointStrafe]
};

export const parasiteEnemySeq: BehaviorTreeNode = {
  sequence: [hurtNode, infectCollisions, findParasiteTarget, followTarget],
};

