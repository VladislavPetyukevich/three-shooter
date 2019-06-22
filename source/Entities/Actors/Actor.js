export default class Actor {
  constructor(props) {
    this.solidBody = props.solidBody;
  }

  update(delta) {
    this.solidBody.update(delta);
  }
}
