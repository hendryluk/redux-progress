// @flow
const nullFunc = (r: any|null) => null;

type Folder<R, T> = {
  none?: () => T;
  loading?: () => T;
  success?: (r: R) => T;
  failed?: () => T;
}

export default class Progress<R> {
  static none: Progress<any> = new Progress();
  static inProgress: InProgress;
  static success = <X>(result: X) => new Success(result);
  static fail = (error: any) => new Failed(error);

  error: any = undefined;

  get success(): boolean {
    return false;
  }

  get failed(): boolean {
    return false;
  }

  get inProgress(): boolean {
    return false;
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

  get result(): R | void { return undefined; }
  get fieldErrors() {
    return {};
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
Progress.inProgress = new InProgress();

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

  fold<T>(folder: Folder<R, T>): T | null {
    return (folder.success || nullFunc)(this._result);
  }

  map<T>(mapper: (r: R) => T): Progress<T> {
    return new Success(mapper(this._result));
  }
  flatMap<T>(mapper: (r: R) => Progress<T>): Progress<T> {
    return mapper(this.result);
  }
}

class Failed<E> extends Progress<any> {
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

  get fieldErrors() {
    return this.error.fieldErrors || {};
  }
}

const action = (type, progress, extras) => ({ ...extras, type, progress });

export const thunkProgress = <R>(type: string, promise: Promise<R>, extras: any) => (dispatch: any=>void) => {
  dispatch(action(type, Progress.inProgress, extras));
  return promise
    .then(result => dispatch(action(type, Progress.success(result), extras)))
    .catch(error => dispatch(action(type, Progress.fail(error), extras)));
};