import { HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

export async function hashPassword(
  password: string,
  configService: ConfigService,
): Promise<string> {
  try {
    const salt_rounds_str = configService.get<string>('HASH_SALT');

    if (!salt_rounds_str)
      throw new HttpException(
        { response: 'Salt rounds no set' },
        HttpStatus.CONFLICT,
      );

    const salt_rounds = parseInt(salt_rounds_str, 10);

    if (isNaN(salt_rounds))
      throw new HttpException(
        { response: 'Invalid salt rounds configuration' },
        HttpStatus.CONFLICT,
      );

    const hashPassword = await bcrypt.hash(password, salt_rounds);

    return hashPassword;
  } catch (error) {
    throw new HttpException(
      { response: 'Error generating hashed password' },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
