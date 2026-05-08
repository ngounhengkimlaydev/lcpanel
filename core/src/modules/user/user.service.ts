import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { UserMapper } from "./user.mapper";
import { CreateUserDTO } from "./dto/create-user.dto";
import { UserRepository } from "./user.repository";
import { UpdateUserDTO } from "./dto/update-user.dto";
import { HashService } from "../../common/utils/hash/hash.service";
import { UserLogService } from "../user-log/user-log.service";
import { Activity } from "../user-log/dto/activity.dto";

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly userRepo: UserRepository,
    private readonly hashService: HashService,
    private readonly userLogService: UserLogService,
  ) {}
  async findAll(params: {
    page?: number;
    tableSize?: number;
    filter?: { search?: string };
    sortBy?: string;
    sortType?: "asc" | "desc";
  }) {
    const {
      page = 1,
      tableSize = 10,
      filter = {},
      sortBy = "id",
      sortType = "desc",
    } = params;

    const result = await this.userRepo.paginate({
      page,
      tableSize,
      filter,
      sortBy,
      sortType,
    });
    const data = result.data.map((u) => ({
      id: u.id,
      full_name: u.full_name,
      email: u.email,
      username: u.username,
      role_name: u.role.role_name,
      status: u.status,
      created_at: u.created_at,
    }));
    return {
      data: data,
      pagination: {
        currentPage: page,
        per_page: tableSize,
        total: result.total,
        from: result.from,
        to: result.to,
        last_page: result.last_page,
      },
    };
  }
  async findById(userId: number) {
    const user = await this.userRepo.findByid(userId);

    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    return { user };
  }

  async create(data: CreateUserDTO) {
    if (data.password) {
      const password = await this.hashService.hash(data.password);
      data.password = password;
    }
    const user = await this.userRepo.createUser(data);
    await this.userLogService.log({
      module: "User",
      action: Activity.CREATE,
      description: `Create User ${user.username}`,
      subjectId: user.id,
      properties: data,
    });
    return user;
  }

  async update(id: number, data: UpdateUserDTO) {
    try {
      const existing = await this.userRepo.findByid(id);
      if (!existing) throw new NotFoundException("User not found");
      if (data.password) {
        const password = await this.hashService.hash(data.password);
        data.password = password;
      }
      const user = await this.userRepo.update(id, data);

      await this.userLogService.log({
        module: "User",
        action: Activity.UPDATE,
        description: `Update User ${user.username}`,
        subjectId: user.id,
        properties: data,
      });
      return user;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async delete(id: number) {
    try {
      const existing = await this.userRepo.findByid(id);
      if (!existing) throw new NotFoundException("User not found");
      const user = await this.userRepo.delete(id);
      await this.userLogService.log({
        module: "User",
        action: Activity.DELETE,
        description: `Delete User ${user.username}`,
        subjectId: user.id,
      });
      return user;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getRole(user_type_id: number) {
    try {
      const data = await this.prisma.role.findMany({
        where: {
          user_type_id: user_type_id,
        },
      });
      return { data };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
