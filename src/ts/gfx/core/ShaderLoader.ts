type ShaderLoadCompletedCallback = (vs: string, fs: string) => void;

class ShaderLoadResult {
  constructor(public success: boolean, public vs: string = '', public fs: string = '') {}
}

class ShaderLoader {
  public static load(vs_path: string, fs_path: string, callback: ShaderLoadCompletedCallback) {
    ShaderLoader.loadAsync(vs_path, fs_path).then((r) => {
      if (r.success) {
        if (callback) {
          callback(r.vs, r.fs);
        }
      }
    });
  }

  public static async loadAsync(vs_path: string, fs_path: string) {
    const vs = await this.fetchShaderCode(vs_path);
    if (!vs) {
      console.log('vs code not found.');
      return new ShaderLoadResult(false);
    }

    const fs = await this.fetchShaderCode(fs_path);
    if (!fs) {
      console.log('fs code not found.');
      return new ShaderLoadResult(false);
    }

    return new ShaderLoadResult(true, vs, fs);
  }

  private static async fetchShaderCode(url: string) {
    const res = await fetch(url);
    return res.text();
  }
}
