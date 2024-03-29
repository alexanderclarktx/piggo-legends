import { Entity, LineWall, Position, Renderable, screenToWorld } from "@piggo-gg/core";
import { Graphics } from "pixi.js";

export type WallPoints = [number, number][];

export const FieldWall = (wallPoints: WallPoints): Entity => {
  const wallPointsWorld = wallPoints.map(([x, y]) => screenToWorld({ x, y })).map(({ x, y }) => [x, y]);

  return LineWall({ points: wallPointsWorld.flat() });
}

export const FieldGrass = (wallPoints: WallPoints) => Entity({
  id: "field",
  components: {
    position: new Position({ x: 0, y: 0 }),
    renderable: new Renderable({
      setup: async (r) => {

        // grass
        const grass = new Graphics();
        grass.setStrokeStyle({ width: 2, color: 0xffffff, alpha: 1 });
        grass.poly(wallPoints.flat());
        grass.fill(0x008833).stroke();

        // field lines
        const lines = new Graphics();
        lines.setStrokeStyle({ width: 2, color: 0xffffff, alpha: 1 });
        lines.setFillStyle({ alpha: 0, width: 0 })

        // center line
        lines.moveTo(50, 100);
        lines.lineTo(50, 600);

        // big circle
        lines.circle(50, 350, 75);

        // little circle
        lines.circle(49.5, 350, 2);

        // free kick line left
        lines.moveTo(-401, 208);
        lines.lineTo(-260, 208);
        lines.lineTo(-260, 492);
        lines.lineTo(-401, 492);

        // free kick line right
        lines.moveTo(502, 208);
        lines.lineTo(360, 208);
        lines.lineTo(360, 492);
        lines.lineTo(502, 492);

        // goalie line left
        // lines.moveTo(-401, 260);
        // lines.lineTo(-360, 260);
        // lines.lineTo(-360, 440);
        // lines.lineTo(-401, 440);

        // // goalie line right
        // lines.moveTo(502, 260);
        // lines.lineTo(460, 260);
        // lines.lineTo(460, 440);
        // lines.lineTo(502, 440);

        // free kick semicircle left
        lines.moveTo(-260, 400);
        lines.quadraticCurveTo(-210, 350, -260, 300);

        // free kick semicircle right
        lines.moveTo(360, 300);
        lines.quadraticCurveTo(310, 350, 360, 400);

        lines.stroke();

        r.c.addChild(grass);
        r.c.addChild(lines);
      },
    })
  }
})
