import {nanoid} from 'nanoid';

type Constructor = { new (...args: any[]): any };

export class ExecOnSocketCommand<T extends Constructor = Constructor> {
  instanceId = nanoid();

  constructor(
    public readonly command: T,
    public readonly args: ConstructorParameters<T>,
  ) {}
}
