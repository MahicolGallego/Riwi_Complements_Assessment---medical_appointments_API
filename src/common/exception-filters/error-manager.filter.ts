import { HttpException, HttpStatus } from '@nestjs/common';

export class ErrorManager extends Error {
  // Constructor that receives an object with type and message
  constructor({
    type,
    message,
  }: {
    type: keyof typeof HttpStatus; // The type must be a key of the HttpStatus enum
    message: string;
  }) {
    // Calls the base Error constructor with a formatted message
    super(`${type} :: ${message}`);
  }

  // Static method to create and throw a signature error
  static createSignatureError(message: string): void {
    // Extracts the error type from the message
    const name = message.split(' :: ')[0];
    // If a valid name is obtained, throws an HttpException with the corresponding status
    if (name) {
      throw new HttpException(message, HttpStatus[name]);
    }
    // If no name is found, throws an HttpException with an internal server error status
    throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
