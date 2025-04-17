import {DynamicModule, Module} from '@nestjs/common';
import {CqrsModule} from '@nestjs/cqrs';

import {CLI_UNIX_SOCKET} from '@/token';
import {ExecOnSocketHandler} from '@/transport/commands/handlers/exec-on-socket.handler';
import {UnixSocketClientService} from '@/transport/unix-socket-client.service';

@Module({})
export class TransportModule {
  static config(socketPath: string): DynamicModule {
    return {
      module: TransportModule,
      imports: [
        CqrsModule,
      ],
      providers: [
        ExecOnSocketHandler,
        UnixSocketClientService,
        {
          provide: CLI_UNIX_SOCKET,
          useValue: socketPath,
        },
      ],
    };
  }
}
