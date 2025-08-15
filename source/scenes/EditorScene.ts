import { Vector2 } from 'three';
import { ENTITY_TYPE } from '@/constants';
import { EnemyKind, RoomCell, RoomCellType, constructors } from '@/dungeon/DungeonRoom';
import { TestSceneProps, TestScene } from './testScene';
import { Room } from './Spawner/RoomSpawner';

interface CellColors {
  border: string;
  borderSelected: string;
  empty: string;
  enemy: string;
  wall: string;
  wallMini: string;
  transparent: string;
}

const mapCellSize = '0.75rem';

export class EditorScene extends TestScene {
  enableKey: string;
  isEditorMode: boolean;
  roomCells: RoomCell[];
  currentEntityType: RoomCellType;
  currentEnemyKind: EnemyKind;
  cellColors: CellColors;
  padding: number;
  localStorageKey: string;
  rootElement: HTMLElement;
  selectedCell?: RoomCell;
  groupSelectedCells: RoomCell[];
  prevFilledGhoshCells: { x: number; y: number; }[];
  fillMode: boolean;
  miniWallChecked: boolean;

  constructor(props: TestSceneProps) {
    super(props);
    this.fillMode = false;
    this.miniWallChecked = false;
    this.roomCells = [];
    this.groupSelectedCells = [];
    this.prevFilledGhoshCells = [];
    this.offsetBlockerMain();
    this.rootElement = this.createEditorRootElement();
    this.roomSpawner.onRoomVisit = this.handleRoomVisit;
    this.enableKey = '`';
    this.isEditorMode = false;
    this.currentEntityType = RoomCellType.Wall;
    this.currentEnemyKind = EnemyKind.Soul;
    this.cellColors = {
      border: '#666',
      borderSelected: '#900',
      empty: 'black',
      enemy: '#933',
      wall: 'gray',
      wallMini: 'LightGray',
      transparent: 'transparent',
    };
    this.padding = 1;
    this.localStorageKey = 'editor-map';
    this.createMapElements();
    this.createEntitiesElements();
    document.addEventListener('pointerlockchange', () => {
      if (document.pointerLockElement) {
        this.disableEditorMode();
      } else {
        this.enableEditorMode();
      }
    });

    this.pickupAllGuns();
    this.isPlayerFallingAtStart = false;
    this.player.canMove();
  }

  handleRoomVisit = (room: Room) => {
    this.currentRoom = room;
    this.enableEditorMode();
    room.entities.forEach(
      entity => this.entitiesContainer.remove(entity.mesh)
    );
  };

  pickupAllGuns() {
    const gunPickups = this.entitiesContainer.entities.filter(
      entity => entity.type === ENTITY_TYPE.GUN_PICK_UP
    );
    gunPickups.forEach((entity) => this.player.onCollide(entity));
    setTimeout(() => {
      this.player.behavior.handleSwitchGunByIndex(0)({ name: 'weapon1', isEnded: false });
    }, 300);
  }

  loadFromLocalStorage() {
    const data = localStorage.getItem(this.localStorageKey);
    if (!data) {
      return;
    }
    const parsed: RoomCell[] = JSON.parse(data);
    this.roomCells = [];
    parsed.forEach(cell => this.roomCells.push({
      ...cell,
      position: new Vector2(cell.position.x, cell.position.y),
    }));
    this.updateRoomCells();
  }

  enableEditorMode = () => {
    this.isEditorMode = true;
    console.log('++++EDITOR MODE ENABLED++++');
    this.loadFromLocalStorage();
    this.restoreEditorMap();
    this.player.cantMove();
    this.moveCameraToSky();
    document.exitPointerLock();
    setTimeout(() => {
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

        mapCellEl.onclick = () => {
          const cell = this.getRoomCell(cellX, cellY);
          if (!cell) {
            this.addEditorCellEntity(cellX, cellY, this.currentEntityType);
          } else {
            this.removeEditorCellEntity(cellX, cellY);
          }
        };
        mapCellEl.onmousedown = (event) => {
          if (event.ctrlKey) {
            return;
          }
          const cell = this.getRoomCell(cellX, cellY);
          if (!cell) {
            this.fillMode = true;
            return;
          }
          mapContainer.style.cursor = 'grabbing';
          this.selectedCell = cell;
        };
        mapCellEl.onmouseup = () => {
          mapContainer.style.cursor = 'default';
          this.fillMode = false;
          if (!this.selectedCell) {
            return;
          }
          const samePos = (
            this.selectedCell.position.x === cellX &&
            this.selectedCell.position.y === cellY
          );
          if (samePos) {
            this.selectedCell = undefined;
            return;
          }
          const cell = this.getRoomCell(cellX, cellY);
          if (cell) {
            this.removeEditorCellEntity(cellX, cellY);
            return;
          }
          this.removeEditorCellEntity(this.selectedCell.position.x, this.selectedCell.position.y);
          this.addEditorCellEntity(cellX, cellY, this.currentEntityType);
          this.clearPrevFilledGhoshCells();
          if (this.groupSelectedCells) {
            this.groupSelectedCells.forEach(groupSelectedCell => {
              if (!this.selectedCell) {
                return;
              }
              if (groupSelectedCell === this.selectedCell) {
                return;
              }
              const cellDiffX = groupSelectedCell.position.x - this.selectedCell.position.x;
              const cellDiffY = groupSelectedCell.position.y - this.selectedCell.position.y;
              this.removeEditorCellEntity(groupSelectedCell.position.x, groupSelectedCell.position.y);
              this.addEditorCellEntity(cellX + cellDiffX, cellY + cellDiffY, this.currentEntityType);
            });
          }
          this.selectedCell = undefined;
          this.clearGroupSelectedCells();
        };
        mapCellEl.onmousemove = (event) => {
          const cellEntity = this.getRoomCell(cellX, cellY);
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
            this.addGroupSelectedCell(cellEntity);
            return;
          }
          if (this.selectedCell) {
            this.clearPrevFilledGhoshCells();
            this.fillGhostMapCellElement(cellX, cellY, this.selectedCell);
            this.groupSelectedCells.forEach(groupSelectedCell => {
              if (!this.selectedCell) {
                return;
              }
              const cellDiffX = groupSelectedCell.position.x - this.selectedCell.position.x;
              const cellDiffY = groupSelectedCell.position.y - this.selectedCell.position.y;
              this.fillGhostMapCellElement(cellX + cellDiffX, cellY + cellDiffY, groupSelectedCell);
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

  addGroupSelectedCell(cell: RoomCell) {
    const alreadySelected = this.groupSelectedCells.indexOf(cell) !== -1;
    if (alreadySelected) {
      return;
    }
    this.groupSelectedCells.push(cell);
    const cellEl = this.getMapCellElement(cell.position.x, cell.position.y);
    cellEl.style.border = this.getMapCellBorder(true);
  }

  clearGroupSelectedCells() {
    this.groupSelectedCells.forEach(cell => {
      const cellEl = this.getMapCellElement(cell.position.x, cell.position.y);
      cellEl.style.border = this.getMapCellBorder(false);
    });
    this.groupSelectedCells = [];
  }

  getMapCellBorder(selected: boolean) {
    return `1px solid ${selected ? this.cellColors.borderSelected : this.cellColors.border}`;
  }

  getMapCellElement(cellX: number, cellY: number) {
    const cellEl = document.getElementById(this.getMapCellElementId(cellX, cellY));
    if (!cellEl) {
      throw new Error('cellEl not found');
    }
    return cellEl;
  }

  getMapCellElementId(cellX: number, cellY: number) {
    return `map-cell-${cellX}-${cellY}`;
  }

  getGhostMapCellElementId(cellX: number, cellY: number) {
    return `map-cell-ghost-${cellX}-${cellY}`;
  }

  fillMapCellElement(cellX: number, cellY: number, cell: RoomCell) {
    const mapCellEl = document.getElementById(this.getMapCellElementId(cellX, cellY));
    if (!mapCellEl) {
      throw new Error('mapCellEl not found');
    }
    mapCellEl.style.background = this.getCellColor(cell);
  }

  fillGhostMapCellElement(cellX: number, cellY: number, cell: RoomCell) {
    const mapCellEl = document.getElementById(this.getGhostMapCellElementId(cellX, cellY));
    if (!mapCellEl) {
      throw new Error('mapCellEl not found');
    }
    this.prevFilledGhoshCells.push({
      x: cellX,
      y: cellY,
    });
    mapCellEl.style.background = this.getCellColor(cell);
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

  getCellColor(cell: RoomCell) {
    switch (cell.type) {
      case RoomCellType.Wall:
        return cell.mini ? this.cellColors.wallMini : this.cellColors.wall;
      case RoomCellType.DoorWall:
        return this.cellColors.wall;
      case RoomCellType.Enemy:
        return this.cellColors.enemy;
      default:
        return '';
    }
  }

  createEntitiesElements() {
    const container = document.createElement('div');
    const enemyButton = document.createElement('button');
    enemyButton.style.background = this.cellColors.enemy;
    enemyButton.innerHTML = 'Enemy';
    enemyButton.onclick = () => this.currentEntityType = RoomCellType.Enemy;
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
    wallButton.onclick = () => this.currentEntityType = RoomCellType.Wall;
    container.appendChild(wallButton);
    const miniCheckbox = document.createElement('input');
    miniCheckbox.id = 'mini-wall-checkbox';
    miniCheckbox.type = 'checkbox';
    miniCheckbox.onclick = (event: MouseEvent) => {
      const checked = (event.target as HTMLInputElement).checked;
      this.miniWallChecked = checked;
    };
    container.appendChild(miniCheckbox);
    const miniCheckboxLabel = document.createElement('label');
    miniCheckboxLabel.htmlFor = 'mini-wall-checkbox';
    miniCheckboxLabel.innerHTML = 'Mini wall';
    container.appendChild(miniCheckboxLabel);

    const utilityButtonsContainer = document.createElement('div');
    utilityButtonsContainer.style.display = 'flex';
    utilityButtonsContainer.style.flexDirection = 'column';
    const clearButton = document.createElement('button');
    clearButton.innerHTML = 'Clear';
    clearButton.onclick = () => {
      this.clearEditor();
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
    const result = this.roomCells
      .map(cell => {
        const fields: string[] = [];
        for (const key in cell) {
          const value = cell[key as keyof RoomCell];
          if (key === 'position') {
            fields.push(`${key}: new Vector2(${(value as Vector2).x}, ${(value as Vector2).y})`);
            continue;
          }
          fields.push(`${key}: ${value}`);
        }
        return `{${fields.join(', ')}},`;
      })
      .join('\n');
    console.log(result);
  }

  saveDungeonToLocalStorage() {
    localStorage.setItem(this.localStorageKey, JSON.stringify(this.roomCells));
  }

  addEditorCellEntity(cellX: number, cellY: number, entityType: RoomCellType) {
    const cell: RoomCell = entityType === RoomCellType.Enemy ? {
      position: new Vector2(cellX, cellY),
      type: entityType,
      kind: EnemyKind.Soul,
    } : {
      position: new Vector2(cellX, cellY),
      type: entityType,
      mini: this.miniWallChecked,
    };
    this.roomCells.push(cell);
    this.updateRoomCells();
  }

  removeEditorCellEntity(cellX: number, cellY: number) {
    const cell = this.getRoomCell(cellX, cellY);
    if (!cell) {
      return;
    }
    const cellIndex = this.roomCells.indexOf(cell);
    this.roomCells.splice(cellIndex, 1);
    this.updateRoomCells();
  }

  updateEditorMap() {
    for (let cellY = this.padding; cellY < this.roomSpawner.roomSize.height - this.padding; cellY++) {
      for (let cellX = this.padding; cellX < this.roomSpawner.roomSize.width - this.padding; cellX++) {
        const editorMapEl = document.getElementById(this.getMapCellElementId(cellX, cellY));
        if (!editorMapEl) {
          throw new Error('editorMapEl not found');
        }
        const cell = this.getRoomCell(cellX, cellY);
        editorMapEl.style.background = cell ? this.getCellColor(cell) : this.cellColors.transparent;
      }
    }
  }

  getRoomCell(cellX: number, cellY: number) {
    return this.roomCells.find(cell =>
      cell.position.x === cellX && cell.position.y === cellY
    );
  }

  clearEditor() {
    this.roomCells = [];
    this.updateRoomCells();
  }

  updateRoomCells() {
    this.currentRoom.entities.forEach(entity => this.entitiesContainer.remove(entity.mesh));
    this.currentRoom.entities = [];
    constructors[0].getCells = () => this.roomCells;
    this.currentRoom.roomConstructor = constructors[0];
    this.roomSpawner.fillRoomBeforeVisit(this.currentRoom);
    this.roomSpawner.fillRoomAfterVisit(this.currentRoom);
    this.updateEditorMap();
  }

  restoreEditorMap() {
    const roomCellsClone = [...this.roomCells];
    this.clearEditor();
    this.roomCells = roomCellsClone;
    this.updateRoomCells();
  }

  disableEditorMode = () => {
    this.isEditorMode = false;
    console.log('----EDITOR MODE DISABLED----');
    this.player.canMove();
    this.changeGameStatus(true);
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

  changeGameStatus(isEnabled: boolean) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
