import {Type} from '@nestjs/common';

export class IpcTaskStorage {
  static readonly allowedCommands = new Map<string, Type<any>>();

  static readonly allowedQueries = new Map<string, Type<any>>();

  static addIpcTaskCommand(c: Type<any>): void {
    this.allowedCommands.set(c.name, c);
  }

  static addIpcTaskQuery(c: Type<any>): void {
    this.allowedQueries.set(c.name, c);
  }
}
