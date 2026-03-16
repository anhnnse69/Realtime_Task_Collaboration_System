import { CanActivate, ExecutionContext } from '@nestjs/common';
import { WorkspacesService } from '../workspaces.service';
export declare class WorkspaceMemberGuard implements CanActivate {
    private readonly workspaces;
    constructor(workspaces: WorkspacesService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
