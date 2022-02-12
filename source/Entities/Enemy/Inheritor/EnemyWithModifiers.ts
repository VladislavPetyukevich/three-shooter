import { Enemy, EnemyProps, EnemyBehaviorModifier } from '../Enemy';

export interface EnemyWithModifiersProps extends EnemyProps {
  walkSpeedFactors: {
    parasite: number;
    kamikaze: number;
  };
}

export class EnemyWithModifiers extends Enemy {
  constructor(props: EnemyWithModifiersProps) {
    const walkSpeedFactor =
      props.behaviorModifier === EnemyBehaviorModifier.kamikaze ?
      props.walkSpeedFactors.kamikaze:
      props.behaviorModifier === EnemyBehaviorModifier.parasite ?
      props.walkSpeedFactors.parasite:
      1;
    super({
      ...props,
      walkSpeed: props.walkSpeed * walkSpeedFactor,
    });
  }
}
