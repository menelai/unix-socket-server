import {Inject, Injectable} from '@nestjs/common';
import {EventBus} from '@nestjs/cqrs';
import ipc from 'node-ipc';

import {MessageFromSocketEvent} from '@/transport/events/impl/message-from-socket.event';
import {CLI_UNIX_SOCKET} from '@/token';

@Injectable()
export class UnixSocketClientService {

  private static readonly ipcServerId = 'tlsproxy';

  constructor(
    @Inject(CLI_UNIX_SOCKET) private readonly socketPath: string,
    private readonly eventBus: EventBus,
  ) {
    ipc.config.silent = true;
    ipc.config.maxRetries = false;

    ipc.connectTo(UnixSocketClientService.ipcServerId, this.socketPath, () => {
      ipc.of[UnixSocketClientService.ipcServerId].on('msg', this.publish);
    });
  }

  send(data: any): void {
    ipc.of[UnixSocketClientService.ipcServerId].emit('msg', data);
  }

  end(): void {
    ipc.disconnect(UnixSocketClientService.ipcServerId);
  }

  private publish = (message: any): void => {
    try {
      this.eventBus.publish(new MessageFromSocketEvent(message));
    } catch (e) {
      console.error('Error parsing message', e);
    }
  };
}
