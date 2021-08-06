import { AudioListener } from 'three';
import { Enemy } from '../Enemy';
import { Player } from '@/Entities/Player/Player';
import { EntitiesContainer } from '@/core/Entities/EntitiesContainer';
import { ENEMY_COLORS, ENEMY_TEXTURES } from '@/constants';

interface EnemySPProps {
  position: { x: number; y: number; z: number };
  player: Player;
  container: EntitiesContainer;
  audioListener: AudioListener;
}

export class EnemySP extends Enemy {
  constructor(props: EnemySPProps) {
    super({
      ...props,
      textures: ENEMY_TEXTURES.SP,
      color: ENEMY_COLORS.SP,
    });
  }
}

