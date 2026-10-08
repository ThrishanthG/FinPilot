import { Controller, Get, Delete, Param, Req, UseGuards, Ip } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard, Roles } from '../auth/guards/role.guard';
import { Role } from '../common/prisma-enums';

@Controller('admin')
@UseGuards(JwtAuthGuard, RoleGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('users')
  async getAllUsers(@Req() req: any) {
    const adminId = req.user.id;
    return this.adminService.getAllUsers(adminId);
  }

  @Get('audits')
  async getAudits(@Req() req: any) {
    const adminId = req.user.id;
    return this.adminService.getAuditLogs(adminId);
  }

  @Delete('users/:id')
  async deleteUser(@Param('id') id: string, @Req() req: any, @Ip() ip: string) {
    const adminId = req.user.id;
    return this.adminService.deleteUserAccount(adminId, id, ip);
  }
}
