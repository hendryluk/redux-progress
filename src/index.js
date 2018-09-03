// @flow
const nullFunc = (r: any | null) => null;

type Folder<-R, T> = {
  +none?: () => T;
  +loading?: () => T;
  +success?: (r: R) => T;
  +failed?: () => T;
}

type ExtractResult = <R>(Progress<R>) => R;
export default class Progress<+R> {
  static none: Progress<any>;
  static inProgress: Progress<any>;
  static success: <T>(result: T)=> Progress<T>;
  static fail: (any) => Progress<any>;
  static all: <I: Array<Progress<mixed>>>(...I)=> Progress<$TupleMap<I, ExtractResult>>;

  error: any = undefined;

  get success(): boolean {
    return false;
  }

  get failed(): boolean {
    return false;
  }

  get isCompleted(): boolean {
    return this.failed || this.success;
  }

  get inProgress(): boolean {
    return false;
  }

  get isStarted(): boolean {
    return this.inProgress || this.isCompleted;
  }

  get isNone(): boolean {
    return !this.isStarted;
  }

  map<T>(mapper: (r: R) => T): Progress<T> {
    return (this: Progress<any>);
  }

  flatMap<T>(mapper: (r: R) => Progress<T>): Progress<T> {
    return (this: Progress<any>);
  }

  fold<T>(folder: Folder<R, T>): T | null {
    return (folder.none || nullFunc)();
  }

  ifSuccess<T>(func: (r: R) => T): T | null {
    return this.fold({ success: func })
  }

  get result(): R | void {
    return undefined;
  }
}

class InProgress extends Progress<any> {
  get inProgress(): boolean {
    return true;
  }

  fold<T>(folder: Folder<any, T>): T | null {
    return (folder.loading || nullFunc)();
  }
}

class Success<R> extends Progress<R> {
  _result: R;

  constructor(result: R) {
    super();
    this._result = result;
  }

  get success(): boolean {
    return true;
  }

  get result(): R {
    return this._result;
  }

  fold<T>(folder: Folder<$ReadOnly<R>, T>): T | null {
    return (folder.success || nullFunc)((this._result: any));
  }

  map<T>(mapper: (r: R) => T): Progress<T> {
    return new Success(mapper(this._result));
  }

  flatMap<T>(mapper: (r: R) => Progress<T>): Progress<T> {
    return mapper(this.result);
  }
}

class Failed extends Progress<any> {
  constructor(error?: any) {
    super();
    this.error = error;
  }

  get failed(): boolean {
    return true;
  }

  fold<T>(folder: Folder<any, T>): T | null {
    return (folder.failed || nullFunc)();
  }
}

Progress.none = new Progress();
Progress.inProgress = new InProgress();
Progress.success = <R>(result: R): Progress<R> => new Success(result);
Progress.fail = (error: any) => new Failed(error);
Progress.all = (...targets: Progress<mixed>[]) =>
  (targets.find(p => p.failed) ||
  targets.find(p => p.inProgress) ||
  targets.find(p => p === Progress.none) ||
  Progress.success(targets.map(p => p.result)): Progress<any>);

const action = (type, progress, extras) => ({ ...extras, type, progress });

export const { none, inProgress, success, fail, all } = Progress;
export const thunkProgress = <R>(type: string, promise: Promise<R>, extras: any) => (dispatch: any => void) => {
  dispatch(action(type, Progress.inProgress, extras));
  return promise
    .then(result => {
      dispatch(action(type, Progress.success(result), extras));
      return result;
    })
    .catch(error => {
      dispatch(action(type, Progress.fail(error), extras));
      return Promise.reject(error);
    });
};