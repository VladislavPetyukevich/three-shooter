export const BULLET = {
  LIFE_TIME: 5,
  MASS: 5,
  SHAPE_RADIUS: 0.3,
  COLOR: 'red'
};

export const ENEMY = {
  WALK_SPEED: 5
};

export const PLAYER = {
  WALK_SPEED: 25,
  EYE_Y_POS: 2, // eyes are 2 meters above the ground
  JUMP_VELOCITY: 20
};

export const ENTITY = {
  TYPE: {
    INANIMATE: 'INANIMATE',
    CREATURE: 'CREATURE'
  }
};

export const EVENT_TYPES = {
  DELETE_ENTITIY: 'ENTITIES_CONTAINER_DELETE_ENTITIY',
  DELETE_ENEMY: 'ENTITIES_CONTAINER_DELETE_ENEMY',
  ENEMY_SHOOT: 'ENTITIES_CONTAINER_ENEMY_SHOOT'
};
