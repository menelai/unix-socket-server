import {nanoid} from 'nanoid';

type Constructor = { new (...args: any[]): any };

export class ExecOnSocketCommand<T extends Constructor = Constructor> {
  instanceId = nanoid();

  constructor(
    readonly command: T,
    readonly args: ConstructorParameters<T>,
    readonly silent = false,
    readonly end = true,
  ) {}
}
