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

  constructor(private readonly cameraInit: CameraInit) {}

  public async open() {
    const constrains: MediaStreamConstraints = {};
    if (this.cameraInit.video.allow) {
      constrains.video = true;
    } else if (this.cameraInit.video.input) {
      constrains.video = {
        width: this.cameraInit.video.input.width,
        height: this.cameraInit.video.input.height,
        frameRate: this.cameraInit.video.input.frameRate,
      };
    }
    if (this.cameraInit.audio.allow) {
      constrains.audio = true;
    }

    this.stream = await navigator.mediaDevices.getUserMedia(constrains);

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
  }
}
