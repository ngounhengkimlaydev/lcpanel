import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { execFile } from "child_process";
import { promisify } from "util";
import { FileService } from "../../common/utils/file/file.service";
import { UserLogService } from "../user-log/user-log.service";

const execFileAsync = promisify(execFile);

const ALLOWED_SERVICES = [
  "nginx",
  "mysql",
  "mariadb",
  "redis",
  "ssh",
  "sshd",
  "pm2-lay",
];

@Injectable()
export class ServicesService {
  constructor(
    private readonly wf: FileService,
    private readonly userLogService: UserLogService,
  ) {}

  private validateService(serviceName: string) {
    const safeName = serviceName.replace(".service", "");

    if (!ALLOWED_SERVICES.includes(safeName)) {
      throw new BadRequestException(
        `Service ${serviceName} is not allowed to control`,
      );
    }

    return safeName;
  }

  private async runSystemctl(
    action: "start" | "stop" | "restart",
    serviceName: string,
  ) {
    this.validateService(serviceName);

    await execFileAsync("/usr/bin/sudo", [
      "/usr/bin/systemctl",
      action,
      serviceName,
    ]);

    return {
      success: true,
      message: `${serviceName} ${action} successfully`,
    };
  }

  private async getAllSystemServices() {
    if (process.platform !== "linux") {
      return [
        {
          id: 1,
          name: "nginx",
          description: "Linux services only available on server",
          status: "unknown",
        },
      ];
    }

    const { stdout } = await execFileAsync("/bin/systemctl", [
      "list-units",
      "--type=service",
      "--all",
      "--no-pager",
      "--no-legend",
    ]);

    return stdout
      .split("\n")
      .filter(Boolean)
      .map((line, index) => {
        const parts = line.trim().split(/\s+/);

        return {
          id: index + 1,
          name: parts[0].replace(".service", ""),
          status: parts[2],
          description: parts.slice(4).join(" "),
        };
      });
  }

  async findAll(params: {
    page?: number;
    tableSize?: number;
    filter?: { search?: string };
    sortBy?: string;
    sortType?: "asc" | "desc";
  }) {
    try {
      const page = params.page || 1;
      const tableSize = params.tableSize || 10;
      const search = params.filter?.search?.toLowerCase() || "";

      let services = await this.getAllSystemServices();

      if (search) {
        services = services.filter((item) => {
          return (
            item.name.toLowerCase().includes(search) ||
            item.description.toLowerCase().includes(search)
          );
        });
      }

      const total = services.length;
      const start = (page - 1) * tableSize;
      const data = services.slice(start, start + tableSize);
      return {
        data,
        meta: {
          page,
          table_size: tableSize,
          total,
          total_page: Math.ceil(total / tableSize),
        },
      };
    } catch (e: any) {
      this.wf.logFile(e.message);
      throw new InternalServerErrorException(e.message);
    }
  }

  async startService(dto: { serviceName: string }, userId: number) {
    try {
      const result = await this.runSystemctl("start", dto.serviceName);

      await this.userLogService.log({
        module: "Services",
        action: "Start Service",
        description: `Start by user ${userId} on service ${dto.serviceName}`,
        subjectId: userId,
      });

      return result;
    } catch (e: any) {
      this.wf.logFile(e.message);
      throw new InternalServerErrorException(e.message);
    }
  }

  async stopService(dto: { serviceName: string }, userId: number) {
    try {
      const result = await this.runSystemctl("stop", dto.serviceName);

      await this.userLogService.log({
        module: "Services",
        action: "Stop Service",
        description: `Stop by user ${userId} on service ${dto.serviceName}`,
        subjectId: userId,
      });

      return result;
    } catch (e: any) {
      this.wf.logFile(e.message);
      throw new InternalServerErrorException(e.message);
    }
  }

  async restartService(dto: { serviceName: string }, userId: number) {
    try {
      const result = await this.runSystemctl("restart", dto.serviceName);

      await this.userLogService.log({
        module: "Services",
        action: "Restart Service",
        description: `Restart by user ${userId} on service ${dto.serviceName}`,
        subjectId: userId,
      });

      return result;
    } catch (e: any) {
      this.wf.logFile(e.message);
      throw new InternalServerErrorException(e.message);
    }
  }
}
