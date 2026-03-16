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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkspaceMemberGuard = void 0;
const common_1 = require("@nestjs/common");
const workspaces_service_1 = require("../workspaces.service");
let WorkspaceMemberGuard = class WorkspaceMemberGuard {
    constructor(workspaces) {
        this.workspaces = workspaces;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const workspaceId = request.params?.workspaceId;
        if (!user?.sub)
            throw new common_1.ForbiddenException();
        if (!workspaceId)
            return true;
        const isMember = await this.workspaces.isMember(workspaceId, user.sub);
        if (!isMember)
            throw new common_1.ForbiddenException('Not a workspace member');
        return true;
    }
};
exports.WorkspaceMemberGuard = WorkspaceMemberGuard;
exports.WorkspaceMemberGuard = WorkspaceMemberGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [workspaces_service_1.WorkspacesService])
], WorkspaceMemberGuard);
//# sourceMappingURL=workspace-member.guard.js.map