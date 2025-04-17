import {Inject, Injectable, OnModuleDestroy, OnModuleInit} from '@nestjs/common';
import {CommandBus, QueryBus} from '@nestjs/cqrs';
import ipc from 'node-ipc';

import {existsSync, unlinkSync} from 'fs';

import {CLI_UNIX_SOCKET} from '@/token';
import {IpcTaskStorage} from '@/unix-socket-server/ipc-task-storage';

@Injectable()
export class UnixSocketServerService implements OnModuleInit, OnModuleDestroy {

  constructor(
    @Inject(CLI_UNIX_SOCKET) private readonly socketPath: string,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) { }

  onModuleInit(): void {
    this.unlink();

    ipc.config.silent = true;

    ipc.serve(this.socketPath, () => {
      console.log(`Now listening ${this.socketPath}`);

      ipc.server.on('msg', this.exec);

      ipc.server.on('connect', () => {
        console.log('Unix socket client connected');
      });

      ipc.server.on('socket.disconnected', () => {
        console.log('Unix socket client disconnected');
      });
    });

    ipc.server.start();
  }

  onModuleDestroy(): void {
    this.unlink();
  }

  private exec = (payload: any, socket: any): void => {
    try {
      const {command, args, instanceId}: {command: string, args: any[], instanceId: string} = payload;

      const cmd: any = IpcTaskStorage.allowedCommands.get(command);
      const query: any = IpcTaskStorage.allowedQueries.get(command);

      if (!cmd && !query) {
        console.error(`No command ${command}`);
        return;
      }

      const bus = cmd ? this.commandBus : this.queryBus;
      const arg = new (cmd ?? query)(...args);

      if (process.env.DEBUG) {
        console.log(arg);
      }

      console.log(`Executing command ${command} via unix socket api`, args);

      bus.execute(arg)
        .then(result => {
          ipc.server.emit(
            socket,
            'msg',
            {result, instanceId},
          );
        })
        .catch(error => {
          console.error(error);
          ipc.server.emit(
            socket,
            'msg',
            {result: error?.message, instanceId},
          );
        });

    } catch (e) {
      console.error(`Can't unpack message from unix socket`, e);
    }
  };

  private unlink(): void {
    if (existsSync(this.socketPath)) {
      unlinkSync(this.socketPath);
    }
  }
}
