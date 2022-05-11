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

const strafe = (behavior: EnemyBehavior, delta: number) =>
  behavior.strafe(delta);

const gunpointStrafe = (behavior: EnemyBehavior, delta: number) =>
  behavior.updateGunpointReaction(delta);

export const basicEnemySeq = {
  sequence: [hurtNode, attackCond, strafe, gunpointStrafe]
};

export const kamikazeEnemySeq = {
  sequence: [hurtNode, followPlayerNode, strafe, gunpointStrafe]
};

