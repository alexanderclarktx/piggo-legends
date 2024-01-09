import { Health, HealthBar, Position, Renderable } from "@piggo-legends/contrib";
import { Entity, SystemBuilder } from "@piggo-legends/core";

// GuiSystem displays gui elements
export const GuiSystem: SystemBuilder = ({ game, renderer, thisPlayerId, mode }) => {
  if (!renderer) throw new Error("ClickableSystem requires a renderer");

  let renderedEntities: Set<Entity> = new Set();

  const onTick = (entities: Entity<Health | Position | Renderable>[]) => {
    // handle old entities
    renderedEntities.forEach((entity) => {
      if (!game.entities[entity.id]) {
        game.removeEntity(`${entity.id}-health`);
        renderedEntities.delete(entity);
      }
    });

    // handle new entities
    entities.forEach((entity) => {
      const { health, position } = entity.components;
      if (health && position) {
        if (!renderedEntities.has(entity)) {
          healthbarForEntity(entity);
        }
      }
    });
  }

  const healthbarForEntity = (entity: Entity<Health | Position | Renderable>) => {
    if (entity.components.renderable) {
      const { health, position } = entity.components;

      game.addEntity({
        id: `${entity.id}-health`,
        components: {
          position: position,
          renderable: new Renderable({
            zIndex: 10,
            children: async () => [ new HealthBar({ health }) ],
          })
        }
      });

      renderedEntities.add(entity);
    }
  }

  return {
    componentTypeQuery: ["health", "position", "renderable"],
    onTick
  }
}
