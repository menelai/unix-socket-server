import {Type} from '@nestjs/common';

import {IpcTaskStorage} from '@/unix-socket-server/ipc-task-storage';

export const CliCommand = function<T>(target: Type<T>): Type<T> {
  IpcTaskStorage.addIpcTaskCommand(target);
  return target;
};
