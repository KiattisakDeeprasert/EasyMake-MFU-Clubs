declare module "google-auth-library" {
  export class OAuth2Client {
    constructor(...args: any[]);
    verifyIdToken(...args: any[]): Promise<any>;
  }

  export default OAuth2Client;
}
