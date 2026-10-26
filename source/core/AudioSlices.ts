import {
  Audio,
  AudioListener,
} from 'three';
import { audioStoreSfx } from '@/core/loaders';

export interface SliceInfo {
  soundName: string;
  start: number;
  end: number;
  volume: number;
}

export type SlicesInfo = Record<string, SliceInfo>;

export class AudioSlices<SliceName extends string> {
  audioListener: AudioListener;
  slicesInfo: Record<SliceName, SliceInfo>;

  constructor(audioListener: AudioListener, slicesInfo: Record<SliceName, SliceInfo>) {
    this.audioListener = audioListener;
    this.slicesInfo = slicesInfo;
  }

  loadSliceToAudio(audioName: SliceName, audio: Audio<GainNode | PannerNode>) {
    const sliceInfo = this.slicesInfo[audioName];
    audio.setBuffer(audioStoreSfx.getSound(sliceInfo.soundName));
    audio.offset = sliceInfo.start;
    audio.duration = sliceInfo.end - sliceInfo.start;
    audio.setVolume(sliceInfo.volume);
  }
}
