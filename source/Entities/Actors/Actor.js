export default class Actor {
  constructor(props) {
    this.solidBody = props.solidBody;
    this.solidBody.body._hp = props.hp;
  }

  update(delta) {
    this.solidBody.update(delta);
  }
}
