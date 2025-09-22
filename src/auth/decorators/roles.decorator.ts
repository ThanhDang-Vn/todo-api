import { SetMetadata } from '@nestjs/common';
import { Role } from '../enums/role.enum';

export const KEY_ROLES = 'roles';

export const Roles = (...roles: [Role, ...Role[]]) =>
  SetMetadata(KEY_ROLES, roles);
