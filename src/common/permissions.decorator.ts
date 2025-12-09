import { SetMetadata } from '@nestjs/common';
export const Permissions = (...p: string[]) => SetMetadata('permissions', p);
