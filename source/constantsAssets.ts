import spriteSheet from './assets/spritesheet.png';
import sfx from './assets/sfx.mp3';
import combatMusic from './assets/beat.mp3';
import ambientMusic from './assets/germany.mp3';
import { ImagesInfo } from '@/SpriteSheetLoader';
import { SliceInfo } from './core/AudioSlices';
import { MusicTrack } from './core/BackgroundMusic';

export { spriteSheet };

export const spriteCellSize = 64;

export const gameTextures: ImagesInfo = {
  wallTextureFile: { x: 0, y: 3, },
  wallApathyTextureFile: { x: 0, y: 24, },
  wallCowardiceTextureFile: { x: 1, y: 14, },
  wallSPTextureFile: { x: 1, y: 17, },
  wallDecal1TextureFile: { x: 0, y: 5, },
  wallDecal2TextureFile: { x: 0, y: 6, },
  wallDecal3TextureFile: { x: 1, y: 6, },
  doorTextureFile: { x: 1, y: 11, },
  floorTextureFile: { x: 1, y: 3, },
  gunTextureFile: { x: 0, y: 7, },
  gunFireFile: { x: 1, y: 7, },
  machinegunTextureFile: { x: 0, y: 8, },
  machinegunFireFile: { x: 1, y: 8, },
  boomerangTextureFile: { x: 0, y: 9, },
  boomerangFireTextureFile: { x: 1, y: 9, },
  enemyCommandoWalk1: { x: 0, y: 0, },
  enemyCommandoWalk2: { x: 1, y: 0, },
  enemyCommandoWalk3: { x: 0, y: 1, },
  enemyCommandoWalk4: { x: 1, y: 1, },
  enemyCommandoHurt: { x: 0, y: 2, },
  enemyCommandoDeath1: { x: 0, y: 18, },
  enemyCommandoDeath2: { x: 1, y: 18, },
  enemyCommandoDeath3: { x: 0, y: 19, },
  enemyCommandoDeath4: { x: 1, y: 19, },
  enemyCommandoAttack: { x: 0, y: 25, },
  enemySlayerWalk1: { x: 0, y: 12, },
  enemySlayerWalk2: { x: 1, y: 12, },
  enemySlayerWalk3: { x: 0, y: 13, },
  enemySlayerWalk4: { x: 1, y: 13, },
  enemySlayerHurt: { x: 0, y: 14, },
  enemySlayerDeath1: { x: 0, y: 20, },
  enemySlayerDeath2: { x: 1, y: 20, },
  enemySlayerDeath3: { x: 0, y: 21, },
  enemySlayerDeath4: { x: 1, y: 21, },
  enemySlayerAttack: { x: 1, y: 25, },
  enemyZombieWalk1: { x: 0, y: 15, },
  enemyZombieWalk2: { x: 1, y: 15, },
  enemyZombieWalk3: { x: 0, y: 16, },
  enemyZombieWalk4: { x: 1, y: 16, },
  enemyZombieHurt: { x: 0, y: 17, },
  enemyZombieDeath1: { x: 0, y: 22, },
  enemyZombieDeath2: { x: 1, y: 22, },
  enemyZombieDeath3: { x: 0, y: 23, },
  enemyZombieDeath4: { x: 1, y: 23, },
  enemyZombieAttack: { x: 0, y: 26, },
  enemyFlyguyWalk1: { x: 0, y: 27, },
  enemyFlyguyWalk2: { x: 1, y: 27, },
  enemyFlyguyWalk3: { x: 0, y: 28, },
  enemyFlyguyWalk4: { x: 1, y: 28, },
  enemyFlyguyDeath1: { x: 0, y: 29, },
  enemyFlyguyDeath2: { x: 1, y: 29, },
  enemyFlyguyDeath3: { x: 0, y: 30, },
  enemyFlyguyDeath4: { x: 1, y: 30, },
  enemyFlyguyHurt: { x: 0, y: 31, },
  enemyFlyguyAttack: { x: 1, y: 31, },
  enemyTankWalk1: { x: 0, y: 32, },
  enemyTankWalk2: { x: 1, y: 32, },
  enemyTankWalk3: { x: 0, y: 33, },
  enemyTankWalk4: { x: 1, y: 33, },
  enemyTankDeath1: { x: 0, y: 34, },
  enemyTankDeath2: { x: 1, y: 34, },
  enemyTankDeath3: { x: 0, y: 35, },
  enemyTankDeath4: { x: 1, y: 35, },
  enemyTankHurt: { x: 0, y: 36, },
  enemyTankAttack: { x: 1, y: 36, },
  enemySoldierWalk1: { x: 0, y: 37, },
  enemySoldierWalk2: { x: 1, y: 37, },
  enemySoldierWalk3: { x: 0, y: 38, },
  enemySoldierWalk4: { x: 1, y: 38, },
  enemySoldierDeath1: { x: 0, y: 39, },
  enemySoldierDeath2: { x: 1, y: 39, },
  enemySoldierDeath3: { x: 0, y: 40, },
  enemySoldierDeath4: { x: 1, y: 40, },
  enemySoldierHurt: { x: 0, y: 41, },
  enemySoldierAttack: { x: 1, y: 41, },
  shootMark1: { x: 1, y: 4, },
  shootMark2: { x: 1, y: 2, },
  torch: { x: 0, y: 10, },
  torchFire1: { x: 0, y: 11, },
  torchFire2: { x: 1, y: 10, },
  fireFlare: { x: 1, y: 4, },
  fireFlareAlpha: { x: 1, y: 5, },
  skybox: { x: 0, y: 4, },
};

export const gameSounds = {
  sfx,
  combatMusic,
  ambientMusic,
};

export const gameSoundsMusic = {
  combatMusic,
  ambientMusic,
};

const playerAudioVolume = 0.2;
const enemyAudioVolume = 0.4;

export type AudioSliceName =
  'damage' |
  'shootShotgun' |
  'shootMachinegun' |
  'spawn' |
  'walk' |
  'hit';

export const gameAudioSlices: Record<AudioSliceName, SliceInfo> = {
  damage: {
    soundName: 'sfx',
    start: 0.05, end: 0.20, volume: playerAudioVolume,
  },
  shootShotgun: {
    soundName: 'sfx',
    start: 0.23, end: 0.48, volume: playerAudioVolume,
  },
  shootMachinegun: {
    soundName: 'sfx',
    start: 0.49, end: 0.62, volume: playerAudioVolume,
  },
  spawn: {
    soundName: 'sfx',
    start: 0.66, end: 0.94, volume: enemyAudioVolume,
  },
  walk: {
    soundName: 'sfx',
    start: 0.96, end: 7.34, volume: playerAudioVolume,
  },
  hit: {
    soundName: 'sfx',
    start: 7.36, end: 7.40, volume: playerAudioVolume,
  },
};

export interface EnemyTexturesSet {
  walk1: keyof typeof gameTextures;
  walk2: keyof typeof gameTextures;
  walk3: keyof typeof gameTextures;
  walk4: keyof typeof gameTextures;
  hurt: keyof typeof gameTextures;
  death1: keyof typeof gameTextures;
  death2: keyof typeof gameTextures;
  death3: keyof typeof gameTextures;
  death4: keyof typeof gameTextures;
  attack: keyof typeof gameTextures;
}

interface EnemyTextures {
  Commando: EnemyTexturesSet;
  Slayer: EnemyTexturesSet;
  Zombie: EnemyTexturesSet;
  Flyguy: EnemyTexturesSet;
  Tank: EnemyTexturesSet;
  Soldier: EnemyTexturesSet;
}

export const ENEMY_TEXTURES: EnemyTextures = {
  Commando: {
    walk1: 'enemyCommandoWalk1',
    walk2: 'enemyCommandoWalk2',
    walk3: 'enemyCommandoWalk3',
    walk4: 'enemyCommandoWalk4',
    hurt: 'enemyCommandoHurt',
    death1: 'enemyCommandoDeath1',
    death2: 'enemyCommandoDeath2',
    death3: 'enemyCommandoDeath3',
    death4: 'enemyCommandoDeath4',
    attack: 'enemyCommandoAttack',
  },
  Slayer: {
    walk1: 'enemySlayerWalk1',
    walk2: 'enemySlayerWalk2',
    walk3: 'enemySlayerWalk3',
    walk4: 'enemySlayerWalk4',
    hurt: 'enemySlayerHurt',
    death1: 'enemySlayerDeath1',
    death2: 'enemySlayerDeath2',
    death3: 'enemySlayerDeath3',
    death4: 'enemySlayerDeath4',
    attack: 'enemySlayerAttack',
  },
  Zombie: {
    walk1: 'enemyZombieWalk1',
    walk2: 'enemyZombieWalk2',
    walk3: 'enemyZombieWalk3',
    walk4: 'enemyZombieWalk4',
    hurt: 'enemyZombieHurt',
    death1: 'enemyZombieDeath1',
    death2: 'enemyZombieDeath2',
    death3: 'enemyZombieDeath3',
    death4: 'enemyZombieDeath4',
    attack: 'enemyZombieAttack',
  },
  Flyguy: {
    walk1: 'enemyFlyguyWalk1',
    walk2: 'enemyFlyguyWalk2',
    walk3: 'enemyFlyguyWalk3',
    walk4: 'enemyFlyguyWalk4',
    hurt: 'enemyFlyguyHurt',
    death1: 'enemyFlyguyDeath1',
    death2: 'enemyFlyguyDeath2',
    death3: 'enemyFlyguyDeath3',
    death4: 'enemyFlyguyDeath4',
    attack: 'enemyFlyguyAttack',
  },
  Tank: {
    walk1: 'enemyTankWalk1',
    walk2: 'enemyTankWalk2',
    walk3: 'enemyTankWalk3',
    walk4: 'enemyTankWalk4',
    hurt: 'enemyTankHurt',
    death1: 'enemyTankDeath1',
    death2: 'enemyTankDeath2',
    death3: 'enemyTankDeath3',
    death4: 'enemyTankDeath4',
    attack: 'enemyTankAttack',
  },
  Soldier: {
    walk1: 'enemySoldierWalk1',
    walk2: 'enemySoldierWalk2',
    walk3: 'enemySoldierWalk3',
    walk4: 'enemySoldierWalk4',
    hurt: 'enemySoldierHurt',
    death1: 'enemySoldierDeath1',
    death2: 'enemySoldierDeath2',
    death3: 'enemySoldierDeath3',
    death4: 'enemySoldierDeath4',
    attack: 'enemySoldierAttack',
  },
};

export type MusicTrackName = 
  'combat' | 
  'ambient';

export const musicTracks: Record<MusicTrackName, MusicTrack> = {
  combat: {
    name: 'combat',
    soundName: 'combatMusic',
    volume: 0.5,
    loop: true,
    fadeInDuration: 5,
    fadeOutDuration: 5,
  },
  ambient: {
    name: 'ambient',
    soundName: 'ambientMusic',
    volume: 0.5,
    loop: true,
    fadeInDuration: 5,
    fadeOutDuration: 5,
  },
};
