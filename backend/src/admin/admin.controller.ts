import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiOkResponse, ApiCreatedResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { CreateUserDto, UpdateUserDto } from "../dto's/user-dtos's";
import { Roles } from "../auth/decorators/roles-decorator";
import { UserRole, AccountStatus } from "../database/user";
import { AdminService } from "./admin.service";
import { UserService } from "../user/user.service";
import { AuthenticationGuard } from "../auth/guards/authentication-guard";
import { AuthorizationGuard } from "../auth/guards/authorization-guard";
import { UpdateUserRoleBodyDto, ChangeStatusDto } from "../dto's/admin-dtos's";
import { CurrentUser } from "../auth/decorators/current-user";


@ApiTags('admin')
@ApiBearerAuth('access-token')
@Controller('admin')
@UseGuards(AuthenticationGuard, AuthorizationGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
    constructor(
        private readonly admin: AdminService,
        private readonly users: UserService,
    ) {}

    @ApiOperation({ summary: 'Create a new user as admin' })
    @ApiCreatedResponse({ description: 'User created' })
    @Post('create-user')
    async createUser(@Body() dto: CreateUserDto, @CurrentUser() user: any) {
        return this.admin.createUserByAdmin(dto, user.sub);
    }

    @ApiOperation({ summary: 'Update a user by id' })
    @ApiOkResponse({ description: 'User updated' })
    @Patch(':id')
    async updateById(@Param('id') id: string, @Body() dto: UpdateUserDto) {
        return this.users.updateUser(id, dto);
    }

    @ApiOperation({ summary: 'Delete a user (hard delete) by id' })
    @ApiOkResponse({ description: 'User deleted' })
    @Delete(':id')
    async delete(@Param('id') id: string) {
        await this.users.deleteUser(id);
        return { deleted: true };
    }

    @ApiOperation({ summary: 'List users with optional filters' })
    @ApiQuery({ name: 'q', required: false })
    @ApiQuery({ name: 'role', required: false, enum: UserRole })
    @ApiQuery({ name: 'status', required: false, enum: AccountStatus })
    @ApiQuery({ name: 'verified', required: false, description: 'true|false' })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @Get('users')
    listUsers(
        @Query('q') q?: string,
        @Query('role') role?: UserRole,
        @Query('status') status?: AccountStatus,
        @Query('verified') verified?: 'true' | 'false',
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.admin.listUsers({
            q,
            role,
            status,
            verified,
            page: Number(page),
            limit: Number(limit),
        });
    }

    @ApiOperation({ summary: 'Update a user role (Admin only)' })
    @ApiParam({ name: 'id', description: 'User ObjectId' })
    @ApiOkResponse({ description: 'Role updated' })
    @Patch('users/:id/role')
    updateUserRole(@Param('id') id: string, @Body() body: UpdateUserRoleBodyDto, @CurrentUser() user: any) {
        return this.admin.updateUserRole(id, user.sub, body.role);
    }

    @ApiOperation({ summary: 'Get admin metrics/summary' })
    @Get('metrics')
    metrics() {
        return this.admin.metrics();
    }

    @ApiOperation({ summary: 'Get security overview metrics' })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'from', required: false })
    @ApiQuery({ name: 'to', required: false })
    @Get('security')
    security(
        @Query('limit') limit?: string,
        @Query('from') from?: string,
        @Query('to') to?: string,
    ) {
        return this.admin.securityOverview({ limit: Number(limit ?? '50'), from, to });
    }

    @ApiOperation({ summary: 'Unlock a user account (Admin only)' })
    @ApiParam({ name: 'id', description: 'User ObjectId' })
    @Patch('users/:id/unlock')
    async unlockUser(@Param('id') userId: string, @CurrentUser() user: any) {
        return this.admin.unlockUserAccount(userId, user.sub);
    }

    @ApiOperation({ summary: 'Lock a user account (Admin only)' })
    @ApiParam({ name: 'id', description: 'User ObjectId' })
    @Patch('users/:id/lock')
    async lockUser(
        @Param('id') userId: string,
        @Body('reason') reason: string,
        @CurrentUser() user: any,
    ) {
        return this.admin.lockUserAccount(userId, user.sub, reason);
    }

    @ApiOperation({ summary: 'Suspend a user account (Admin only)' })
    @ApiParam({ name: 'id', description: 'User ObjectId' })
    @Patch('users/:id/suspend')
    async suspendUser(
        @Param('id') userId: string,
        @Body('reason') reason: string,
        @CurrentUser() user: any,
    ) {
        return this.admin.suspendUserAccount(userId, user.sub, reason);
    }

    @ApiOperation({ summary: 'Terminate a user account (Admin only)' })
    @ApiParam({ name: 'id', description: 'User ObjectId' })
    @Patch('users/:id/terminate')
    async terminateUser(
        @Param('id') userId: string,
        @Body('reason') reason: string,
        @CurrentUser() user: any,
    ) {
        return this.admin.terminateUserAccount(userId, user.sub, reason);
    }

    @ApiOperation({ summary: 'Reactivate a user account (Admin only)' })
    @ApiParam({ name: 'id', description: 'User ObjectId' })
    @Patch('users/:id/reactivate')
    async reactivateUser(@Param('id') userId: string, @CurrentUser() user: any) {
        return this.admin.reactivateUserAccount(userId, user.sub);
    }

    @ApiOperation({ summary: 'Change user status with reason (Admin only)' })
    @ApiParam({ name: 'id', description: 'User ObjectId' })
    @Patch('users/:id/status')
    async changeStatus(
        @Param('id') userId: string,
        @Body() body: ChangeStatusDto,
        @CurrentUser() user: any,
    ) {
        return this.admin.changeUserStatus(userId, user.sub, body.status, body.reason);
    }
}
