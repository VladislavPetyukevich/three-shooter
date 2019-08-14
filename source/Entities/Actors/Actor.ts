import SolidBody from '../../SolidBody/SolidBody';

export interface ActorProps {
  solidBody: SolidBody;
}

export default class Actor {
  solidBody: SolidBody;

  constructor(props: ActorProps) {
    this.solidBody = props.solidBody;
  }

  update() {
    this.solidBody.update();
  }
}
