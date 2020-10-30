import { Graphics } from "../gfx/Graphics";

const DEFAULT_INPUT_VIDEO_WIDTH = 640;
const DEFAULT_INPUT_VIDEO_HEIGHT = 480;
const DEFAULT_INPUT_VIDEO_FRAMERATE = 30;

const MAX_DECODED_FRAME_QUEUE_SIZE = 100 * 1024 * 1024;

export type CameraInit = {
  video: {
    allow: boolean;
    input?: {
      width?: number;
      height?: number;
      frameRate?: number;
    },
    output?: {
      width?: number;
      height?: number;
      frameRate?: number;
    }
  },
  audio: {
    allow: boolean;
  }
};

export class Camera {
  private stream: MediaStream | null = null;
  private videoTrackReader: any | null = null;
  private videoEncoder: any | null = null;
  private videoDecoder: any | null = null;
  private decodedFrameQueue: any[] = [];

  #available = false;
  public get available() {
    return this.#available;
  }

  public consumeDecodedFrame() {
    return this.decodedFrameQueue.shift();
  }

  // https://html.spec.whatwg.org/multipage/imagebitmap-and-animations.html#imagebitmapoptions
  public async consumeDecodedFrameAsImageBitmap() {
    const frame = this.decodedFrameQueue.shift();
    if (!frame) {
      return;
    }

    const bmp = await frame.createImageBitmap({
      resizeWidth: this.cameraInit.video.output?.width ?? 512,
      resizeHeight: this.cameraInit.video.output?.height ?? 512
    }) as ImageBitmap;

    return bmp;
  }

  public async consumeDecodedFrameAsTexture(gl: WebGLRenderingContext) {
    const bmp = await this.consumeDecodedFrameAsImageBitmap();
    if (!bmp) {
      return null;
    }

    const tex = Graphics.createTextureFromImage(gl, bmp);
    bmp.close();

    if (!tex) {
      console.log('texture is null.');
      return null;
    }

    return tex;
  }

  constructor(private readonly cameraInit: CameraInit) {}

  public async open() {
    const constrains: MediaStreamConstraints = {};

    if (this.cameraInit.video.allow) {
      const status = await navigator.permissions.query({ name: 'camera' });
      if (status.state !== 'granted') {
        return false;
      }

      constrains.video = true;

      if (this.cameraInit.video.input) {
        constrains.video = {
          width: this.cameraInit.video.input.width,
          height: this.cameraInit.video.input.height,
          frameRate: this.cameraInit.video.input.frameRate,
        };
      }
    }

    if (this.cameraInit.audio.allow) {
      const status = await navigator.permissions.query({ name: 'microphone' });
      if (status.state === 'granted') {
        constrains.audio = true;
      }
    }

    try {
      this.stream = await navigator.mediaDevices.getUserMedia(constrains);
    } catch (e) {
      console.log(e);
      return false;
    }

    // 音を鳴らす
    if (constrains.audio) {
      const audioCtx = new AudioContext();
      const audioSrc = audioCtx.createMediaStreamSource(this.stream);
      audioSrc.connect(audioCtx.destination);
    }

    const tracks = this.stream.getVideoTracks();

    // @ts-ignore
    this.videoTrackReader = new VideoTrackReader(tracks[0]);

    // @ts-ignore
    this.videoDecoder = new VideoDecoder({
      output: async (frame: any) => {
        if (this.decodedFrameQueue.length === MAX_DECODED_FRAME_QUEUE_SIZE) {
          this.decodedFrameQueue.shift();
        }
        this.decodedFrameQueue.push(frame);
      },
      error: () => {}
    });

    this.videoDecoder.configure({
      codec: 'vp8',
      width: this.cameraInit.video.output?.width ?? 512,
      height: this.cameraInit.video.output?.height ?? 512
    });

    // @ts-ignore
    this.videoEncoder = new VideoEncoder({
      output: (chunk: any) => {
        this.videoDecoder.decode(chunk);
      },
      error: () => {}
    });

    await this.videoEncoder.configure({
      codec: 'vp8',
      width: this.cameraInit.video.input?.width ?? DEFAULT_INPUT_VIDEO_WIDTH,
      height: this.cameraInit.video.input?.height ?? DEFAULT_INPUT_VIDEO_HEIGHT,
      framerate: this.cameraInit.video.input?.frameRate ?? DEFAULT_INPUT_VIDEO_FRAMERATE,
    });

    this.videoTrackReader.start((frame: any) => {
      // NOTE: カメラ入力の width|height === frame.display(Width|Height)
      // frame.display(Width|Height) !== frame.coded(Width|Height) だとエラーになったからチェックしておく
      if (frame.codedWidth !== frame.displayWidth || frame.codedHeight !== frame.displayHeight) {
        return;
      }
      this.videoEncoder.encode(frame);
    });

    this.#available = true;
    return true;
  }
}
