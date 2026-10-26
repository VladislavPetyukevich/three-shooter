import {
  Audio,
  AudioListener,
} from 'three';
import { audioStoreMusic } from '@/core/loaders';
import { globalSettings } from '@/GlobalSettings';
import { MusicPlaylist } from './MusicPlaylist';
import { musicTracks } from '@/constantsAssets';

export interface MusicTrack {
  name: string;
  soundName: string;
  volume: number;
}

const fadeInDuration = 5;

export type MusicState = 'stopped' | 'playing' | 'paused' | 'fading_in';
export type PlaylistName = 'ambient' | 'combat';

export class BackgroundMusic {
  private audioListener: AudioListener;
  private currentAudio: Audio<GainNode> | null = null;
  private currentTrack: MusicTrack | null = null;
  private state: MusicState = 'stopped';
  private fadeStartTime: number = 0;
  private targetVolume: number = 0;
  private startVolume: number = 0;
  private fadeDuration: number = 0;
  private masterVolume: number = 1;
  private musicVolume: number = 1;
  private currentPlaylist: MusicPlaylist | null = null;
  private ambientPlaylist: MusicPlaylist;
  private combatPlaylist: MusicPlaylist;

  constructor(audioListener: AudioListener) {
    this.audioListener = audioListener;
    this.masterVolume = globalSettings.getSetting('audioVolume') || 1;
    this.musicVolume = globalSettings.getSetting('musicVolume') || 0.5;
    this.ambientPlaylist = new MusicPlaylist([musicTracks.ambient]);
    this.combatPlaylist = new MusicPlaylist([musicTracks.combat1, musicTracks.combat2]);

    // Listen for global settings changes
    globalSettings.addUpdateListener(this.onGlobalSettingsUpdate);
  }

  private onGlobalSettingsUpdate = () => {
    const newMasterVolume = globalSettings.getSetting('audioVolume') || 1;
    const newMusicVolume = globalSettings.getSetting('musicVolume') || 0.5;
    
    this.masterVolume = newMasterVolume;
    this.musicVolume = newMusicVolume;
    
    if (this.currentAudio && this.state === 'playing') {
      this.updateAudioVolume();
    }
  };

  private updateAudioVolume() {
    if (this.currentAudio && this.currentTrack) {
      const finalVolume = this.currentTrack.volume * this.musicVolume * this.masterVolume;
      this.currentAudio.setVolume(finalVolume);
    }
  }

  private getPlaylist(playlistName: PlaylistName): MusicPlaylist {
    switch (playlistName) {
      case 'ambient':
        return this.ambientPlaylist;
      default:
        return this.combatPlaylist;
    }
  }

  playPlaylist(playlistName: PlaylistName): void {
    const nextPlaylist = this.getPlaylist(playlistName);
    const track = nextPlaylist.getCurrentTrack();
    if (this.currentPlaylist && this.currentPlaylist !== nextPlaylist) {
      this.play(track);
    } else {
      this.play(track);
    }
    this.currentPlaylist = nextPlaylist;
  }

  private play(track: MusicTrack): void {
    if (this.currentAudio && this.state !== 'stopped') {
      this.stop();
    }

    // Load and setup new track
    this.currentTrack = track;
    this.currentAudio = new Audio(this.audioListener);

    const audioBuffer = audioStoreMusic.getSound(track.soundName);
    if (!audioBuffer) {
      console.warn(`Background music: Cannot load sound ${track.soundName}`);
      return;
    }

    this.currentAudio.setBuffer(audioBuffer);
    this.currentAudio.onEnded = () => {
      if (this.state !== 'playing') {
        return;
      }
      const track = this.currentPlaylist?.getNextTrack();
      if (track) {
        this.play(track);
      }
    };

    this.startFadeIn(fadeInDuration);

    this.currentAudio.play();
  }

  stop(): void {
    if (!this.currentAudio || this.state === 'stopped') {
      return;
    }

    this.currentAudio.stop();
    this.state = 'stopped';
    this.currentAudio = null;
    this.currentTrack = null;
  }

  pause(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.state = 'paused';
    }
  }

  resume(): void {
    if (this.currentAudio && this.state === 'paused') {
      this.updateAudioVolume();
      this.currentAudio.play();
      this.state = 'playing';
    }
  }

  private startFadeIn(duration: number): void {
    if (!this.currentAudio || !this.currentTrack) return;

    this.state = 'fading_in';
    this.fadeStartTime = performance.now();
    this.fadeDuration = duration * 1000; // Convert to milliseconds
    this.startVolume = 0;
    this.targetVolume = this.currentTrack.volume * this.musicVolume * this.masterVolume;
    this.currentAudio.setVolume(0);
  }

  update(): void {
    if (this.state === 'fading_in') {
      this.updateFade();
    }
  }

  private updateFade(): void {
    if (!this.currentAudio) return;

    const currentTime = performance.now();
    const elapsed = currentTime - this.fadeStartTime;
    const progress = Math.min(elapsed / this.fadeDuration, 1);

    // Use smooth easing for fade
    const easedProgress = this.easeInOutCubic(progress);
    const currentVolume = this.startVolume + (this.targetVolume - this.startVolume) * easedProgress;
    
    this.currentAudio.setVolume(currentVolume);

    if (progress >= 1) {
      if (this.state === 'fading_in') {
        this.state = 'playing';
      }
    }
  }

  private easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
  }

  getCurrentTrack(): MusicTrack | null {
    return this.currentTrack;
  }

  getState(): MusicState {
    return this.state;
  }

  isPlaying(): boolean {
    return this.state === 'playing' || this.state === 'fading_in';
  }

  setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    globalSettings.setSetting('musicVolume', this.musicVolume);
    this.updateAudioVolume();
  }

  getMusicVolume(): number {
    return this.musicVolume;
  }

  destroy(): void {
    this.stop();
    // Remove the global settings listener
    globalSettings.removeUpdateListener(this.onGlobalSettingsUpdate);
  }
}
