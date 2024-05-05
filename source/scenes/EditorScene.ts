import { Vector2 } from 'three';
import { ENTITY_TYPE } from '@/constants';
import { Entity } from '@/core/Entities/Entity';
import { EnemyKind } from '@/dungeon/DungeonRoom';
import { TestSceneProps, TestScene } from './testScene';
import { Room } from './Spawner/RoomSpawner';

interface SavedCell {
  x: number;
  y: number;
  type: ENTITY_TYPE;
}

interface SelectedCell {
  x: number;
  y: number;
  entity: Entity;
}

interface CellColors {
  border: string;
  borderSelected: string;
  empty: string;
  enemy: string;
  wall: string;
  transparent: string;
}

const mapCellSize = '0.75rem';

export class EditorScene extends TestScene {
  enableKey: string;
  isEditorMode: boolean;
  currentEditorEntities: Entity[][];
  currentEntityType: ENTITY_TYPE;
  currentEnemyKind: EnemyKind;
  cellColors: CellColors;
  padding: number;
  localStorageKey: string;
  rootElement: HTMLElement;
  selectedCell?: SelectedCell;
  groupSelectedCells: SelectedCell[];
  prevFilledGhoshCells: { x: number; y: number; }[];
  fillMode: boolean;

  constructor(props: TestSceneProps) {
    super(props);
    this.fillMode = false;
    this.groupSelectedCells = [];
    this.prevFilledGhoshCells = [];
    this.offsetBlockerMain();
    this.rootElement = this.createEditorRootElement();
    this.roomSpawner.onRoomVisit = this.handleRoomVisit;
    this.enableKey = '`';
    this.isEditorMode = false;
    this.currentEditorEntities = [];
    this.currentEntityType = ENTITY_TYPE.ENEMY;
    this.currentEnemyKind = EnemyKind.Soul;
    this.cellColors = {
      border: '#666',
      borderSelected: '#900',
      empty: 'black',
      enemy: '#933',
      wall: 'gray',
      transparent: 'transparent',
    };
    this.padding = 2;
    this.localStorageKey = 'editor-map';
    this.removeBackgroundColorFromBlocker();
    this.createMapElements();
    this.createEntitiesElements();
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

  handleRoomVisit = (room: Room) => {
    this.currentRoom = room;
    this.enableEditorMode();
    room.entities.forEach(
      entity => this.entitiesContainer.remove(entity.mesh)
    );
  };

  loadFromLocalStorage() {
    const data = localStorage.getItem(this.localStorageKey);
    if (!data) {
      return;
    }
    const parsed: SavedCell[] = JSON.parse(data);
    parsed.forEach(cell =>
      this.addEditorCellEntity(cell.x, cell.y, cell.type)
    );
  }

  enableEditorMode() {
    this.isEditorMode = true;
    console.log('++++EDITOR MODE ENABLED++++');
    this.loadFromLocalStorage();
    this.restoreEditorMap();
    this.moveCameraToSky();
    document.exitPointerLock();
    setTimeout(() => {
      this.disableBlockerInstructions();
      this.changeGameStatus(true);
    }, 100);
  }

  createMapElements() {
    const mapContainer = document.createElement('div');
    mapContainer.id = 'mapContainer';
    mapContainer.style.lineHeight = '0';
    mapContainer.style.userSelect = 'none';
    const mapContainerGhost = document.createElement('div');
    mapContainerGhost.id = 'mapContainerGhost';
    mapContainerGhost.style.position = 'absolute';
    mapContainerGhost.style.top = '0px';
    mapContainerGhost.style.left = '0px';
    mapContainerGhost.style.lineHeight = '0';
    mapContainerGhost.style.userSelect = 'none';
    mapContainerGhost.style.zIndex = '-1';
    for (let cellY = this.padding; cellY < this.roomSpawner.roomSize.height - this.padding; cellY++) {
      for (let cellX = this.padding; cellX < this.roomSpawner.roomSize.width - this.padding; cellX++) {
        const mapCellEl = document.createElement('div');
        mapCellEl.id = this.getMapCellElementId(cellX, cellY);
        mapCellEl.style.display = 'inline-block';
        mapCellEl.style.width = mapCellSize;
        mapCellEl.style.height = mapCellSize;
        mapCellEl.style.background = this.cellColors.transparent;
        mapCellEl.style.border = this.getMapCellBorder(false);
        const mapCellElGhost = document.createElement('div');
        mapCellElGhost.id = this.getGhostMapCellElementId(cellX, cellY);
        mapCellElGhost.style.display = 'inline-block';
        mapCellElGhost.style.width = mapCellSize;
        mapCellElGhost.style.height = mapCellSize;
        mapCellElGhost.style.background = this.cellColors.empty;
        mapCellElGhost.style.border = this.getMapCellBorder(false);

        mapCellEl.onclick = (event) => {
          const cellEntity = this.getEditorCellEntity(cellX, cellY);
          if (event.ctrlKey) {
            if (!cellEntity) {
              return;
            }
            this.addGroupSelectedCell({
              x: cellX,
              y: cellY,
              entity: cellEntity,
            });
            return;
          }
          if (!cellEntity) {
            this.addEditorCellEntity(cellX, cellY, this.currentEntityType);
          } else {
            this.removeEditorCellEntity(cellX, cellY);
          }
        };
        mapCellEl.onmousedown = (event) => {
          if (event.ctrlKey) {
            return;
          }
          const cellEntity = this.getEditorCellEntity(cellX, cellY);
          if (!cellEntity) {
            this.fillMode = true;
            return;
          }
          mapContainer.style.cursor = 'grabbing';
          this.selectedCell = {
            x: cellX,
            y: cellY,
            entity: cellEntity,
          };
          this.removeEditorCellEntity(cellX, cellY);
        };
        mapCellEl.onmouseup = () => {
          mapContainer.style.cursor = 'default';
          this.fillMode = false;
          if (!this.selectedCell) {
            return;
          }
          this.clearPrevFilledGhoshCells();
          this.addEditorCellEntity(cellX, cellY, this.selectedCell.entity.type as ENTITY_TYPE);
          this.resetMapCellElBorder(this.selectedCell.x, this.selectedCell.y);
          if (this.groupSelectedCells) {
            this.groupSelectedCells.forEach(cell => {
              if (!this.selectedCell) {
                return;
              }
              if (cell.x === this.selectedCell.x && cell.y === this.selectedCell.y) {
                return;
              }
              const cellDiffX = cell.x - this.selectedCell.x;
              const cellDiffY = cell.y - this.selectedCell.y;
              this.removeEditorCellEntity(cell.x, cell.y);
              this.addEditorCellEntity(cellX + cellDiffX, cellY + cellDiffY, cell.entity.type as ENTITY_TYPE);
              this.resetMapCellElBorder(cell.x, cell.y);
            });
          }
          this.selectedCell = undefined;
          this.groupSelectedCells = [];
        };
        mapCellEl.onmousemove = (event) => {
          const cellEntity = this.getEditorCellEntity(cellX, cellY);
          if (event.altKey && cellEntity) {
            this.removeEditorCellEntity(cellX, cellY);
            return;
          }
          if (this.fillMode) {
            if (cellEntity) {
              return;
            }
            this.addEditorCellEntity(cellX, cellY, this.currentEntityType);
            return;
          }
          if (event.ctrlKey) {
            if (!cellEntity) {
              return;
            }
            this.addGroupSelectedCell({
              x: cellX,
              y: cellY,
              entity: cellEntity,
            });
            mapCellEl.style.border = this.getMapCellBorder(true);
            return;
          }
          if (this.selectedCell) {
            this.clearPrevFilledGhoshCells();
            this.fillGhostMapCellElement(cellX, cellY, this.selectedCell.entity.type as ENTITY_TYPE);
            this.groupSelectedCells.forEach(groupSelectedCell => {
              if (!this.selectedCell) {
                return;
              }
              const cellDiffX = groupSelectedCell.x - this.selectedCell.x;
              const cellDiffY = groupSelectedCell.y - this.selectedCell.y;
              this.fillGhostMapCellElement(cellX + cellDiffX, cellY + cellDiffY, groupSelectedCell.entity.type as ENTITY_TYPE)
            });
            return;
          }
        };
        mapContainer.appendChild(mapCellEl);
        mapContainerGhost.appendChild(mapCellElGhost);
      }

      mapContainer.appendChild(
        document.createElement('br')
      );
      mapContainerGhost.appendChild(
        document.createElement('br')
      );
    }
    this.rootElement.appendChild(mapContainer);
    this.rootElement.appendChild(mapContainerGhost);
  }

  addGroupSelectedCell(cell: SelectedCell) {
    const alreadySelected = !!this.groupSelectedCells.find(
      c => c.x === cell.x && c.y === cell.y
    );
    if (alreadySelected) {
      return;
    }
    this.groupSelectedCells.push(cell);
  }

  resetMapCellElBorder(cellX: number, cellY: number) {
    const mapCellEl = document.getElementById(this.getMapCellElementId(cellX, cellY));
    if (!mapCellEl) {
      throw new Error('mapCellEl not found');
    }
    mapCellEl.style.border = this.getMapCellBorder(false);
  }

  getMapCellBorder(selected: boolean) {
    return `1px solid ${selected ? this.cellColors.borderSelected : this.cellColors.border}`;
  }

  getMapCellElementId(cellX: number, cellY: number) {
    return `map-cell-${cellX}-${cellY}`;
  }

  getGhostMapCellElementId(cellX: number, cellY: number) {
    return `map-cell-ghost-${cellX}-${cellY}`;
  }

  fillMapCellElement(cellX: number, cellY: number, entityType: ENTITY_TYPE) {
    const mapCellEl = document.getElementById(this.getMapCellElementId(cellX, cellY));
    if (!mapCellEl) {
      throw new Error('mapCellEl not found');
    }
    mapCellEl.style.background = this.getCellColor(entityType);
  }

  fillGhostMapCellElement(cellX: number, cellY: number, entityType: ENTITY_TYPE) {
    const mapCellEl = document.getElementById(this.getGhostMapCellElementId(cellX, cellY));
    if (!mapCellEl) {
      throw new Error('mapCellEl not found');
    }
    this.prevFilledGhoshCells.push({
      x: cellX,
      y: cellY,
    });
    mapCellEl.style.background = this.getCellColor(entityType);
  }

  clearMapCellElement(cellX: number, cellY: number) {
    const mapCellEl = document.getElementById(this.getMapCellElementId(cellX, cellY));
    if (!mapCellEl) {
      throw new Error('mapCellEl not found');
    }
    mapCellEl.style.background = this.cellColors.transparent;
  }

  clearGhostMapCellElement(cellX: number, cellY: number) {
    const mapCellEl = document.getElementById(this.getGhostMapCellElementId(cellX, cellY));
    if (!mapCellEl) {
      throw new Error('mapCellEl not found');
    }
    mapCellEl.style.background = this.cellColors.empty;
  }

  clearPrevFilledGhoshCells() {
    this.prevFilledGhoshCells.forEach(
      prevFilledCell => this.clearGhostMapCellElement(prevFilledCell.x, prevFilledCell.y)
    );
    this.prevFilledGhoshCells = [];
  }

  getCellColor(entityType: ENTITY_TYPE) {
    switch (entityType) {
      case ENTITY_TYPE.ENEMY:
        return this.cellColors.enemy;
      case ENTITY_TYPE.WALL:
        return this.cellColors.wall;
      default:
        return '';
    }
  }

  createEntitiesElements() {
    const container = document.createElement('div');
    const enemyButton = document.createElement('button');
    enemyButton.style.background = this.cellColors.enemy;
    enemyButton.innerHTML = 'Enemy';
    enemyButton.onclick = () => this.currentEntityType = ENTITY_TYPE.ENEMY;
    const enemyKindSelect = document.createElement('select');
    enemyKindSelect.style.background = 'azure';
    [
      this.createOption('Soul', EnemyKind.Soul),
      this.createOption('Shooter', EnemyKind.Shooter),
      this.createOption('Kamikaze', EnemyKind.Kamikaze),
      this.createOption('Parasite', EnemyKind.Parasite),
      this.createOption('Bleed', EnemyKind.Bleed),
      this.createOption('Breeding', EnemyKind.BreedingWithSpawner),
    ].forEach(option => enemyKindSelect.appendChild(option));
    enemyKindSelect.onchange = () => this.currentEnemyKind = +enemyKindSelect.value;
    enemyKindSelect.value = `${this.currentEnemyKind}`;
    container.appendChild(enemyKindSelect);
    container.appendChild(enemyButton);
    const wallButton = document.createElement('button');
    wallButton.style.background = this.cellColors.wall;
    wallButton.innerHTML = 'Wall';
    wallButton.onclick = () => this.currentEntityType = ENTITY_TYPE.WALL;
    container.appendChild(wallButton);

    const utilityButtonsContainer = document.createElement('div');
    utilityButtonsContainer.style.display = 'flex';
    utilityButtonsContainer.style.flexDirection = 'column';
    const clearButton = document.createElement('button');
    clearButton.innerHTML = 'Clear';
    clearButton.onclick = () => {
      this.clearMapElements();
      this.clearEditorEntities();
    };
    utilityButtonsContainer.appendChild(clearButton);
    const exportButton = document.createElement('button');
    exportButton.innerHTML = 'Log to console';
    exportButton.onclick = () => this.logDungeonToConsole();
    utilityButtonsContainer.appendChild(exportButton);
    const saveButton = document.createElement('button');
    saveButton.innerHTML = 'Save to local storage';
    saveButton.onclick = () => this.saveDungeonToLocalStorage();
    utilityButtonsContainer.appendChild(saveButton);
    container.appendChild(utilityButtonsContainer);
    this.rootElement.appendChild(container);
  }

  createOption(textContent: string, value: number) {
    const select = document.createElement('option');
    select.textContent = textContent;
    select.value = `${value}`;
    return select;
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
          const entityType = this.currentEditorEntities[cellX][cellY].type;
          const entityTypeFormated =
            entityType[0].toLocaleUpperCase() +
            entityType.slice(1).toLocaleLowerCase();
          resultJson += '\n  {';
          resultJson += ` position: new Vector2(${cellX}, ${cellY}),`;
          resultJson += ` type: RoomCellType.${entityTypeFormated}`;
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
    for (let cellY = this.padding; cellY < this.roomSpawner.roomSize.height - this.padding; cellY++) {
      for (let cellX = this.padding; cellX < this.roomSpawner.roomSize.width - this.padding; cellX++) {
        this.clearMapCellElement(cellX, cellY);
        this.clearGhostMapCellElement(cellX, cellY);
      }
    }
  }

  fillRoomAfterVisit() {
    this.enableEditorMode();
  }

  deleteEntitiesFromScene(entityType: ENTITY_TYPE) {
    const entities = this.entitiesContainer.entities.filter(
      entity => entity.type === entityType
    );
    entities.forEach(
      entity => this.entitiesContainer.remove(entity.mesh)
    );
  }

  addEditorCellEntity(cellX: number, cellY: number, entityType: ENTITY_TYPE) {
    const entity = this.spawnEntityInRoom(cellX, cellY, entityType);
    if (!this.currentEditorEntities[cellX]) {
      this.currentEditorEntities[cellX] = [];
    }
    this.currentEditorEntities[cellX][cellY] = entity;
    this.fillMapCellElement(cellX, cellY, entityType);
  }

  removeEditorCellEntity(cellX: number, cellY: number) {
    if (!this.currentEditorEntities[cellX]) {
      return;
    }
    const entity = this.currentEditorEntities[cellX][cellY];
    this.entitiesContainer.remove(entity.mesh);
    delete this.currentEditorEntities[cellX][cellY];
    this.clearMapCellElement(cellX, cellY);
  }

  getNeighboringEntites(cellX: number, cellY: number) {
    return [
      ...this.getNeighboringEntitesInDirection(cellX, cellY, 1, 0),
      ...this.getNeighboringEntitesInDirection(cellX, cellY, -1, 0),
      ...this.getNeighboringEntitesInDirection(cellX, cellY, 0, 1),
      ...this.getNeighboringEntitesInDirection(cellX, cellY, 0, -1),
      ...this.getNeighboringEntitesInDirection(cellX, cellY, 1, 1),
      ...this.getNeighboringEntitesInDirection(cellX, cellY, 1, -1),
      ...this.getNeighboringEntitesInDirection(cellX, cellY, -1, 1),
      ...this.getNeighboringEntitesInDirection(cellX, cellY, -1, -1),
    ];
  }

  getNeighboringEntitesInDirection(
    cellX: number, cellY: number,
    directionX: number, directionY: number,
  ) {
    const result: SelectedCell[] = [];

    const coordinates: [number, number] = [cellX + directionX, cellY + directionY];
    const neighbour = this.getEditorCellEntity(...coordinates);
    if (neighbour) {
      result.push({
        x: coordinates[0],
        y: coordinates[1],
        entity: neighbour,
      });
      result.push(...this.getNeighboringEntitesInDirection(...coordinates, directionX, directionY));
    }
    return result;
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
          this.entitiesContainer.remove(entity.mesh);
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
    const roomCoordinates = this.cellCoordinates.toWorldCoordinates(this.currentRoom.cellPosition);
    const cellCoordinates =
      this.cellCoordinates.toWorldCoordinates(cell).add(roomCoordinates);
    switch (entityType) {
      case ENTITY_TYPE.ENEMY:
        return this.spawnEnemy(
          cellCoordinates,
          this.currentRoom.type,
          this.currentEnemyKind,
        );
      case ENTITY_TYPE.WALL:
        return this.roomSpawner.spawnWall(
          this.getCenterPosition(cellCoordinates, new Vector2(this.cellCoordinates.size, this.cellCoordinates.size)),
          new Vector2(this.cellCoordinates.size, this.cellCoordinates.size),
          this.currentRoom.type,
          false,
        );
      default:
        throw new Error(`entityType: ${entityType} not found`);
    }
  }

  createEditorRootElement() {
    const rootEl = document.createElement('div');
    rootEl.style.position = 'absolute';
    rootEl.style.top = '0px';
    rootEl.style.left = '0px';
    const blocker = this.getBlockerElement();
    blocker.appendChild(rootEl);
    return rootEl;
  }

  offsetBlockerMain() {
    const blockerMain = document.getElementById('blocker-main');
    if (!blockerMain) {
      throw new Error('blockerMain not found');
    }
    blockerMain.style.position = 'absolute';
    blockerMain.style.right = '0px';
  }

  getBlockerElement() {
    const domEl = document.getElementById('blocker');
    if (!domEl) {
      throw new Error('Failed to find blocker element');
    }
    return domEl;
  }

  getInstructionsElement() {
    const domEl = document.getElementById('blocker-main');
    if (!domEl) {
      throw new Error('Failed to find instructions element');
    }
    return domEl;
  }

  changeGameStatus(isEnabled: boolean) {
    (<any>window).threeShooter.enabled = isEnabled;
  }

  moveCameraToSky() {
    this.camera.position.y = 20;
  }

  update(delta: number) {
    if (this.isEditorMode) {
      this.entitiesContainer.update(0.0000001);
    } else {
      super.update(delta);
    }
  }
}
