export type PlayerActionName =
  'walkForward' |
  'walkBackward' |
  'walkLeft' |
  'walkRight' |
  'firePrimary' |
  'fireSecondary' |
  'prevWeapon' |
  'nextWeapon' |
  'weapon1' |
  'weapon2';

export interface PlayerAction {
  name: PlayerActionName;
  isEnded: boolean;
}

export interface PlayerActionListener {
  name: PlayerActionName;
  listener: (action: PlayerAction) => void;
}

class PlayerActions {
  listeners: PlayerActionListener[];
  cameraMovementX: number;

  constructor() {
    this.listeners = [];
    this.cameraMovementX = 0;
  }

  addActionListener(
    actionName: PlayerActionName,
    listener: PlayerActionListener['listener']
  ) {
    this.listeners.push({
      name: actionName,
      listener: listener,
    });
  }

  removeActionListener(
    actionName: PlayerActionName,
    listener: PlayerActionListener['listener']
  ) {
    const listenerIndex = this.listeners.findIndex(
      listenerItem =>
        (listenerItem.name === actionName) &&
        (listenerItem.listener === listener)
    );
    if (listenerIndex === -1) {
      return;
    }
    this.listeners.splice(listenerIndex, 1);
  }

  startAction(actionName: PlayerActionName) {
    this.handleAction(actionName, false);
  }

  endAction(actionName: PlayerActionName) {
    this.handleAction(actionName, true);
  }

  addCameraMovement(movementX: number) {
    this.cameraMovementX += movementX;
  }

  getCameraMovement() {
    return Number(this.cameraMovementX);
  }

  resetCameraMovement() {
    this.cameraMovementX = 0;
  }

  handleAction(actionName: PlayerActionName, isEnded: boolean) {
    this.listeners.forEach(listener => {
      if (listener.name === actionName) {
        listener.listener({ name: actionName, isEnded: isEnded });
      }
    });
  }
}

const playerActions = new PlayerActions();

export { playerActions };

