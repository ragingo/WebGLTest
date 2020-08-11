type ShaderLoadCompletedCallback = (vs: string, fs: string) => void;

class ShaderLoadResult {
  private m_success: boolean;
  private m_vs: string;
  private m_fs: string;
  constructor(success: boolean, vs: string = '', fs: string = '') {
    this.m_success = success;
    this.m_vs = vs;
    this.m_fs = fs;
  }
  public get success(): boolean {
    return this.m_success;
  }
  public get vs(): string {
    return this.m_vs;
  }
  public get fs(): string {
    return this.m_fs;
  }
}

class ShaderLoader {
  public static load(vs_path: string, fs_path: string, callback: ShaderLoadCompletedCallback): void {
    ShaderLoader.loadAsync(vs_path, fs_path).then((r) => {
      if (r.success) {
        if (callback) {
          callback(r.vs, r.fs);
        }
      }
    });
  }

  private static async loadAsync(vs_path: string, fs_path: string): Promise<ShaderLoadResult> {
    let vs = await HttpUtil.getText(vs_path);
    let fs = await HttpUtil.getText(fs_path);

    if (!vs) {
      console.log('vs code not found.');
      return new ShaderLoadResult(false);
    }

    if (!fs) {
      console.log('fs code not found.');
      return new ShaderLoadResult(false);
    }

    return new ShaderLoadResult(true, vs, fs);
  }
}
