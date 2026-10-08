import { Controller, Put, Delete, Body, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Put('profile')
  async updateProfile(@Body() dto: UpdateProfileDto, @Req() req: any) {
    const userId = req.user.id;
    return this.usersService.updateProfile(userId, dto);
  }

  @Delete('data')
  async deleteAccount(@Req() req: any) {
    const userId = req.user.id;
    return this.usersService.deleteUserData(userId);
  }
}
