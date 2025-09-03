import {
  Audio,
  AudioListener,
} from 'three';
import { audioStoreMusic } from '@/core/loaders';
import { globalSettings } from '@/GlobalSettings';

export interface MusicTrack {
  name: string;
  soundName: string;
  volume: number;
  loop: boolean;
  fadeInDuration?: number;
  fadeOutDuration?: number;
}

export type MusicState = 'stopped' | 'playing' | 'paused' | 'fading_in' | 'fading_out';

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

  constructor(audioListener: AudioListener) {
    this.audioListener = audioListener;
    this.masterVolume = globalSettings.getSetting('audioVolume') || 1;
    this.musicVolume = globalSettings.getSetting('musicVolume') || 0.5;
    
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

  play(track: MusicTrack): void {
    // If same track is already playing, do nothing
    if (this.currentTrack && this.currentTrack.name === track.name && this.state === 'playing') {
      return;
    }

    // Stop current track if playing
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
    this.currentAudio.setLoop(track.loop);
    
    // Setup fade in if specified
    if (track.fadeInDuration && track.fadeInDuration > 0) {
      this.startFadeIn(track.fadeInDuration);
    } else {
      this.currentAudio.setVolume(track.volume * this.musicVolume * this.masterVolume);
      this.state = 'playing';
    }

    this.currentAudio.play();
  }

  stop(fadeOutDuration?: number): void {
    if (!this.currentAudio || this.state === 'stopped') {
      return;
    }

    if (fadeOutDuration && fadeOutDuration > 0) {
      this.startFadeOut(fadeOutDuration);
    } else {
      this.currentAudio.stop();
      this.state = 'stopped';
      this.currentAudio = null;
      this.currentTrack = null;
    }
  }

  pause(): void {
    if (this.currentAudio && this.state === 'playing') {
      this.currentAudio.pause();
      this.state = 'paused';
    }
  }

  resume(): void {
    if (this.currentAudio && this.state === 'paused') {
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

  private startFadeOut(duration: number): void {
    if (!this.currentAudio || !this.currentTrack) return;

    this.state = 'fading_out';
    this.fadeStartTime = performance.now();
    this.fadeDuration = duration * 1000; // Convert to milliseconds
    this.startVolume = this.currentAudio.getVolume();
    this.targetVolume = 0;
  }

  update(): void {
    if (this.state === 'fading_in' || this.state === 'fading_out') {
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
      } else if (this.state === 'fading_out') {
        this.currentAudio.stop();
        this.state = 'stopped';
        this.currentAudio = null;
        this.currentTrack = null;
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

  // Utility method to crossfade between tracks
  crossfade(newTrack: MusicTrack, crossfadeDuration: number = 2): void {
    if (this.currentAudio && this.state === 'playing') {
      // Fade out current track
      this.stop(crossfadeDuration);
      
      // Start new track after a short delay to create overlap
      setTimeout(() => {
        const trackWithFade = { ...newTrack, fadeInDuration: crossfadeDuration };
        this.play(trackWithFade);
      }, crossfadeDuration * 500); // Start halfway through fade out
    } else {
      this.play(newTrack);
    }
  }

  destroy(): void {
    this.stop();
    // Remove the global settings listener
    globalSettings.removeUpdateListener(this.onGlobalSettingsUpdate);
  }
}
