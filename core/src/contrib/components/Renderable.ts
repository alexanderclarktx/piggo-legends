import { AnimatedSprite, Assets, Container, SCALE_MODES } from "pixi.js";
import { Component, Entity, World, Renderer } from "@piggo-legends/core";

export type RenderableProps = {
  container?: (r: Renderer) => Promise<Container>
  children?: (r: Renderer) => Promise<Renderable[]>
  dynamic?: (c: Container, r: Renderable, e: Entity, w: World) => void
  position?: { x: number; y: number }
  zIndex?: number
  visible?: boolean
  scale?: number,
  anchor?: { x: number, y: number }
  color?: number
  scaleMode?: SCALE_MODES
  id?: string
  cacheAsBitmap?: boolean
  rotates?: boolean
  animations?: Record<string, AnimatedSprite>
  setup?: (r: Renderable) => Promise<void>
}

// TODO refactor and simplify how entities define renderables
export class Renderable extends Component<"renderable"> {
  type: "renderable" = "renderable";

  animations: Record<string, AnimatedSprite>;
  animation: AnimatedSprite | undefined;
  bufferedAnimation = ""
  activeAnimation = ""

  id: string;
  props: RenderableProps;
  c: Container = new Container();
  r: Renderable | undefined;
  renderer: Renderer | undefined;
  children: Renderable[] | undefined;

  constructor(props: RenderableProps) {
    super();
    this.animations = props.animations ?? {}
    this.props = { ...props, rotates: props.rotates ?? false }
  }

  loadTextures = async (file: string): Promise<Record<string, any>> => {
    return (await Assets.load(file)).textures;
  }

  setAnimation = (animationKey: string) => {
    if (Object.values(this.animations).length && this.animations[animationKey]) {
      this.bufferedAnimation = animationKey;
    }
  }

  setAnimationColor = (color: number) => {
    // set the animation speed and scale for each sprite
    Object.values(this.animations).forEach((animation: AnimatedSprite) => {
      animation.animationSpeed = 0.1;
      animation.scale.set(this.props.scale || 1);
      animation.anchor.set(this.props.anchor?.x ?? 0.5, this.props.anchor?.y ?? 0.5);
      animation.texture.baseTexture.scaleMode = this.props.scaleMode ?? SCALE_MODES.LINEAR;
      animation.tint = color;
    });
  }

  _init = async (renderer: Renderer | undefined) => {
    this.renderer = renderer;

    const { children, position, id, visible, cacheAsBitmap, container, zIndex, setup, color } = this.props;

    // add child container
    if (container && renderer) this.c = await container(renderer);

    // add children
    if (children && renderer) {
      const childRenderables = await children(renderer);
      this.children = childRenderables;

      // so hacky I can't believe it
      if (childRenderables.length === 1) {
        this.r = childRenderables[0];
        this.c = childRenderables[0].c;
        await childRenderables[0]._init(renderer);
      } else {
        childRenderables.forEach(async (child) => {
          await child._init(renderer);
          this.c.addChild(child.c);
        });
      }
    }

    // set position
    if (position) this.c.position.set(position.x, position.y);

    // set id
    this.id = id ?? "";

    // set interactive children false
    this.c.interactiveChildren = false;

    // set visible
    this.c.visible = visible ?? true;

    // set cacheAsBitmap
    this.c.cacheAsBitmap = cacheAsBitmap ?? false;

    // set container properties
    this.c.zIndex = zIndex || 0;
    this.c.sortableChildren = true;
    this.c.alpha = 1;
    this.c.children.forEach((child) => { child.alpha = 1 });

    if (setup) await setup(this);

    if (this.animations) this.setAnimationColor(color ?? 0xffffff)
  }

  // MUST be called to correctly destroy the object
  cleanup = () => {
    // remove from the renderer
    this.renderer?.app.stage.removeChild(this.c);

    // remove all event listeners
    this.c.removeAllListeners();

    this.c.visible = false;

    // remove from the world
    // this.c.destroy(); // TODO disabled because it breaks from collider debug
  }
}
