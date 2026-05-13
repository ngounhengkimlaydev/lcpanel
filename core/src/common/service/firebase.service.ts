import { Injectable, Logger, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { App, cert, getApps, initializeApp, ServiceAccount } from "firebase-admin/app";
import { Auth, DecodedIdToken, getAuth } from "firebase-admin/auth";

@Injectable()
export class FirebaseService {
  private readonly logger = new Logger(FirebaseService.name);
  private readonly app: App | null;

  constructor(private readonly config: ConfigService) {
    this.app = this.createApp();
  }

  get isConfigured() {
    return Boolean(this.app);
  }

  async verifyIdToken(idToken: string): Promise<DecodedIdToken> {
    return this.auth.verifyIdToken(idToken);
  }

  async createPasswordResetLink(email: string): Promise<string | null> {
    if (!this.app) {
      return null;
    }

    return this.auth.generatePasswordResetLink(email);
  }

  private get auth(): Auth {
    if (!this.app) {
      throw new ServiceUnavailableException("Firebase Admin is not configured");
    }

    return getAuth(this.app);
  }

  private createApp(): App | null {
    if (getApps().length) {
      return getApps()[0];
    }

    const serviceAccountJson = this.config.get<string>("FIREBASE_SERVICE_ACCOUNT");
    const projectId = this.config.get<string>("FIREBASE_PROJECT_ID");
    const clientEmail = this.config.get<string>("FIREBASE_CLIENT_EMAIL");
    const privateKey = this.config.get<string>("FIREBASE_PRIVATE_KEY")?.replace(/\\n/g, "\n");

    try {
      if (serviceAccountJson) {
        const parsed = JSON.parse(serviceAccountJson) as ServiceAccount;

        return initializeApp({
          credential: cert(parsed),
        });
      }

      if (projectId && clientEmail && privateKey) {
        return initializeApp({
          credential: cert({
            projectId,
            clientEmail,
            privateKey,
          }),
        });
      }
    } catch (error) {
      this.logger.error(
        "Failed to initialize Firebase Admin",
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }

    this.logger.warn("Firebase Admin is not configured. Set FIREBASE_SERVICE_ACCOUNT or FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY.");
    return null;
  }
}
