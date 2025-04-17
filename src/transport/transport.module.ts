import {Module} from '@nestjs/common';
import {CqrsModule} from '@nestjs/cqrs';

import {ExecOnSocketHandler} from '@/transport/commands/handlers/exec-on-socket.handler';
import {UnixSocketClientService} from '@/transport/unix-socket-client.service';

@Module({
  imports: [
    CqrsModule,
  ],
  providers: [
    ExecOnSocketHandler,
    UnixSocketClientService,
  ],
})
export class TransportModule {}
