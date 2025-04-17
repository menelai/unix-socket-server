import {Injectable} from '@nestjs/common';
import {ICommand, ofType, Saga} from '@nestjs/cqrs';
import {unpack} from 'msgpackr';
import {filter, map, Observable} from 'rxjs';

import {MessageFromSocketEvent} from '@/transport/events/impl/message-from-socket.event';
import {IpcTaskStorage} from '@/unix-socket-server/ipc-task-storage';

@Injectable()
export class MessageFromUnixSocketSaga {

  @Saga()
  readonly gotMessage = (events$: Observable<any>): Observable<ICommand> => {
    return events$.pipe(
      ofType(MessageFromSocketEvent),
      map(({data}) => {
        try {
          return unpack(data);
        } catch {
          return null;
        }
      }),
      filter(data => data != null),
      map(({command, args}: {command: string, args: any[], instanceId: string}) => {
        const cmd: any = IpcTaskStorage.allowedCommands.get(command);
        const query: any = IpcTaskStorage.allowedQueries.get(command);

        if (!cmd && !query) {
          throw new Error(`No command ${command}`);
        }

        return new (cmd ?? query)(args);
      }),
    );
  };
}
