import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ErrorManager } from 'src/common/exception-filters/error-manager.filter';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      //Get user data from request
      const request = context.switchToHttp().getRequest();

      const { user } = request;

      //Get neccesary meta data
      const allowedRoles = this.reflector.get('roles', context.getHandler());

      //if role have permissions or not
      if (!allowedRoles.includes(user.role)) {
        throw new ErrorManager({
          type: 'FORBIDDEN',
          message: 'This type of user does not have sufficient permissions',
        });
      }

      return true;
    } catch (error) {
      if (error instanceof Error) {
        throw ErrorManager.createSignatureError(error.message);
      } else {
        throw ErrorManager.createSignatureError('An unexpected error occurred');
      }
    }
  }
}
