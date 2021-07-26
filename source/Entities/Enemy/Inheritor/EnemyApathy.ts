import { AudioListener } from 'three';
import { Enemy } from '../Enemy';
import { Player } from '@/Entities/Player/Player';
import { EntitiesContainer } from '@/core/Entities/EntitiesContainer';
import { ENEMY_COLORS } from '@/constants';

interface EnemyApathyProps {
  position: { x: number; y: number; z: number };
  player: Player;
  container: EntitiesContainer;
  audioListener: AudioListener;
}

export class EnemyApathy extends Enemy {
  constructor(props: EnemyApathyProps) {
    super({
      ...props,
      color: ENEMY_COLORS.Apathy
    });
  }
}

