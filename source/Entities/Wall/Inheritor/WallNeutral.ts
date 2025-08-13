import { Wall, WallProps } from '../Wall';

export class WallNeutral extends Wall {
  constructor(props: WallProps) {
    super({
      ...props,
    });
  }
}

