import { Entity } from '@/core/Entities/Entity';
import { ENTITY_TYPE } from '@/constants';
import { TorchActor } from './TorchActor';
import { TorchBehavior } from './TorchBehavior';
import { Player } from '@/Entities/Player/Player';

export interface EnemyProps {
  position: { x: number; y: number; z: number };
  player: Player;
}

export class Torch extends Entity {
  constructor(props: EnemyProps) {
    const actor = new TorchActor({
      position: props.position,
      player: props.player
    });
    super(
      ENTITY_TYPE.TORCH,
      actor,
      new TorchBehavior({ actor: actor })
    );
  }
}

