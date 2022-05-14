import { AudioListener } from 'three';
import { EnemyBehaviorModifier } from '../Enemy';
import { Player } from '@/Entities/Player/Player';
import { EntitiesContainer } from '@/core/Entities/EntitiesContainer';
import { BehaviorTreeNode } from '@/Entities/Enemy/BehaviorTree';

export interface EnemyInheritorProps {
  position: { x: number; y: number; z: number };
  player: Player;
  container: EntitiesContainer;
  audioListener: AudioListener;
  behaviorTreeRoot: BehaviorTreeNode;
  onHitDamage: number;
  behaviorModifier?: EnemyBehaviorModifier;
}
