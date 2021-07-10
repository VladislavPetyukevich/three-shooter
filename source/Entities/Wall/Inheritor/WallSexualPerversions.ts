import { Wall, WallProps } from '../Wall';
import { WALL_COLORS } from '@/constants';

export class WallSexualPerversions extends Wall {
  constructor(props: WallProps) {
    super({
      ...props,
      color: WALL_COLORS.SexualPerversions,
    });
  }
}

