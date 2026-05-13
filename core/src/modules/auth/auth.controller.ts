import { AuthService } from "./auth.service";
import { Body, Controller, Logger, Post, UseGuards } from "@nestjs/common";
import { LoginDTO } from "./dto/login.dto";
import { RegisterDTO } from "./dto/register.dto";
import { ForgotPasswordDTO } from "./dto/forgot-password.dto";
import { GetUser } from "./decorators/get-user.decorator";
import { JwtAuthGuard } from "./jwt-auth.guard";

@Controller("auth")
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}
  // @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post("login")
  login(@Body() dto: LoginDTO) {
    return this.authService.login(dto);
  }

  @Post("register")
  register(@Body() dto: RegisterDTO) {
    return this.authService.register(dto);
  }

  @Post("forgot-password")
  forgotPassword(@Body() dto: ForgotPasswordDTO) {
    return this.authService.forgotPassword(dto);
  }

  @Post("logout")
  logout() {
    return this.authService.logout();
  }

  @UseGuards(JwtAuthGuard)
  @Post("me")
  fetchData(@GetUser() user: { id: number; auth_type?: "user" | "customer" }) {
    return this.authService.getResponseData(user.id, undefined, user.auth_type);
  }
}
