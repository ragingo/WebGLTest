const DEFAULT_INPUT_VIDEO_WIDTH = 640;
const DEFAULT_INPUT_VIDEO_HEIGHT = 480;
const DEFAULT_INPUT_VIDEO_FRAMERATE = 30;

export class Camera {
  private stream: MediaStream | null = null;
  private videoTrackReader: any = {};
  private videoEncoder: any = {};
  private videoDecoder: any = {};
  private decodedFrameQueue: any[] = [];

  public consumeDecodedFrame() {
    return this.decodedFrameQueue.splice(0, 1)[0];
  }

  constructor(public readonly constrains: MediaStreamConstraints) {}

  public async open() {
    this.stream = await navigator.mediaDevices.getUserMedia(this.constrains);

    const tracks = this.stream.getVideoTracks();

    // @ts-ignore
    this.videoTrackReader = new VideoTrackReader(tracks[0]);

    // @ts-ignore
    this.videoDecoder = new VideoDecoder({
      output: async (frame: any) => {
        this.decodedFrameQueue.push(frame);
      },
      error: () => {}
    });

    this.videoDecoder.configure({
      codec: 'vp8',
      width: 512,
      height: 512,
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
      width: this.getInputVideoInfo()?.width ?? DEFAULT_INPUT_VIDEO_WIDTH,
      height: this.getInputVideoInfo()?.height ?? DEFAULT_INPUT_VIDEO_HEIGHT,
      framerate: this.getInputVideoInfo()?.frameRate ?? DEFAULT_INPUT_VIDEO_FRAMERATE,
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

  private getInputVideoInfo() {
    return this.isMediaTrackConstraints(this.constrains.video) ? this.constrains.video : undefined;
  }

  private isMediaTrackConstraints(obj: any): obj is MediaTrackConstraints {
    return typeof obj === 'object';
  }
}
