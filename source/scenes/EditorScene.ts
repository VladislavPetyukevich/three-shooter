import { BasicSceneProps } from '@/core/Scene';
import { Entity } from '@/core/Entities/Entity';
import { ENTITY_TYPE } from '@/constants';
import { TestScene } from './testScene';

interface CellColors {
  border: string;
  empty: string;
  enemy: string;
}

export class EditorScene extends TestScene {
  enableKey: string;
  isEditorMode: boolean;
  currentEditorEntities: Entity[][];
  cellColors: CellColors;

  constructor(props: BasicSceneProps) {
    super(props);
    this.enableKey = '`';
    this.isEditorMode = false;
    this.currentEditorEntities = [];
    this.cellColors = {
      border: 'white',
      empty: 'black',
      enemy: 'red',
    };
    this.removeBackgroundColorFromBlocker();
    this.createMapElements();
    document.addEventListener('keypress', (event) => {
      const isEnableKey = event.key === this.enableKey;
      if (!isEnableKey) {
        return;
      }
      if (this.isEditorMode) {
        this.disableEditorMode();
      } else {
        this.enableEditorMode();
      }
    });
  }

  enableEditorMode() {
    this.clearMapElements();
    this.deleteTriggersFromScene();
    this.deleteEnemiesFromScene();
    this.isEditorMode = true;
    console.log('++++EDITOR MODE ENABLED++++');
    document.exitPointerLock();
    setTimeout(() => {
      this.disableBlockerInstructions();
      this.changeGameStatus(true);
    }, 100);
  }

  createMapElements() {
    const blockerEl = this.getBlockerElement();
    const mapContainer = document.createElement('div');
    mapContainer.style.position = 'absolute';
    mapContainer.style.zIndex = '5';
    mapContainer.style.lineHeight = '0';
    for (let cellX = 2; cellX < this.dungeonRoomSize.width - 2; cellX++) {
      for (let cellY = 2; cellY < this.dungeonRoomSize.height - 2; cellY++) {
        const mapCellEl = document.createElement('div');
        mapCellEl.style.display = 'inline-block';
        mapCellEl.style.width = '12px';
        mapCellEl.style.height = '12px';
        mapCellEl.style.background = this.cellColors.empty;
        mapCellEl.style.border = `1px solid ${this.cellColors.border}`;
        mapCellEl.onclick = (event) => {
          const cellEntity = this.getEditorCellEntity(cellX, cellY);
          if (!cellEntity) {
            (<HTMLDivElement>event.target).style.background = this.cellColors.enemy;
            const entity = this.spawnEnemyInRoom(cellX, cellY);
            this.addEditorCellEntity(cellX, cellY, entity);
          } else {
            (<HTMLDivElement>event.target).style.background = this.cellColors.empty;
            this.removeEditorCellEntity(cellX, cellY);
          }
        }
        mapContainer.appendChild(mapCellEl);
      }
      mapContainer.appendChild(
        document.createElement('br')
      );
    }
    blockerEl.appendChild(mapContainer);
  }

  clearMapElements() {
    const blockerEl = this.getBlockerElement();
    const buttons = blockerEl.children[1].children;
    for (let i = buttons.length; i--;) {
      const button = buttons[i] as HTMLButtonElement;
      button.style.background = this.cellColors.empty;
    }
  }

  deleteTriggersFromScene() {
    this.deleteEntitiesFromScene(ENTITY_TYPE.TRIGGER);
  }

  deleteEnemiesFromScene() {
    this.deleteEntitiesFromScene(ENTITY_TYPE.ENEMY);
  }

  deleteEntitiesFromScene(entityType: ENTITY_TYPE) {
    const entities = this.entitiesContainer.entities.filter(
      entity => entity.type === entityType
    );
    entities.forEach(
      entity => this.entitiesContainer.remove(entity.actor.mesh)
    );
  }

  addEditorCellEntity(cellX: number, cellY: number, entity: Entity) {
    if (!this.currentEditorEntities[cellX]) {
      this.currentEditorEntities[cellX] = [];
    }
    this.currentEditorEntities[cellX][cellY] = entity;
  }

  removeEditorCellEntity(cellX: number, cellY: number) {
    if (!this.currentEditorEntities[cellX]) {
      return;
    }
    const entity = this.currentEditorEntities[cellX][cellY];
    this.entitiesContainer.remove(entity.actor.mesh);
    delete this.currentEditorEntities[cellX][cellY];
  }

  getEditorCellEntity(cellX: number, cellY: number) {
    if (!this.currentEditorEntities[cellX]) {
      return;
    }
    return this.currentEditorEntities[cellX][cellY];
  }

  removeBackgroundColorFromBlocker() {
    const blockerEl = this.getBlockerElement();
    blockerEl.style.backgroundColor = 'initial';
  }

  disableEditorMode() {
    this.isEditorMode = false;
    console.log('----EDITOR MODE DISABLED----');
    this.enableBlockerInstructions();
    this.changeGameStatus(false);
  }

  disableBlockerInstructions() {
    const domEl = this.getInstructionsElement();
    domEl.style.display = 'none';
  }

  enableBlockerInstructions() {
    const domEl = this.getInstructionsElement();
    domEl.style.display = 'block';
  }

  spawnEnemyInRoom(cellX: number, cellY: number) {
    const playerCell = this.getPlayerCell();
    if (!playerCell) {
      throw new Error('Can not get player cell');
    }
    return this.spawnEnemy({
      x: playerCell.value[0] * this.mapCellSize + cellX * this.mapCellSize,
      y: playerCell.value[1] * this.mapCellSize + cellY * this.mapCellSize,
    });
  }

  getBlockerElement() {
    const domEl = document.getElementById('blocker');
    if (!domEl) {
      throw new Error('Failed to find blocker element');
    }
    return domEl;
  }

  getInstructionsElement() {
    const domEl = document.getElementById('instructions');
    if (!domEl) {
      throw new Error('Failed to find instructions element');
    }
    return domEl;
  }

  changeGameStatus(isEnabled: boolean) {
    (<any>window).threeShooter.enabled = isEnabled;
  }

  moveCameraToSky() {
    this.camera.position.y = 10;
  }

  update(delta: number) {
    if (this.isEditorMode) {
      this.entitiesContainer.update(0.0000001);
      this.moveCameraToSky();
    } else {
      super.update(delta);
    }
  }
}

