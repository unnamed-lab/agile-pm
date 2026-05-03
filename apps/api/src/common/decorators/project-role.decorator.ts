import { SetMetadata } from "@nestjs/common";

export const PROJECT_ROLE_KEY = 'projectRole';
export const RequireProjectRole = (role: string) => SetMetadata(PROJECT_ROLE_KEY, role);
