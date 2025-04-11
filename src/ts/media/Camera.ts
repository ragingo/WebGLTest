import { Graphics } from '../gfx/Graphics';

export type CameraInit = {
  video: {
    allow: boolean;
    input?: {
      width?: number;
      height?: number;
      frameRate?: number;
    };
    output?: {
      width?: number;
      height?: number;
      frameRate?: number;
    };
  };
  audio: {
    allow: boolean;
  };
};

export class Camera {
  private stream: MediaStream | null = null;
  private videoProcessor: MediaStreamTrackProcessor<VideoFrame> | null = null;
  private frameQueue: VideoFrame[] = [];

  #available = false;
  public get available() {
    return this.#available;
  }

  public consumeDecodedFrame() {
    return this.frameQueue.shift();
  }

  // https://html.spec.whatwg.org/multipage/imagebitmap-and-animations.html#imagebitmapoptions
  public async consumeDecodedFrameAsImageBitmap() {
    const frame = this.frameQueue.shift();
    if (!frame) {
      return;
    }

    const bmp = await createImageBitmap(frame, {
      resizeWidth: this.cameraInit.video.output?.width,
      resizeHeight: this.cameraInit.video.output?.height
    });

    frame.close();

    if (!bmp) {
      return;
    }

    return bmp;
  }

  public async consumeDecodedFrameAsTexture() {
    const bmp = await this.consumeDecodedFrameAsImageBitmap();
    if (!bmp) {
      return null;
    }

    const tex = Graphics.createTextureFromImage(bmp);
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
        return { success: false, reason: 'CAMERA_PERMISSION_ERROR' };
      }

      constrains.video = true;

      if (this.cameraInit.video.input) {
        constrains.video = {
          width: this.cameraInit.video.input.width,
          height: this.cameraInit.video.input.height,
          frameRate: this.cameraInit.video.input.frameRate
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
      return { success: false, reason: 'CAMERA_OPEN_ERROR' };
    }

    // 音を鳴らす
    if (constrains.audio) {
      const audioCtx = new AudioContext();
      const audioSrc = audioCtx.createMediaStreamSource(this.stream);
      audioSrc.connect(audioCtx.destination);
    }

    const tracks = this.stream.getVideoTracks();

    this.videoProcessor = new MediaStreamTrackProcessor({ track: tracks[0] });

    const writable = new WritableStream({
      write: (frame: VideoFrame) => {
        this.frameQueue.push(frame);
      },
      close: () => {
        this.#available = false;
      },
      abort: () => {
        this.#available = false;
      }
    });

    this.videoProcessor.readable.pipeTo(writable);

    this.#available = true;
    return { success: true };
  }
}
