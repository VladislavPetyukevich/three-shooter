import { ENTITY_TYPE } from '@/constants';
import { randomNumbers } from '@/RandomNumbers';
import { Vector3 } from 'three';
import { ShootMark } from '../ShootMark/ShootMark';
import { ShootTrace } from '../ShootTrace/ShootTrace';
import { BehaviorProps, GunBehavior } from './GunBehavior';
import { GunRaycastProps } from './GunRaycast';

interface BehaviorRaycastProps extends BehaviorProps {
  maxEffectiveDistance: number;
  damage: GunRaycastProps['damage'];
}

export class GunBehaviorRaycast extends GunBehavior {
  maxEffectiveDistance: number;
  damage: GunRaycastProps['damage'];

  constructor(props: BehaviorRaycastProps) {
    super(props);
    this.maxEffectiveDistance = props.maxEffectiveDistance;
    this.damage = props.damage;
  }

  shoot() {
    if (this.isShoot) {
      return;
    }
    this.handleShoot();
    this.lastShootBulletClass = undefined;
    const bulletDirection = new Vector3(
      Math.sin(this.rotationY),
      0,
      Math.cos(this.rotationY)
    ).normalize();
    for (let i = this.bulletsPerShoot; i--;) {
      const bulletDirectionWithOffset = bulletDirection.clone();
      const angleOffset = this.getAngleOffset();
      this.setHorizontalRecoil(bulletDirectionWithOffset, angleOffset);

      this.raycaster.set(this.position, bulletDirectionWithOffset);
      const intersects = this.raycaster.intersectObjects(this.container.entitiesMeshes);

      for (let i = 0; i < intersects.length; i++) {
        const intersect = intersects[i];
        const intersectEntity = this.container.meshIdToEntity.get(intersect.object.id);
        if (
          !intersectEntity ||
          intersectEntity.isCollideTransparent
        ) {
          continue;
        }

        const shootTraceStartPos = new Vector3(
          this.holderMesh.position.x,
          0,
          this.holderMesh.position.z,
        );
        const shootTraceEndPos = new Vector3(
          intersect.point.x,
          intersect.point.y,
          intersect.point.z,
        );
        if (intersectEntity.type === ENTITY_TYPE.PLAYER) {
          shootTraceStartPos.setY(shootTraceEndPos.y);
          shootTraceEndPos.setY(0);
        }
        const shootTrace = new ShootTrace({
          startPos: shootTraceStartPos,
          endPos: shootTraceEndPos,
          rotationY: this.rotationY - angleOffset,
          container: this.container,
        });
        this.container.add(shootTrace);

        if (intersectEntity.type === ENTITY_TYPE.WALL) {
          const shootMark = new ShootMark({
            playerCamera: this.playerCamera,
            position: intersect.point,
            container: this.container
          });
          this.container.add(shootMark);
          break;
        }
        const maxDamage = randomNumbers.getRandomInRange(
          this.damage.min,
          this.damage.max
        );
        const damage = this.maxEffectiveDistance === 0 ?
          maxDamage :
          this.getDamage(intersect.distance, maxDamage);
        intersectEntity.onHit(damage, this.bulletAuthor);
        break;
      }
    }
  }

  getDamage(distance: number, maxDamage: number) {
    const damage = distance <= this.maxEffectiveDistance ?
      maxDamage :
      maxDamage / (distance - this.maxEffectiveDistance)
    return damage;
  }
}
