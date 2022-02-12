import { Enemy, EnemyProps } from '../Enemy';

export interface EnemyWithModifiersProps extends EnemyProps {
  walkSpeedFactors: {
    parasite: number;
    kamikaze: number;
  };
}

export class EnemyWithModifiers extends Enemy {
  constructor(props: EnemyWithModifiersProps) {
    const walkSpeedFactor =
      props.isKamikaze ?
      props.walkSpeedFactors.kamikaze:
      props.isParasite ?
      props.walkSpeedFactors.parasite:
      1;
    super({
      ...props,
      walkSpeed: props.walkSpeed * walkSpeedFactor,
    });
  }
}
