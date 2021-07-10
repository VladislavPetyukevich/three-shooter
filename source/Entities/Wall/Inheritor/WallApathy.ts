import { Wall, WallProps } from '../Wall';
import { WALL_COLORS } from '@/constants';

export class WallApathy extends Wall {
  constructor(props: WallProps) {
    super({
      ...props,
      color: WALL_COLORS.Apathy,
    });
  }
}

