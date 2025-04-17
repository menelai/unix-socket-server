import {BadRequestException} from '@nestjs/common';
import {CommandHandler, EventBus, ICommandHandler, ofType} from '@nestjs/cqrs';
import {catchError, filter, finalize, firstValueFrom, map, of, timeout, TimeoutError} from 'rxjs';

import {ExecOnSocketCommand} from '@/transport/commands/impl/exec-on-socket.command';
import {MessageFromSocketEvent} from '@/transport/events/impl/message-from-socket.event';
import {UnixSocketClientService} from '@/transport/unix-socket-client.service';
import {IpcTaskStorage} from '@/unix-socket-server/ipc-task-storage';

@CommandHandler(ExecOnSocketCommand)
export class ExecOnSocketHandler<T = any> implements ICommandHandler<ExecOnSocketCommand, T> {

  constructor(
    private readonly unixSocketService: UnixSocketClientService,
    private readonly eventBus: EventBus,
  ) { }

  async execute(cmd: ExecOnSocketCommand): Promise<T> {
    if (!IpcTaskStorage.allowedCommands.has(cmd.command.name) && !IpcTaskStorage.allowedQueries.has(cmd.command.name)) {
      throw new BadRequestException(`Invalid command or query ${cmd.command.name}`);
    }

    this.unixSocketService.send({
      command: cmd.command.name,
      args: cmd.args,
      instanceId: cmd.instanceId,
    });

    return firstValueFrom(this.eventBus.pipe(
      ofType(MessageFromSocketEvent),
      filter(e => e?.data?.instanceId === cmd.instanceId),
      map(({data}) => data.result),
      timeout(10_000),
      catchError(e => {
        if (e instanceof TimeoutError) {
          throw new Error('Response timeout');
        }
        return of(null);
      }),
      finalize(() => {
        this.unixSocketService.end();
      }),
    ));
  }
}
