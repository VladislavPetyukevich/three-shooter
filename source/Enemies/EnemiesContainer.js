export default class EnemyContainer {
  constructor(scene, world) {
    this.scene = scene;
    this.world = world;
    this.enemies = [];
  }

  add(enemy) {
    enemy.body.addEventListener("collide", event => {
      if (event.body.isBullet) {
        event.target._hp--;
      }
    });
    this.enemies.push(enemy);
    this.world.addBody(enemy.body);
    this.scene.add(enemy.mesh);
  }

  deleteEnemyByUuid(uuid) {
    const enemies = this.enemies;
    for (var i = enemies.length; i--;) {
      const enemy = enemies[i];
      if (enemy.mesh.uuid === uuid) {
        this.enemies.splice(i, 1);
        return;
      }
    }
  }

  update() {
    this.enemies.forEach(enemy => enemy.update());
    const enemiesToDelete = this.enemies.filter(enemy => enemy.body._hp <= 0);
    enemiesToDelete.forEach(enemy => {
      this.scene.remove(enemy.mesh);
      this.world.remove(enemy.body);
      this.deleteEnemyByUuid(enemy.mesh.uuid);
    });
  }
}
