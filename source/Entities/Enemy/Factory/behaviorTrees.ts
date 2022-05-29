import { ENTITY_MESSAGES, ENTITY_TYPE } from '@/constants';
import { randomNumbers } from '@/RandomNumbers';
import { EnemyBehavior } from '@/Entities/Enemy/EnemyBehavior';

const hurtNode = (behavior: EnemyBehavior) => behavior.updateHurt();

const followPlayerNode = (behavior: EnemyBehavior, delta: number) =>
  behavior.followPlayer(delta);

const attackCond = {
  condition: (behavior: EnemyBehavior) =>
    behavior.checkIsPlayerInAttackDistance(),
  nodeTrue: (behavior: EnemyBehavior, delta: number) =>
    behavior.attackPlayer(delta),
  nodeFalse: followPlayerNode,
};

const updateCollisions = (behavior: EnemyBehavior) => {
  const collidedEntity = behavior.collidedEntity;
  if (!collidedEntity) {
    return true;
  }
  collidedEntity.onHit(behavior.onHitDamage);
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
  behavior.death();
  if (collidedEntity.type === ENTITY_TYPE.PLAYER) {
    collidedEntity.onHit(1);
  } else {
    collidedEntity.onMessage(ENTITY_MESSAGES.infestedByParasite);
  }
  return false;
};

const findParasiteTarget = (behavior: EnemyBehavior) => {
  const entitiesInCantainer = behavior.container.entities;
  const enemies = entitiesInCantainer.filter(entity =>
    (entity.type === ENTITY_TYPE.ENEMY) &&
    (!(<EnemyBehavior>entity.behavior).isParasite)
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
  behavior.moveToEntity(followingEnemy);
  return true;
};

const strafe = (behavior: EnemyBehavior, delta: number) =>
  behavior.strafe(delta);

const gunpointStrafe = (behavior: EnemyBehavior, delta: number) =>
  behavior.updateGunpointReaction(delta);

export const basicEnemySeq = {
  sequence: [hurtNode, updateCollisions, attackCond, strafe, gunpointStrafe]
};

export const kamikazeEnemySeq = {
  sequence: [hurtNode, updateCollisions, followPlayerNode, strafe, gunpointStrafe]
};

export const parasiteEnemySeq = {
  sequence: [hurtNode, infectCollisions, findParasiteTarget, followTarget],
};
