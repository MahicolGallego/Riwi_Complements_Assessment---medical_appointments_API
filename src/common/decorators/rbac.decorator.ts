import { SetMetadata } from '@nestjs/common';
import { Role } from '../constants/roles.enum';

// Para obtener las claves del enum
type RoleKeys = keyof typeof Role;
export const Rbac = (roles: RoleKeys[]) => SetMetadata('roles', roles);
