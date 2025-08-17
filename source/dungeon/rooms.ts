import { RoomConstructor } from './DungeonRoom';

export const roomsCells: RoomConstructor['cells'][] = [
  [
    {
      "position": {
        "x": 5,
        "y": 1
      },
      "type": 1,
      "mini": false
    },
    {
      "position": {
        "x": 5,
        "y": 2
      },
      "type": 1,
      "mini": false
    },
    {
      "position": {
        "x": 5,
        "y": 3
      },
      "type": 1,
      "mini": false
    },
    {
      "position": {
        "x": 15,
        "y": 1
      },
      "type": 1,
      "mini": false
    },
    {
      "position": {
        "x": 15,
        "y": 2
      },
      "type": 1,
      "mini": false
    },
    {
      "position": {
        "x": 15,
        "y": 3
      },
      "type": 1,
      "mini": false
    },
    {
      "position": {
        "x": 5,
        "y": 4
      },
      "type": 1,
      "mini": false
    },
    {
      "position": {
        "x": 15,
        "y": 4
      },
      "type": 1,
      "mini": false
    },
    {
      "position": {
        "x": 8,
        "y": 2
      },
      "type": 0,
      "kind": 4
    },
    {
      "position": {
        "x": 12,
        "y": 2
      },
      "type": 0,
      "kind": 4
    },
    {
      "position": {
        "x": 5,
        "y": 5
      },
      "type": 1,
      "mini": false
    },
    {
      "position": {
        "x": 15,
        "y": 5
      },
      "type": 1,
      "mini": false
    },
    {
      "position": {
        "x": 6,
        "y": 5
      },
      "type": 2,
      "mini": false,
      "tag": "doorForEnemy1"
    },
    {
      "position": {
        "x": 7,
        "y": 5
      },
      "type": 2,
      "mini": false,
      "tag": "doorForEnemy1"
    },
    {
      "position": {
        "x": 8,
        "y": 5
      },
      "type": 2,
      "mini": false,
      "tag": "doorForEnemy1"
    },
    {
      "position": {
        "x": 9,
        "y": 5
      },
      "type": 2,
      "mini": false,
      "tag": "doorForEnemy1"
    },
    {
      "position": {
        "x": 10,
        "y": 5
      },
      "type": 2,
      "mini": false,
      "tag": "doorForEnemy1"
    },
    {
      "position": {
        "x": 11,
        "y": 5
      },
      "type": 2,
      "mini": false,
      "tag": "doorForEnemy1"
    },
    {
      "position": {
        "x": 12,
        "y": 5
      },
      "type": 2,
      "mini": false,
      "tag": "doorForEnemy1"
    },
    {
      "position": {
        "x": 13,
        "y": 5
      },
      "type": 2,
      "mini": false,
      "tag": "doorForEnemy1"
    },
    {
      "position": {
        "x": 14,
        "y": 5
      },
      "type": 2,
      "mini": false,
      "tag": "doorForEnemy1"
    },
    {
      "position": {
        "x": 7,
        "y": 8
      },
      "type": 0,
      "kind": 0,
      "tag": "enemyForDoor1",
      "event": {
        "type": 0,
        "targetEntityTag": "doorForEnemy1"
      }
    },
    {
      "position": {
        "x": 13,
        "y": 8
      },
      "type": 0,
      "kind": 0,
      "tag": "enemyForDoor1",
      "event": {
        "type": 0,
        "targetEntityTag": "doorForEnemy1"
      }
    }
  ], [
    { position: {x: 3,y: 10}, type: 0, kind: 0 },
    { position: {x: 9,y: 3}, type: 0, kind: 0 },
    { position: {x: 10,y: 15}, type: 0, kind: 0 },
    { position: {x: 16,y: 9}, type: 0, kind: 0 },

    { position: {x: 3,y: 3}, type: 1, mini: false, },
    { position: {x: 3,y: 16}, type: 1, mini: false, },
    { position: {x: 5,y: 5}, type: 1, mini: false, },
    { position: {x: 5,y: 14}, type: 1, mini: false, },
    { position: {x: 7,y: 7}, type: 1, mini: false, },
    { position: {x: 7,y: 8}, type: 1, mini: false, },
    { position: {x: 7,y: 11}, type: 1, mini: false, },
    { position: {x: 7,y: 12}, type: 1, mini: false, },
    { position: {x: 8,y: 7}, type: 1, mini: false, },
    { position: {x: 11,y: 7}, type: 1, mini: false, },
    { position: {x: 11,y: 12}, type: 1, mini: false, },
    { position: {x: 12,y: 7}, type: 1, mini: false, },
    { position: {x: 12,y: 8}, type: 1, mini: false, },
    { position: {x: 12,y: 11}, type: 1, mini: false, },
    { position: {x: 12,y: 12}, type: 1, mini: false, },
    { position: {x: 14,y: 5}, type: 1, mini: false, },
    { position: {x: 14,y: 14}, type: 1, mini: false, },
    { position: {x: 16,y: 3}, type: 1, mini: false, },
    { position: {x: 16,y: 16}, type: 1, mini: false, },
  ],
  [
    {
      "position": {
        "x": 4,
        "y": 3
      },
      "type": 0,
      "kind": 0
    },
    {
      "position": {
        "x": 13,
        "y": 3
      },
      "type": 0,
      "kind": 0
    },
    {
      "position": {
        "x": 5,
        "y": 5
      },
      "type": 0,
      "kind": 1
    },
    {
      "position": {
        "x": 12,
        "y": 5
      },
      "type": 0,
      "kind": 1
    },
    {
      "position": {
        "x": 8,
        "y": 7
      },
      "type": 0,
      "kind": 2
    },
    {
      "position": {
        "x": 6,
        "y": 11
      },
      "type": 1,
      "mini": true
    },
    {
      "position": {
        "x": 7,
        "y": 11
      },
      "type": 1,
      "mini": true
    },
    {
      "position": {
        "x": 8,
        "y": 11
      },
      "type": 1,
      "mini": true
    },
    {
      "position": {
        "x": 9,
        "y": 11
      },
      "type": 1,
      "mini": true
    },
    {
      "position": {
        "x": 10,
        "y": 11
      },
      "type": 1,
      "mini": true
    },
    {
      "position": {
        "x": 11,
        "y": 11
      },
      "type": 1,
      "mini": true
    },
    {
      "position": {
        "x": 12,
        "y": 11
      },
      "type": 1,
      "mini": true
    }
  ]
];
