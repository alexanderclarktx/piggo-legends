import { Entity, SystemBuilder, Position, Renderable } from '@piggo-gg/core';

// RenderSystem handles rendering entities in isometric or cartesian space
export const RenderSystem: SystemBuilder<"RenderSystem"> = ({
  id: "RenderSystem",
  init: ({ renderer, mode, world }) => {
    if (!renderer) throw new Error("RendererSystem requires a renderer");

    let renderedEntities: Set<Entity<Renderable | Position>> = new Set();
    let cachedEntityPositions: Record<string, Position> = {};
    let centeredEntity: Entity<Renderable | Position> | undefined = undefined;

    renderer.app.ticker.add(() => {
      if (centeredEntity) {
        const p = centeredEntity.components.position;
        if (p) renderer.camera.moveTo(p.toScreenXY());
      }

      // update screenFixed entities
      renderedEntities.forEach((entity) => updateScreenFixed(entity));
    });

    const onTick = (entities: Entity<Renderable | Position>[]) => {

      // cleanup old entities
      renderedEntities.forEach((entity) => {
        if (!Object.keys(world.entities).includes(entity.id)) {
          renderedEntities.delete(entity);
          entity.components.renderable.cleanup();
        }
      });

      entities.forEach(async (entity) => {
        const { position, renderable, controlled } = entity.components;

        // add new entities to the renderer
        if (!renderedEntities.has(entity)) {
          renderedEntities.add(entity);
          await renderNewEntity(entity);
        }

        // track entity if controlled by player
        if (controlled && position && centeredEntity !== entity && controlled.data.entityId === world.clientPlayerId) {
          centeredEntity = entity;
        }

        // update renderable if position changed
        if (position && cachedEntityPositions[entity.id].serialize() !== position.serialize() && !position.screenFixed) {
          if (renderable.props.rotates) {
            renderable.c.rotation = position.data.rotation;
          }

          if (mode === "isometric") {
            const screenXY = position.toScreenXY();
            renderable.c.position.set(screenXY.x, screenXY.y);
          } else {
            renderable.c.position.set(position.data.x, position.data.y);
          }
          cachedEntityPositions[entity.id] = position;
        }

        // handle animations
        if (
          renderable.bufferedAnimation !== renderable.activeAnimation &&
          renderable.animations[renderable.bufferedAnimation]
        ) {
          // remove current animation
          if (renderable.animation) renderable.c.removeChild(renderable.animation);

          // set new animation
          renderable.animation = renderable.animations[renderable.bufferedAnimation];

          // add animation to container
          renderable.c.addChild(renderable.animation);

          // play the animation
          renderable.animation.play();

          // set activeAnimation
          renderable.activeAnimation = renderable.bufferedAnimation;
        }

        // run the dynamic callback
        if (renderable.props.dynamic) renderable.props.dynamic(renderable.c, renderable, entity, world);

        // run dynamic on children
        if (renderable.children) {
          renderable.children.forEach((child) => {
            if (child.props.dynamic) child.props.dynamic(child.c, child, entity, world);
          });
        }
      });

      // sort cachedEntityPositions by position (closeness to camera)
      const sortedEntityPositions = Object.keys(cachedEntityPositions).sort((a, b) => {
        const xDiff = cachedEntityPositions[a].data.x - cachedEntityPositions[b].data.x;
        const yDiff = cachedEntityPositions[a].data.y - cachedEntityPositions[b].data.y;
        return xDiff + yDiff;
      });

      // set zIndex
      Object.keys(cachedEntityPositions).forEach((entityId) => {
        const entity = world.entities[entityId];
        if (entity) {
          const renderable = entity.components.renderable;
          if (renderable) {
            renderable.c.zIndex = (renderable.props.zIndex ?? 2) + 0.0001 * sortedEntityPositions.indexOf(entityId);
          }
        }
      });
    }

    const renderNewEntity = async (entity: Entity<Renderable | Position>) => {
      const { renderable, position } = entity.components;

      if (position) {
        renderable.c.position.set(position.data.x, position.data.y);
        cachedEntityPositions[entity.id] = position;
      } else {
        renderable.c.position.set(0, 0);
      }

      await renderable._init(renderer);

      renderer.addWorld(renderable);
    }

    // updates the position of screenFixed entities
    const updateScreenFixed = (entity: Entity<Renderable | Position>) => {
      const { position, renderable } = entity.components;
      if (position.screenFixed) {

        if (position.data.x < 0) {
          renderable.c.x = renderer.app.screen.width + position.data.x - renderer.camera.c.x;
        } else {
          renderable.c.x = position.data.x - renderer.camera.c.x;
        }

        if (position.data.y < 0) {
          renderable.c.y = renderer.app.screen.height + position.data.y - renderer.camera.c.y;
        } else {
          renderable.c.y = position.data.y - renderer.camera.c.y;
        }
      }
    }

    return {
      id: "RenderSystem",
      query: ["renderable", "position"],
      onTick
    }
  }
});
