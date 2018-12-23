type Folder<R, T> = {
  none?: () => T;
  inProgress?: () => T;
  success?: (r: R) => T;
  failed?: (e: any) => T;
}

const nullFunc = (r?: any) => null;

export abstract class Progress<R> {
  get success(): boolean {
    return false
  }

  get failed(): boolean {
    return false
  }

  get isCompleted(): boolean {
    return this.failed || this.success
  }

  get isInProgress(): boolean {
    return false
  }

  get isStarted(): boolean {
    return this.isInProgress || this.isCompleted
  }

  get isNone(): boolean {
    return !this.isStarted
  }

  then<T>(successMapper: (r: R) => T): Progress<T> {
    return this as any
  }

  abstract fold<T>(folder: Folder<R, T>): T | null

  unwrap(): R {
    throw new Error('Uncompleted progress')
  }

  get result(): R | undefined {
    return undefined
  }
}

class Success<R> extends Progress<R> implements SuccessData<R> {
  readonly type = 'success'
  readonly _result: R
  constructor(result: R) {
    super()
    this._result = result
  }

  get result(): R {
    return this._result
  }

  get success(): boolean {
    return true
  }

  unwrap(): R {
    return this._result
  }

  then<T>(mapper: (r: R) => T): Progress<T> {
    const newResult: any = mapper(this._result)
    return newResult === this.result ? this : new Success(newResult)
  }

  fold<T>(folder: Folder<R, T>): T | null {
    return (folder.success || nullFunc)((this._result));
  }
}

class Failed extends Progress<any> implements FailedData {
  readonly type = 'failed'
  readonly error: any

  constructor(error?: any) {
    super()
    this.error = error
  }

  get failed(): boolean {
    return true
  }

  unwrap(): never {
    throw this.error
  }

  fold<T>(folder: Folder<any, T>): T | null {
    return (folder.failed || nullFunc)(this.error);
  }
}

export const inProgress: Progress<any> = (() => {
  class InProgress extends Progress<any> implements AsyncData<any> {
    readonly type = 'inProgress'

    get isInProgress(): boolean {
      return true
    }

    fold<T>(folder: Folder<any, T>): T | null {
      return (folder.inProgress || nullFunc)();
    }
  }

  return new InProgress()
})()

export const none: Progress<any> = (() => {
  class None extends Progress<any> implements AsyncData<any> {
    readonly type = 'none'

    fold<T>(folder: Folder<any, T>): T | null {
      return (folder.none || nullFunc)();
    }
  }

  return new None()
})()

export const success = <R>(r: R): Progress<R> => new Success(r)
export const failed = (error: any): Progress<any> => new Failed(error)

export interface AsyncData<R> {
  type: 'success' | 'failed' | 'inProgress' | 'none'
}

export interface SuccessData<R> extends AsyncData<R> {
  type: 'success'
  _result: R
}

export interface FailedData extends AsyncData<any> {
  type: 'failed'
  error: any
}

export const from = <R>(
  serialized: Progress<R> | AsyncData<R> | SuccessData<R> | FailedData
): Progress<R> => {
  if (serialized instanceof Progress) {
    return serialized
  }

  switch (serialized.type) {
    case 'success':
      return new Success((serialized as SuccessData<R>)._result)
    case 'failed':
      return new Failed((serialized as FailedData).error)
    case 'inProgress':
      return inProgress
    case 'none':
      return none
    default:
      throw new Error(`Unknown Progress type: ${(serialized as any).type}`)
  }
}

export const all = (...targets: Progress<unknown>[]): Progress<unknown> =>
  targets.find(p => p.failed) ||
  targets.find(p => p.isInProgress) ||
  targets.find(p => !p.isStarted) ||
  success(targets.map(p => p.result))

export const race = <T>(...targets: Progress<T>[]): Progress<T> =>
  targets.find(p => p.isCompleted) || targets.find(p => p.isInProgress) || targets[0] || none

export const thunk = <R>(type: string, promise: Promise<R>, extras: any) => async (
  dispatch: (a: any) => void
) => {
  const action = (type: any, progress: any, extras: any) => ({ ...extras, type, progress })

  dispatch(action(type, inProgress, extras))
  let progress
  try {
    const result = await promise
    progress = success(result)
  } catch (error) {
    progress = failed(error)
  }
  dispatch(action(type, progress, extras))
  return progress
}

export default thunk
