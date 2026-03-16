import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import type { JwtUser } from '../../common/types/jwt-user.type';
import { WorkspacesService } from '../workspaces.service';

@Injectable()
export class WorkspaceMemberGuard implements CanActivate {
    constructor(private readonly workspaces: WorkspacesService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user as JwtUser | undefined;
        const workspaceId = request.params?.workspaceId as string | undefined;

        if (!user?.sub) throw new ForbiddenException();
        if (!workspaceId) return true;

        const isActiveMember = await this.workspaces.isActiveMember(workspaceId, user.sub);
        if (!isActiveMember) throw new ForbiddenException('Not an active workspace member');
        return true;
    }
}
