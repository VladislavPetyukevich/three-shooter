import { Vector2 } from 'three';
import { Entity } from '@/core/Entities/Entity';
import { ENTITY_TYPE } from '@/constants';
import { TestSceneProps, TestScene } from './testScene';

interface SavedCell {
  x: number;
  y: number;
  type: ENTITY_TYPE;
}

interface CellColors {
  border: string;
  empty: string;
  enemy: string;
  wall: string;
}

export class EditorScene extends TestScene {
  enableKey: string;
  isEditorMode: boolean;
  currentEditorEntities: Entity[][];
  currentEntityType: ENTITY_TYPE;
  cellColors: CellColors;
  padding: number;
  localStorageKey: string;

  constructor(props: TestSceneProps) {
    super(props);
    this.enableKey = '`';
    this.isEditorMode = false;
    this.currentEditorEntities = [];
    this.currentEntityType = ENTITY_TYPE.ENEMY;
    this.cellColors = {
      border: 'white',
      empty: 'black',
      enemy: 'red',
      wall: 'gray',
    };
    this.padding = 2;
    this.localStorageKey = 'editor-map';
    this.removeBackgroundColorFromBlocker();
    this.createMapElements();
    this.createEntitiesButtons();
    this.deleteTriggersFromScene();
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

  loadFromLocalStorage() {
    const data = localStorage.getItem(this.localStorageKey);
    if (!data) {
      return;
    }
    const parsed: SavedCell[] = JSON.parse(data);
    parsed.forEach(cell => {
      const entity = this.spawnEntityInRoom(cell.x, cell.y, cell.type);
      this.addEditorCellEntity(cell.x, cell.y, entity);
    });
  }

  enableEditorMode() {
    this.isEditorMode = true;
    console.log('++++EDITOR MODE ENABLED++++');
    this.loadFromLocalStorage();
    this.restoreEditorMap();
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
    for (let cellX = this.padding; cellX < this.roomSize.width - this.padding; cellX++) {
      for (let cellY = this.padding; cellY < this.roomSize.height - this.padding; cellY++) {
        const mapCellEl = document.createElement('div');
        mapCellEl.style.display = 'inline-block';
        mapCellEl.style.width = '12px';
        mapCellEl.style.height = '12px';
        mapCellEl.style.background = this.cellColors.empty;
        mapCellEl.style.border = `1px solid ${this.cellColors.border}`;
        mapCellEl.onclick = (event) => {
          const cellEntity = this.getEditorCellEntity(cellX, cellY);
          if (!cellEntity) {
            (<HTMLDivElement>event.target).style.background = this.getCurrentCellColor();
            const entity = this.spawnEntityInRoom(cellX, cellY, this.currentEntityType);
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

  getCurrentCellColor() {
    switch (this.currentEntityType) {
      case ENTITY_TYPE.ENEMY:
        return this.cellColors.enemy;
      case ENTITY_TYPE.WALL:
        return this.cellColors.wall;
      default:
        return '';
    }
  }

  createEntitiesButtons() {
    const blockerEl = this.getBlockerElement();
    const enemyButton = document.createElement('button');
    enemyButton.style.position = 'absolute';
    enemyButton.style.top = '230px';
    enemyButton.style.left = '60px';
    enemyButton.style.background = this.cellColors.enemy;
    enemyButton.innerHTML = 'Enemy';
    enemyButton.onclick = () => this.currentEntityType = ENTITY_TYPE.ENEMY;
    blockerEl.appendChild(enemyButton);
    const wallButton = document.createElement('button');
    wallButton.style.position = 'absolute';
    wallButton.style.top = '230px';
    wallButton.style.left = '120px';
    wallButton.style.background = this.cellColors.wall;
    wallButton.innerHTML = 'Wall';
    wallButton.onclick = () => this.currentEntityType = ENTITY_TYPE.WALL;
    blockerEl.appendChild(wallButton);
    const clearButton = document.createElement('button');
    clearButton.style.position = 'absolute';
    clearButton.style.top = '230px';
    clearButton.style.background = this.cellColors.empty;
    clearButton.style.color = this.cellColors.border;
    clearButton.innerHTML = 'Clear';
    clearButton.onclick = () => {
      this.clearMapElements();
      this.clearEditorEntities();
    };
    blockerEl.appendChild(clearButton);
    const exportButton = document.createElement('button');
    exportButton.style.position = 'absolute';
    exportButton.style.top = '260px';
    exportButton.innerHTML = 'Log to console';
    exportButton.onclick = () => this.logDungeonToConsole();
    blockerEl.appendChild(exportButton);
    const saveButton = document.createElement('button');
    saveButton.style.position = 'absolute';
    saveButton.style.top = '285px';
    saveButton.innerHTML = 'Save to local storage';
    saveButton.onclick = () => this.saveDungeonToLocalStorage();
    blockerEl.appendChild(saveButton);
  }

  logDungeonToConsole() {
    let resultJson = '[';
    for (let cellX = 0; cellX < this.currentEditorEntities.length; cellX++) {
      const xRow = this.currentEditorEntities[cellX];
      if (!xRow) {
        continue;
      }
      for (let cellY = 0; cellY < xRow.length; cellY++) {
        if (xRow[cellY]) {
          resultJson += '\n  {';
          resultJson += ` position: { x: ${cellX}, y: ${cellY} },`;
          resultJson += ` type: RoomCellType.${this.currentEditorEntities[cellX][cellY].type}`;
          resultJson += ' },';
        }
      }
    }
    resultJson += '\n];';
    console.log(resultJson);
  }

  saveDungeonToLocalStorage() {
    const data = [];
    for (let cellX = 0; cellX < this.currentEditorEntities.length; cellX++) {
      const xRow = this.currentEditorEntities[cellX];
      if (!xRow) {
        continue;
      }
      for (let cellY = 0; cellY < xRow.length; cellY++) {
        if (xRow[cellY]) {
          const entity = this.getEditorCellEntity(cellX, cellY);
          data.push(
            { x: cellX, y: cellY, type: entity?.type }
          );
        }
      }
    }
    localStorage.setItem(this.localStorageKey, JSON.stringify(data));
  }

  clearMapElements() {
    const blockerEl = this.getBlockerElement();
    const buttons = blockerEl.children[1].children;
    for (let i = buttons.length; i--;) {
      const button = buttons[i] as HTMLButtonElement;
      button.style.background = this.cellColors.empty;
    }
  }

  // openCloseDoors() {}

  fillRoomAfterVisit() {
    this.enableEditorMode();
  }

  deleteTriggersFromScene() {
    // this.deleteEntitiesFromScene(ENTITY_TYPE.TRIGGER);
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

  clearEditorEntities() {
    for (let cellX = 0; cellX < this.currentEditorEntities.length; cellX++) {
      const xRow = this.currentEditorEntities[cellX];
      if (!xRow) {
        continue;
      }
      for (let cellY = 0; cellY < xRow.length; cellY++) {
        if (xRow[cellY]) {
          this.removeEditorCellEntity(cellX, cellY);
          delete xRow[cellY];
        }
      }
    }
  }

  restoreEditorMap() {
    for (let cellX = 0; cellX < this.currentEditorEntities.length; cellX++) {
      const xRow = this.currentEditorEntities[cellX];
      if (!xRow) {
        continue;
      }
      for (let cellY = 0; cellY < xRow.length; cellY++) {
        if (xRow[cellY]) {
          const entity = this.currentEditorEntities[cellX][cellY];
          this.entitiesContainer.remove(entity.actor.mesh);
          const newEntity = this.spawnEntityInRoom(cellX, cellY, entity.type as ENTITY_TYPE);
          this.currentEditorEntities[cellX][cellY] = newEntity;
        }
      }
    }
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

  spawnEntityInRoom(cellX: number, cellY: number, entityType: ENTITY_TYPE) {
    const cell = new Vector2(cellX, cellY);
    const roomCoordinates = this.cellToWorldCoordinates(this.currentRoom.cellPosition);
    const cellCoordinates =
        this.cellToWorldCoordinates(cell).add(roomCoordinates);
    switch (entityType) {
      case ENTITY_TYPE.ENEMY:
        return this.spawnEnemy(cellCoordinates, this.currentRoom.type);
      case ENTITY_TYPE.WALL:
        return this.spawnWall(
          this.getCenterPosition(cellCoordinates, new Vector2(this.mapCellSize, this.mapCellSize)),
          new Vector2(this.mapCellSize, this.mapCellSize),
          this.currentRoom.type,
        );
      default:
        throw new Error(`entityType: ${entityType} not found`);
    }
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

