"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkspacesController = void 0;
const common_1 = require("@nestjs/common");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const create_workspace_dto_1 = require("./dto/create-workspace.dto");
const invite_member_dto_1 = require("./dto/invite-member.dto");
const workspace_member_guard_1 = require("./guards/workspace-member.guard");
const workspaces_service_1 = require("./workspaces.service");
let WorkspacesController = class WorkspacesController {
    constructor(workspaces) {
        this.workspaces = workspaces;
    }
    async create(user, dto) {
        return this.workspaces.createWorkspace(user.sub, dto);
    }
    async listMine(user) {
        return this.workspaces.listMyWorkspaces(user.sub);
    }
    async get(workspaceId) {
        return this.workspaces.getWorkspace(workspaceId);
    }
    async invite(user, workspaceId, dto) {
        return this.workspaces.inviteMember({
            workspaceId,
            inviterId: user.sub,
            email: dto.email,
        });
    }
};
exports.WorkspacesController = WorkspacesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_workspace_dto_1.CreateWorkspaceDto]),
    __metadata("design:returntype", Promise)
], WorkspacesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WorkspacesController.prototype, "listMine", null);
__decorate([
    (0, common_1.UseGuards)(workspace_member_guard_1.WorkspaceMemberGuard),
    (0, common_1.Get)(':workspaceId'),
    __param(0, (0, common_1.Param)('workspaceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WorkspacesController.prototype, "get", null);
__decorate([
    (0, common_1.UseGuards)(workspace_member_guard_1.WorkspaceMemberGuard),
    (0, common_1.Post)(':workspaceId/invite'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, invite_member_dto_1.InviteMemberDto]),
    __metadata("design:returntype", Promise)
], WorkspacesController.prototype, "invite", null);
exports.WorkspacesController = WorkspacesController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('workspaces'),
    __metadata("design:paramtypes", [workspaces_service_1.WorkspacesService])
], WorkspacesController);
//# sourceMappingURL=workspaces.controller.js.map