import { Renderer, Entity, System, RtcPool, SystemBuilder } from "@piggo-legends/core";

export type GameProps = {
  net?: RtcPool,
  renderer?: Renderer,
  entities?: Record<string, Entity>,
  systems?: System[]
  mode?: "cartesian" | "isometric"
}

export abstract class Game<T extends GameProps = GameProps> {
  net: RtcPool | undefined = undefined;
  renderer: Renderer | undefined = undefined;
  entities: Record<string, Entity> = {};
  systems: System[] = [];
  tick: number = 0;
  mode: "cartesian" | "isometric" = "cartesian";

  thisPlayerId = `player${(Math.random() * 100).toFixed(0)}`;

  constructor({ net, renderer, systems = [], mode = "cartesian" }: T) {
    this.net = net;
    this.renderer = renderer;
    this.systems = systems;
    this.mode = mode;

    // TODO need to add "catch up" logic for slow clients
    setInterval(this.onTick, 1000 / 30);
  }

  addEntity = (entity: Entity) => {
    this.entities[entity.id] = entity;
    return entity.id;
  }

  addEntities = (entities: Entity[]) => {
    entities.forEach((entity) => {
      this.addEntity(entity);
    });
  }

  removeEntity = (id: string) => {
    const entity = this.entities[id];
    if (entity) {
      delete this.entities[id];
      entity.components.renderable?.cleanup();
    }
  }

  addSystems = (systems: System[]) => {
    this.systems.push(...systems);
  }

  addSystemBuilders = (systemBuilders: SystemBuilder[]) => {
    systemBuilders.forEach((systemBuilder) => {
      this.systems.push(systemBuilder({ game: this, renderer: this.renderer, net: this.net, thisPlayerId: this.thisPlayerId, mode: this.mode }));
    });
  }

  filterEntitiesForSystem = (query: string[], entities: Entity[]): Entity[] => {
    return entities.filter((e) => {
      for (const componentType of query) {
        if (!Object.keys(e.components).includes(componentType)) return false;
      }
      return true;
    });
  }

  onTick = () => {
    this.tick += 1;

    this.systems?.forEach((system) => {
      system.componentTypeQuery ? system.onTick(this.filterEntitiesForSystem(system.componentTypeQuery, Object.values(this.entities))) : system.onTick([]);
    });
  }
}
