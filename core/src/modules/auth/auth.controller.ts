import { AuthService } from './auth.service';
import { Body, Controller, Logger, Post, UseGuards } from '@nestjs/common';
import { LoginDTO } from './dto/login.dto';
import { GetUser } from './decorators/get-user.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginDTO) {
    return this.authService.login(dto);
  }

  @Post('logout')
  logout() {
    return this.authService.logout();
  }

  @UseGuards(JwtAuthGuard)
  @Post('me')
  fetchData(@GetUser('id') userId: number) {
    return this.authService.getResponseData(userId);
  }
}
