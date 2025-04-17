import {Type} from '@nestjs/common';

import {IpcTaskStorage} from '@/unix-socket-server/ipc-task-storage';

export const IpcQuery = function<T>(target: Type<T>): Type<T> {
  IpcTaskStorage.addIpcTaskQuery(target);
  return target;
};
