export class Camera {
  private stream: MediaStream | null = null;
  private videoTrackReader: any = {};
  private videoEncoder: any = {};
  private videoDecoder: any = {};
  private decodedFrameQueue: any[] = [];

  public getDecodedFrame() {
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
      width: 640,
      height: 480,
      framerate: 30
    });

    this.videoTrackReader.start((frame: any) => {
      this.videoEncoder.encode(frame);
    });
  }
}
