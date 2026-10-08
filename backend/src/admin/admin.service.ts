import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getAuditLogs(adminId: string) {
    const logs = await this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        admin: {
          select: { name: true, email: true }
        }
      }
    });
    if (process.env.STANDALONE === 'true') {
      return logs.map(log => {
        try {
          return {
            ...log,
            details: typeof log.details === 'string' ? JSON.parse(log.details) : log.details
          };
        } catch (e) {
          return log;
        }
      });
    }
    return logs;
  }

  async getAllUsers(adminId: string) {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        age: true,
        riskScore: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async deleteUserAccount(adminId: string, targetUserId: string, ipAddress: string) {
    const user = await this.prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user) {
      throw new NotFoundException('User account not found');
    }

    // Log admin action first (FK cascade safety)
    await this.prisma.auditLog.create({
      data: {
        adminId,
        action: 'DELETE_USER',
        details: JSON.stringify({ targetUserId, targetUserEmail: user.email }),
        ipAddress
      }
    });

    // Delete user (cascade will delete assessments, investments, goals, refresh tokens)
    await this.prisma.user.delete({ where: { id: targetUserId } });

    return { success: true };
  }

  async logAdminAction(adminId: string, action: string, details: any, ipAddress: string) {
    return this.prisma.auditLog.create({
      data: {
        adminId,
        action,
        details: typeof details === 'string' ? details : JSON.stringify(details),
        ipAddress
      }
    });
  }
}
