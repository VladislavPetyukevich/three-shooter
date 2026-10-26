import { MusicTrack } from './BackgroundMusic';

export class MusicPlaylist {
  tracks: MusicTrack[];
  currentTrackIndex: number;

  constructor(tracks: MusicTrack[]) {
    this.tracks = tracks;
    this.currentTrackIndex = 0;
    this.shuffle();
  }

  getNextTrack(): MusicTrack {
    this.currentTrackIndex++;
    if (this.currentTrackIndex >= this.tracks.length) {
      this.currentTrackIndex = 0;
    }
    return this.tracks[this.currentTrackIndex];
  }

  getCurrentTrack(): MusicTrack {
    return this.tracks[this.currentTrackIndex];
  }

  private shuffle(): void {
    let currentIndex = this.tracks.length;

    while (currentIndex != 0) {
      const randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      [
        this.tracks[currentIndex],
        this.tracks[randomIndex]
      ] = [
        this.tracks[randomIndex],
        this.tracks[currentIndex]
      ];
    }
  }
}
