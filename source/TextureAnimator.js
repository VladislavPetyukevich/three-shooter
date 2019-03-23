import { RepeatWrapping } from 'three';

export default class TextureAnimator {
  constructor(texture, tilesHoriz, tilesVert, numTiles, tileDispDuration) {
    this.texture = texture;
    this.tilesHorizontal = tilesHoriz;
    this.tilesVertical = tilesVert;
    this.numberOfTiles = numTiles;
    this.texture.wrapS = texture.wrapT = RepeatWrapping;
    this.texture.repeat.set(1 / this.tilesHorizontal, 1 / this.tilesVertical);
    this.tileDisplayDuration = tileDispDuration;
    this.currentDisplayTime = 0;
    this.currentTile = 0;
  }

  update(delta) {
    this.currentDisplayTime += delta;
    if (this.currentDisplayTime >= this.tileDisplayDuration) {
      this.currentDisplayTime -= this.tileDisplayDuration;
      this.currentTile++;
      if (this.currentTile == this.numberOfTiles) {
        this.currentTile = 0;
      }
      const currentColumn = this.currentTile % this.tilesHorizontal;
      this.texture.offset.x = currentColumn / this.tilesHorizontal;
      const currentRow = Math.floor(this.currentTile / this.tilesHorizontal);
      this.texture.offset.y = currentRow / this.tilesVertical;
    }
  }
}
