import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

export async function validatePassword(
  originalPassword: string,
  passwordToValidate: string,
) {
  if (!(await bcrypt.compare(passwordToValidate, originalPassword))) {
    throw new UnauthorizedException('Invalid password');
  }
  return;
}
