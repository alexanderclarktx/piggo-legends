import { Component, Entity, World } from "@piggo-legends/core";
import { Collider as RapierCollider, ColliderDesc, RigidBody, RigidBodyDesc } from "@dimforge/rapier2d-compat";

export type ColliderProps = {
  radius?: number
  length?: number
  width?: number
  isStatic?: boolean
  frictionAir?: number
  mass?: number // default mass seems to be 100
  restitution?: number
  rotation?: number
  sensor?: (e2: Entity, world: World) => void
}

export class Collider extends Component<"collider"> {
  type: "collider" = "collider";
  bodyDesc: RigidBodyDesc;
  colliderDesc: ColliderDesc;
  rapierCollider: RapierCollider;
  body: RigidBody;
  sensor: (e2: Entity, world: World) => void

  constructor({ radius, length, width, isStatic, frictionAir, mass, restitution, sensor, rotation }: ColliderProps) {
    super();

    if (isStatic) {
      this.bodyDesc = RigidBodyDesc.fixed();
    } else {
      this.bodyDesc = RigidBodyDesc.dynamic();
    }

    if (radius) {
      this.colliderDesc = ColliderDesc.ball(radius)
    } else {
      this.colliderDesc = ColliderDesc.cuboid(length ?? 1, width ?? 1);
    }

    if (sensor) {
      this.colliderDesc.setSensor(true);
      this.sensor = sensor;
    }

    if (mass) this.colliderDesc.setMass(mass);
    if (restitution) this.colliderDesc.setRestitution(restitution);
    if (rotation) this.colliderDesc.setRotation(rotation);

    this.bodyDesc.setLinearDamping(frictionAir ?? 0);
  }
}
