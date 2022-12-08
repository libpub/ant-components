/** ServiceUtils singleton instance */
class ServiceUtils {
  private static _instance: ServiceUtils;
  private constructor(public name: string) {}

  private _baseUri: string = '';

  public static instance() {
    if (this._instance) {
      return this._instance;
    }
    this._instance = new ServiceUtils('baseuri');
    this._instance.initialize();
    return this._instance;
  }

  private initialize() {
    let uri = window.location.pathname;
    // If frontend deploys standalone under nginx, fetch application route name prefix
    if (false) {
      // TODO: fetch application route prefix
    } else {
      const idx = uri.lastIndexOf('/');
      if (idx > 0) {
        uri = uri.substring(0, idx);
      }
    }
    if ('/' === uri) {
      uri = '';
    }
    this._baseUri = uri;
  }

  public getBaseURI() {
    return this._baseUri;
  }
}

export default ServiceUtils;
