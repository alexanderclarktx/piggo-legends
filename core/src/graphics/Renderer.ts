import { Application, settings, SCALE_MODES, BaseTexture, utils, Text } from "pixi.js";
import { Camera, Renderable } from "@piggo-legends/core";

export type RendererProps = {
  canvas: HTMLCanvasElement;
  width?: number;
  height?: number;
}

// Renderer renders the game to a canvas
export class Renderer {
  props: RendererProps;

  app: Application;
  camera: Camera;
  events: utils.EventEmitter = new utils.EventEmitter();

  constructor(props: RendererProps) {
    this.props = props;

    // create the pixi.js application
    this.app = new Application({
      view: props.canvas,
      resolution: 1,
      autoDensity: true,
      backgroundColor: 0x6495ed,
      width: props.width ?? 800,
      height: props.height ?? 600,
      antialias: false,
      hello: true
    });

    // set up the camera
    this.camera = new Camera(this);
    this.camera.c.addChild(this.app.stage);
    this.app.stage = this.camera.c;

    // global texture settings
    settings.ROUND_PIXELS = false; // https://pixijs.download/release/docs/PIXI.settings.html#ROUND_PIXELS
    BaseTexture.defaultOptions.scaleMode = SCALE_MODES.LINEAR;

    // increase text resolution for readability
    Text.defaultResolution = 2;
    Text.defaultAutoResolution = false;

    // hide the cursor
    this.app.renderer.events.cursorStyles.default = "none";

    // handle screen resize
    window.addEventListener("resize", this.handleResize);

    // handle fullscreen change
    document.addEventListener("fullscreenchange", this.handleResize);

    // prevent right-click
    props.canvas.addEventListener("contextmenu", (event) => event.preventDefault());
  }

  // handle screen resize
  handleResize = () => {
    if (document.fullscreenElement) {
      this.app.renderer.resize(window.innerWidth, window.innerHeight);
    } else {
      const computedCanvasStyle = window.getComputedStyle(this.props.canvas);
      const width = Math.min(parseInt(computedCanvasStyle.width), this.props.width ?? 800);
      const height = Math.min(parseInt(computedCanvasStyle.height), this.props.height ?? 600);
      this.app.renderer.resize(width, height);
    }
  }

  // adds a Renderable to the pixi.js stage
  addWorld = (renderable: Renderable) => {
    this.camera.add(renderable);
  }
}