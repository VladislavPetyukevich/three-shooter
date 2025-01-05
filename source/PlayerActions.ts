import { globalSettings } from './GlobalSettings';

export type PlayerActionName =
  'walkForward' |
  'walkBackward' |
  'walkLeft' |
  'walkRight' |
  'firePrimary' |
  'prevUsedWeapon' |
  'prevWeapon' |
  'nextWeapon' |
  'weapon1' |
  'weapon2' |
  'weapon3' |
  'lookLeft' |
  'lookRight';

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
  mouseSensitivity: number;

  constructor() {
    this.listeners = [];
    this.cameraMovementX = 0;
    this.mouseSensitivity = globalSettings.getSetting('mouseSensitivity');
    globalSettings.addUpdateListener(this.onUpdateGlobalSettings);
  }

  onUpdateGlobalSettings = () => {
    this.mouseSensitivity = globalSettings.getSetting('mouseSensitivity');
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
    this.cameraMovementX += movementX * this.mouseSensitivity;
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

