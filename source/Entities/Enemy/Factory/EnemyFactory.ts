import { AudioListener } from 'three';
import { Player } from '@/Entities/Player/Player';
import { EntitiesContainer } from '@/core/Entities/EntitiesContainer';
import { Enemy, EnemyBehaviorModifier } from '@/Entities/Enemy/Enemy';
import {
  basicEnemySeq,
  kamikazeEnemySeq,
  parasiteEnemySeq,
} from '@/Entities/Enemy/Factory/behaviorTrees';
import { BulletSlowMeidum } from '@/Entities/Bullet/Inheritor/BulletSlowMedium';
import { BulletFastEasy } from '@/Entities/Bullet/Inheritor/BulletFastEasy';
import { GunFireType } from '@/Entities/Gun/Gun';
import { ENEMY, ENEMY_COLORS, ENEMY_TEXTURES } from '@/constants';

export const enum RoomType {
  Neutral,
  Apathy,
  Cowardice,
  SexualPerversions,
}

export interface CreateEnemyProps {
  position: { x: number; y: number; z: number };
  player: Player;
  container: EntitiesContainer;
  audioListener: AudioListener;
  behaviorModifier?: EnemyBehaviorModifier;
  roomType: RoomType;
}

export class EnemyFactory {
  createEnemy(props: CreateEnemyProps) {
    return new Enemy({
      ...props,
      textures: this.getEnemyTexture(props),
      color: this.getEnemyColor(props),
      hp: this.getEnemyHp(props),
      BulletClass: this.getEnemyBulletClass(props),
      gunProps: this.getEnemyGunProps(props),
      walkSpeed:
        this.getEnemyWalkSpeed(props) *
        this.getEnemyWalkSpeedFactor(props),
      bulletsPerShoot: this.getEnemyBulletsPerShoot(props),
      delays: this.getEnemyDelays(props),
      behaviorTreeRoot: this.getEnemyBehaviorTree(props),
      onHitDamage: this.getEnemyOnHitDamage(props),
      hurtChance: this.getEnemyHurtChance(props),
    });
  }

  getEnemyTexture(props: CreateEnemyProps) {
    const roomType = props.roomType;
    switch (roomType) {
      case RoomType.Apathy: return ENEMY_TEXTURES.Apathy;
      case RoomType.Cowardice: return ENEMY_TEXTURES.Cowardice;
      case RoomType.SexualPerversions: return ENEMY_TEXTURES.SP;
      default:
        throw new Error(`Unknown roomType: ${roomType}`);
    }
  }

  getEnemyColor(props: CreateEnemyProps) {
    const roomType = props.roomType;
    switch (roomType) {
      case RoomType.Apathy: return ENEMY_COLORS.Apathy;
      case RoomType.Cowardice: return ENEMY_COLORS.Cowardice;
      case RoomType.SexualPerversions: return ENEMY_COLORS.SP;
      default:
        throw new Error(`Unknown roomType: ${roomType}`);
    }
  }

  getEnemyHp(props: CreateEnemyProps) {
    const roomType = props.roomType;
    const behaviorModifier = props.behaviorModifier;
    if (behaviorModifier === EnemyBehaviorModifier.withSpawner) {
      return 1;
    }
    switch (roomType) {
      case RoomType.Apathy: return 1;
      case RoomType.Cowardice: return 1;
      case RoomType.SexualPerversions: return 1;
      default:
        throw new Error(`Unknown roomType: ${roomType}`);
    }
  }

  getEnemyBulletClass(props: CreateEnemyProps) {
    const roomType = props.roomType;
    const behaviorModifier = props.behaviorModifier;
    if (behaviorModifier === EnemyBehaviorModifier.withSpawner) {
      return BulletSlowMeidum;
    }
    switch (roomType) {
      case RoomType.Apathy: return BulletSlowMeidum;
      case RoomType.Cowardice: return BulletSlowMeidum;
      case RoomType.SexualPerversions: return BulletFastEasy;
      default:
        throw new Error(`Unknown roomType: ${roomType}`);
    }
  }

  getEnemyGunProps(props: CreateEnemyProps) {
    const roomType = props.roomType;
    return roomType === RoomType.SexualPerversions ?
      {
        fireType: GunFireType.automatic,
        recoilTime: 0.3,
      } : {
        fireType: GunFireType.single,
        recoilTime: 0,
      };
  }

  getEnemyWalkSpeed(props: CreateEnemyProps) {
    const roomType = props.roomType;
    switch (roomType) {
      case RoomType.Apathy: return ENEMY.WALK_SPEED;
      case RoomType.Cowardice: return ENEMY.WALK_SPEED;
      case RoomType.SexualPerversions: return ENEMY.WALK_SPEED;
      default:
        throw new Error(`Unknown roomType: ${roomType}`);
    }
  }

  getEnemyWalkSpeedFactor(props: CreateEnemyProps) {
    const behaviorModifier = props.behaviorModifier;
    switch (behaviorModifier) {
      case EnemyBehaviorModifier.parasite:
        return ENEMY.WALK_SPEED_FACTOR_PARASITE;
      case EnemyBehaviorModifier.kamikaze:
        return ENEMY.WALK_SPEED_FACTOR_KAMIKAZE;
      default:
        return 1;
    }
  }

  getEnemyBulletsPerShoot(props: CreateEnemyProps) {
    const roomType = props.roomType;
    const behaviorModifier = props.behaviorModifier;
    if (behaviorModifier === EnemyBehaviorModifier.withSpawner) {
      return { min: 0, max: 1 };
    }
    switch (roomType) {
      case RoomType.Apathy: return { min: 1, max: 1 };
      case RoomType.Cowardice: return { min: 1, max: 1 };
      case RoomType.SexualPerversions: return { min: 1, max: 3 };
      default:
        throw new Error(`Unknown roomType: ${roomType}`);
    }
  }

  getEnemyDelays(props: CreateEnemyProps) {
    const roomType = props.roomType;
    const behaviorModifier = props.behaviorModifier;
    if (behaviorModifier === EnemyBehaviorModifier.withSpawner) {
      return {
        ...ENEMY.DELAYS,
        shoot: ENEMY.DELAYS.shoot * 1.7
      };
    }
    switch (roomType) {
      case RoomType.Apathy:
        return {
          ...ENEMY.DELAYS,
          shoot: ENEMY.DELAYS.shoot * 0.7
        };
      case RoomType.Cowardice:
        return {
          ...ENEMY.DELAYS,
          gunpointStrafe: ENEMY.DELAYS.gunpointStrafe * 0.4,
        };
      case RoomType.SexualPerversions:
        return {
          ...ENEMY.DELAYS,
          strafe: ENEMY.DELAYS.strafe * 0.7,
        };
      default:
        throw new Error(`Unknown roomType: ${roomType}`);
    }
  }

  getEnemyBehaviorTree(props: CreateEnemyProps) {
    const behaviorModifier = props.behaviorModifier;
    switch (behaviorModifier) {
      case EnemyBehaviorModifier.kamikaze:
        return kamikazeEnemySeq;
      case EnemyBehaviorModifier.parasite:
        return parasiteEnemySeq;
      default:
        return basicEnemySeq;
    }
  }

  getEnemyOnHitDamage(props: CreateEnemyProps) {
    const behaviorModifier = props.behaviorModifier;
    switch (behaviorModifier) {
      case EnemyBehaviorModifier.kamikaze: return 1;
      default: return 0;
    }
  }

  getEnemyHurtChance(props: CreateEnemyProps) {
    switch (props.roomType) {
      case RoomType.SexualPerversions: return 0.4;
      default: return 0.7;
    }
  }
}
