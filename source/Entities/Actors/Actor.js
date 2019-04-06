export default class Actor {
  constructor(props) {
    this.hp = props.hp;
    this.solidBody = props.solidBody;
    this.walkSpeed = props.walkSpeed;
    this.gun = props.gun;

    this.solidBody.body._hp = 1;
  }

  update(delta) {
    this.solidBody.update(delta);
  }
}
