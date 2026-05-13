import { Injectable, Logger, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { existsSync, readFileSync, readdirSync } from "fs";
import { App, cert, getApps, initializeApp, ServiceAccount } from "firebase-admin/app";
import { Auth, DecodedIdToken, getAuth } from "firebase-admin/auth";
import { join, resolve } from "path";

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
    const serviceAccountPath = this.resolveServiceAccountPath();
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

      if (serviceAccountPath) {
        const parsed = this.readServiceAccountFile(serviceAccountPath);

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

    this.logger.warn("Firebase Admin is not configured. Set FIREBASE_SERVICE_ACCOUNT, FIREBASE_SERVICE_ACCOUNT_PATH, GOOGLE_APPLICATION_CREDENTIALS, or FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY.");
    return null;
  }

  private readServiceAccountFile(serviceAccountPath: string): ServiceAccount {
    const resolvedPath = resolve(serviceAccountPath);
    const raw = readFileSync(resolvedPath, "utf8");

    return JSON.parse(raw) as ServiceAccount;
  }

  private resolveServiceAccountPath(): string | null {
    const configuredPath =
      this.config.get<string>("FIREBASE_SERVICE_ACCOUNT_PATH")
      || this.config.get<string>("GOOGLE_APPLICATION_CREDENTIALS");

    if (configuredPath) {
      return resolve(process.cwd(), configuredPath);
    }

    return this.findLocalServiceAccountPath();
  }

  private findLocalServiceAccountPath(): string | null {
    const searchDirectories = [
      join(process.cwd(), "src", "common"),
      join(process.cwd(), "dist", "common"),
      join(__dirname, ".."),
    ];

    for (const directory of searchDirectories) {
      if (!existsSync(directory)) {
        continue;
      }

      const match = readdirSync(directory).find((fileName) => (
        fileName.endsWith(".json")
        && fileName.includes("firebase-adminsdk")
      ));

      if (match) {
        return join(directory, match);
      }
    }

    return null;
  }
}
