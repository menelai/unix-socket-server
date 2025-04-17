import {DynamicModule, Module} from '@nestjs/common';
import {CqrsModule} from '@nestjs/cqrs';

import {MessageFromUnixSocketSaga} from '@/unix-socket-server/sagas/message-from-unix-socket.saga';
import {UnixSocketServerService} from '@/unix-socket-server/unix-socket-server.service';
import {CLI_UNIX_SOCKET} from '@/token';

@Module({})
export class UnixSocketServerModule {
  static config(socketPath: string): DynamicModule {
    return {
      module: UnixSocketServerModule,
      imports: [
        CqrsModule,
      ],
      providers: [
        MessageFromUnixSocketSaga,
        UnixSocketServerService,
        {
          provide: CLI_UNIX_SOCKET,
          useValue: socketPath,
        },
      ],
    };
  }
}
