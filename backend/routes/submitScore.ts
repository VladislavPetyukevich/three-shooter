import assert from 'assert';
import {
  DungeonRoom,
  EnemyRoomCell,
  RoomCellType,
} from '../../source/dungeon/DungeonRoom';

interface ScoreSubmit {
  name: string;
  logs: number[];
}

const parseScoreBody = async (request: Request): Promise<ScoreSubmit> => {
  const bodyJSON = await request.json();
  assert.equal(
    typeof bodyJSON.name,
    'string',
    'Name must be a string'
  );
  assert.equal(
    Array.isArray(bodyJSON.logs),
    true,
    'Logs must be an array'
  );
  for (let i = bodyJSON.logs.length; i--;) {
    const logItem = bodyJSON.logs[i];
    assert.equal(
      typeof logItem,
      'number',
      'Log item must be a number'
    );
  }
  return bodyJSON;
};

const checkIsFairRoom = (logsForRoom: number[], roomEnemies: number[]) => {
  const roomEnemiesRemaining = [...roomEnemies];
  for (let i = logsForRoom.length; i--;) {
    const logItem = logsForRoom[i];
    const index = roomEnemiesRemaining.indexOf(logItem);
    if (index === -1) {
      return false;
    }
    roomEnemiesRemaining.splice(index, 1);
  }
  return true;
}

const checkIsFairLog = (log: number[]) => {
  const dungeonRoom = new DungeonRoom();
  let currentRoom = dungeonRoom.getNextDungeonRoomConstructor();
  let currentLogIndex = 0;
  while (currentLogIndex < log.length) {
    const currentRoomConstructor = currentRoom.constructor;
    const enemiesInCurrentRoom = currentRoomConstructor.cells.filter(cell => cell.type === RoomCellType.Enemy).map(cell => (cell as EnemyRoomCell).kind);
    const roomInLog = log.slice(currentLogIndex, currentLogIndex + enemiesInCurrentRoom.length);
    currentLogIndex += enemiesInCurrentRoom.length;
    currentRoom = dungeonRoom.getNextDungeonRoomConstructor();
    const roomFailed = !checkIsFairRoom(roomInLog, enemiesInCurrentRoom);
    if (roomFailed) {
      return false;
    }
  }
  return true;
};

export const submitScore = async (req: Request) => {
  const scoreBody = await parseScoreBody(req);

  const isFairLog = checkIsFairLog(scoreBody.logs);

  const score = isFairLog ? scoreBody.logs.length : 0;
  return new Response(JSON.stringify({ score }));
}
