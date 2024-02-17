import { ColliderRJS, DebugBounds, Entity, FpsText, Position, Renderable, SystemBuilder, TextBox, physics, worldToScreen } from "@piggo-legends/core";
import { Graphics, Text } from 'pixi.js';

// DebugSystem adds visual debug information to renderered entities
export const DebugSystem: SystemBuilder = ({ world }) => {

  let debugRenderables: Renderable[] = [];
  let debugEntitiesPerEntity: Record<string, Entity<Renderable | Position>[]> = {};

  const onTick = (entities: Entity<Position>[]) => {
    if (world.debug) {
      // handle new entities
      entities.forEach((entity) => {
        const { renderable, colliderRJS } = entity.components;

        if (!debugEntitiesPerEntity[entity.id] || !debugEntitiesPerEntity[entity.id].length) {
          debugEntitiesPerEntity[entity.id] = [];
          if (renderable) addEntityForRenderable(entity as Entity<Renderable | Position>);
          // if (colliderRJS) addEntityForCollider(entity as Entity<ColliderRJS | Position>);
        }
      });

      // draw all colliders
      if (!world.entities["collider-debug"]) drawAllColliders();

      // draw the fps text
      if (!world.entities["fpsText"]) drawFpsText();

      // update all debug entities
      Object.entries(debugEntitiesPerEntity).forEach(([id, debugEntities]) => {
        const entity = world.entities[id] as Entity<Position>;
        if (entity) {
          // update debug entity positions
          debugEntities.forEach((debugEntity) => {
            debugEntity.components.position = entity.components.position;
          });
        } else {
          // handle old entities
          debugEntities.forEach((debugEntity) => {
            world.removeEntity(debugEntity.id);
            delete debugEntitiesPerEntity[id];
          });
        }
      });
    } else {
      // remove all debug entities
      Object.values(debugEntitiesPerEntity).forEach((debugEntities) => {
        debugEntities.forEach((debugEntity) => world.removeEntity(debugEntity.id));
      });
      debugEntitiesPerEntity = {};

      // clear debug renderables
      debugRenderables = [];
    }
  }

  const addEntityForRenderable = (entity: Entity<Renderable | Position>) => {
    const {renderable, position} = entity.components;

    // text box
    const textBox = new TextBox({
      dynamic: (c: Text) => {
        if (renderable && position) {
          const bounds = renderable.c.getLocalBounds();
          c.position.set(bounds.x, bounds.top - 25);
          c.text = debugText(position, renderable);
        }
      },
      fontSize: 12, color: 0xffff00
    });

    // debug bounds
    const debugBounds = new DebugBounds({ debugRenderable: renderable });

    const debugEntity = {
      id: `${entity.id}-renderable-debug`,
      components: {
        position: new Position(),
        renderable: new Renderable({
          zIndex: 2,
          children: async () => [textBox, debugBounds]
        })
      }
    };

    debugEntitiesPerEntity[entity.id].push(debugEntity);
    world.addEntity(debugEntity);
    debugRenderables.push(textBox, debugBounds);
  }

  const drawFpsText = () => {
    const fpsText = FpsText();
    world.addEntity(fpsText);
    debugEntitiesPerEntity["fpsText"] = [fpsText];
  }

  const drawAllColliders = () => {

    const r = new Renderable({
      dynamic: (c: Graphics) => {
        if (c.clear) {
          c.clear()
          c.beginFill(0xffffff, 0.1).lineStyle(1, 0xffffff);
          const { vertices } = physics.debugRender();

          for (let i = 0; i < vertices.length; i += 4) {
            // use worldToScreen to convert the vertices to screen space
            const one = worldToScreen({ x: vertices[i], y: vertices[i + 1] });
            const two = worldToScreen({ x: vertices[i + 2], y: vertices[i + 3] });
            c.moveTo(one.x, one.y);
            c.lineTo(two.x, two.y);
          }
        }
      },
      zIndex: 5,
      container: async () => new Graphics()
    });

    const debugEntity = {
      id: `collider-debug`,
      components: {
        position: new Position(),
        renderable: r
      }
    }

    world.addEntity(debugEntity);
    debugRenderables.push(r);
    debugEntitiesPerEntity["collider-debug"] = [debugEntity];
  }

  const addEntityForCollider = (entity: Entity<ColliderRJS | Position>) => {
    const { colliderRJS, position } = entity.components

    const r = new Renderable({
      dynamic: (c: Graphics) => {
        if (c.clear) c.clear().beginFill(0xffffff, 0.1).lineStyle(1, 0xffffff);
      },
      zIndex: 5,
      container: async () => new Graphics()
    })

    const debugEntity = {
      id: `${entity.id}-collider-debug`,
      components: {
        position: new Position(),
        renderable: r
      }
    }
    debugEntitiesPerEntity[entity.id].push(debugEntity);
    world.addEntity(debugEntity);
    debugRenderables.push(r);
  }

  const debugText = (p: Position, r: Renderable) => `${p.data.x.toFixed(0)} | ${p.data.y.toFixed(0)}`;

  return {
    id: "DebugSystem",
    query: ["debug", "position"],
    onTick,
    skipOnRollback: true
  }
}
