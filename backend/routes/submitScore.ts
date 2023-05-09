import assert from 'assert';
import { RandomNumbers } from '../../source/RandomNumbers';
import {
  DungeonRoom,
  EnemyRoomCell,
  RoomCellType,
} from '../../source/dungeon/DungeonRoom';
import { RANDOM_NUMBERS_COUNT, roomSize } from '../../source/constants';

interface ScoreSubmit {
  name: string;
  logs: number[][];
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
      Array.isArray(logItem),
      true,
      'Logs must be an array of arrays'
    );
    for (let j = logItem.length; j--;) {
      const logItemItem = logItem[j];
      assert.equal(
        typeof logItemItem,
        'number',
        'Logs must be an array of number arrays'
      );
    }
  }
  return bodyJSON;
};

const compareItems = (a: number[], b: number[]) =>
  a.every((element, index) => element === b[index]);

const calcScore = (logs: number[][]) =>
  logs.slice(1).reduce((acc, log) => acc + log.length, 0);

export const submitScore = async (req: Request) => {
  const scoreBody = await parseScoreBody(req);
  const seed = scoreBody.logs[0][0];
  const randomNumbers = new RandomNumbers(
    RANDOM_NUMBERS_COUNT,
    seed,
  );
  const dungeonRoom = new DungeonRoom();
  dungeonRoom.randomNumbersGenerator = randomNumbers;
  const isFairRoomChoise = scoreBody.logs.every((logItem, index, logs) => {
    if (index === 0) {
      return true;
    }
    const roomIndices = Array.from(
      { length: 3 },
      () => dungeonRoom.getRandomRoomConstructorIndex(),
    );
    const fairRoomChoise = roomIndices.indexOf(logItem[0]) !== -1;
    if (!fairRoomChoise) {
      return fairRoomChoise;
    }
    const roomConstructor = dungeonRoom.getRoomConstructor(logItem[0]);
    const roomEnemiesKind = roomConstructor(roomSize)
      .filter(cell => cell.type === RoomCellType.Enemy)
      .map(cell => (cell as EnemyRoomCell).kind);
    if (
      (logItem.length - 1 !== roomEnemiesKind.length) &&
      (index !== logs.length - 1)
    ) {
      return false;
    }
    const fairKills = compareItems(
      logItem.slice(1).sort(),
      roomEnemiesKind.sort()
    );
    return fairKills;
  });

  const score = isFairRoomChoise ? calcScore(scoreBody.logs) : 0;
  return new Response(JSON.stringify({ score }));
}
