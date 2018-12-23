type WhenMapper<R, T> = {
  none?: () => T | Progress<T>;
  pending?: () => T | Progress<T>;
  resolved?: (r: R) => T | Progress<T>;
  rejected?: (e: any) => T | Progress<T>;

  /* @deprecated Use pending */
  loading?: () => T | Progress<T>;
  /* @deprecated Use resolved */
  success?: (r: R) => T | Progress<T>;
  /* @deprecated Use rejected */
  failed?: (e: any) => T | Progress<T>;
}

export enum Status {
  resolved = 'resolved',
  rejected = 'rejected',
  pending = 'pending',
  none = 'none',
}

interface PendingData { status: Status.pending }
interface NoneData { status: 'none' }

const map = <T>(mapper?: (...r: any[]) => T, ...args: any[]): Progress<T> | undefined => {
  if(!mapper) {
    return undefined;
  }
  try {
    return Progress.resolve(mapper(...args))
  }
  catch(e) {
    return Progress.reject(e);
  }
};

export abstract class Progress<R> {
  static resolve = <R>(r: R | Progress<R>): Progress<R> => {
    if(r instanceof Progress) {
      return r;
    }
    return new Resolved(r);
  };
  static reject = (error: any): Progress<any> => new Rejected(error);
  static pending: Progress<any> = (() => {
    class Pending extends Progress<any> implements PendingData {
      readonly status = Status.pending;

      ifPending<T>(supplier: () => T | Progress<T>): Progress<T> {
        return map(supplier) || this as any;
      }
    }

    return new Pending()
  })();

  static none: Progress<any> = (() => {
    class None extends Progress<any> implements NoneData {
      readonly status = Status.none;

      ifNone<T>(supplier: () => T | Progress<T>): Progress<T> {
        return map(supplier) || this as any;
      }
    }

    return new None()
  })();

  static all = (...targets: Progress<unknown>[]): Progress<unknown> =>
    targets.find(p => p.isRejected) ||
    targets.find(p => p.isPending) ||
    targets.find(p => p.isNone) ||
    Progress.resolve(targets.map(p => p.value));

  static race = <T>(...targets: Progress<T>[]): Progress<T> =>
    targets.find(p => p.isCompleted) || targets.find(p => p.isPending) || targets[0] || Progress.none;

  abstract readonly status: Status;
  readonly value?: R;
  readonly error?: any;

  /* @deprecated Use then */
  map<T>(mapper: (r: R) => T): Progress<T> {
    // console.warn('Progress.map is deprecated. Use then');
    return this.then(mapper);
  }
  /* @deprecated Use then */
  flatMap<T>(mapper: (r: R) => T): Progress<T> {
    // console.warn('Progress.flatMap is deprecated. Use then');
    return this.then(mapper);
  }
  /* @deprecated Use pending */
  static get inProgress() {
    // console.warn('Progress.inProgress is deprecated. Use pending');
    return Progress.pending;
  }
  /* @deprecated Use pending */
  static success = <R>(r: R | Progress<R>): Progress<R> => {
    // console.warn('Progress.success is deprecated. Use resolve');
    return Progress.resolve(r);
  };
  /* @deprecated Use pending */
  static fail = (error: any): Progress<any> => {
    // console.warn('Progress.fail is deprecated. Use reject');
    return Progress.reject(error);
  };
  /* @deprecated Use isResolved */
  get success(): boolean {
    // console.warn('Progress.success is deprecated. Use isResolved');
    return this.isResolved
  }
  /* @deprecated Use isPending */
  get inProgress(): boolean {
    // console.warn('Progress.inProgress is deprecated. Use isPending');
    return this.isPending;
  }
  /* @deprecated Use isRejected */
  get failed(): boolean {
    // console.warn('Progress.failed is deprecated. Use isRejected');
    return this.isRejected;
  }
  /* @deprecated Use value */
  get result(): R | undefined {
    // console.warn('Progress.result is deprecated. Use value');
    return this.value;
  }
  /* @deprecated Use get */
  unwrap(): R {
    // console.warn('Progress.unwrap is deprecated. Use get');
    return this.get();
  }
  /* @deprecated Use then().value */
  ifSuccess<T>(mapper: (r: R) => T): T | null {
    // console.warn('Progress.ifSuccess is deprecated. Use then().value');
    return this.then(mapper).value || null;
  }
  /* @deprecated Use when().value */
  fold<T>(mapper: WhenMapper<R, T>): T | null {
    // console.warn('Progress.fold is deprecated. Use when().value');
    return this.when(mapper).value || null;
  }

  get isNone() : boolean {
    return this.status === Status.none;
  }

  get isPending(): boolean {
    return this.status === Status.pending;
  }

  get isResolved() : boolean {
    return this.status === Status.resolved;
  }

  get isRejected(): boolean {
    return this.status === Status.rejected;
  }

  get isCompleted(): boolean {
    return this.isRejected || this.isResolved
  }

  ifNone<T>(supplier?: () => T | Progress<T>): Progress<T> {
    return this as any;
  }

  ifPending<T>(supplier?: () => T | Progress<T>): Progress<T> {
    return this as any;
  }

  then<T>(mapper?: (r: R) => T | Progress<T>, errorMapper?: (e: any) => T): Progress<T> {
    return this as any
  }

  catch<T>(errorMapper?: (e: any) => T | Progress<T> | Progress<T>): Progress<T> {
    return this as any
  }

  finally<T>(supplier?: () => T | Progress<T>): Progress<T> {
    return this.then(supplier).catch(supplier);
  }

  when<T>(mapper: WhenMapper<R, T>): Progress<T> {
    return this.then(mapper.resolved || mapper.success)
      .catch(mapper.rejected || mapper.failed)
      .ifNone(mapper.none)
      .ifPending(mapper.pending || mapper.loading)
  }

  get(): R {
    throw new Error('Progress not completed')
  }
}

interface ResolvedData<R> {
  status: Status.resolved;
  value: R;
}
class Resolved<R> extends Progress<R> implements ResolvedData<R> {
  readonly status = Status.resolved;
  readonly value: R;

  constructor(result: R) {
    super();
    this.value = result
  }

  get(): R {
    return this.value
  }

  then<T>(mapper: (r: R) => T | Progress<T>): Progress<T> {
    return map(mapper, this.value) || this as any;
  }
}

interface RejectedData {
  status: Status.rejected;
  error: any;
}
class Rejected extends Progress<any> implements RejectedData {
  readonly status = Status.rejected;
  readonly error: any;

  constructor(error?: any) {
    super();
    this.error = error
  }

  get(): never {
    throw this.error
  }

  then<T>(mapper: (r: any) => T | Progress<T>, errorMapper?: (e: any) => T): Progress<T> {
    return this.catch(errorMapper);
  }

  catch<T>(mapper?: (r: any) => T | Progress<T>): Progress<T> {
    return map(mapper, this.error) || this as any;
  }
}

export type Data<R> = NoneData | PendingData | ResolvedData<R> | RejectedData;

export const from = <R>(
  serialized: Progress<R> | Data<R>
): Progress<R> => {
  if (serialized instanceof Progress) {
    return serialized
  }

  switch (serialized.status) {
    case Status.resolved:
      return Progress.resolve(serialized.value);
    case Status.rejected:
      return Progress.reject(serialized.error);
    case Status.pending:
      return Progress.pending;
    case Status.none:
      return Progress.none;
    default:
      throw new Error(`Unknown Progress type: ${(serialized as any).status}`)
  }
}

export const thunk = <R>(type: string, promiseOrFunc: Promise<R> | (() => Promise<R>), extras: any) => async (
  dispatch: (a: any) => void
) => {
  const action = (type: any, progress: any, extras: any) => ({ ...extras, type, progress });
  dispatch(action(type, Progress.pending, extras));

  let progress;
  try {
    const promise = (promiseOrFunc instanceof Function) ? promiseOrFunc() : promiseOrFunc;
    const result = await promise;
    progress = Progress.resolve(result);
  } catch (error) {
    progress = Progress.reject(error);
  }
  dispatch(action(type, progress, extras));
  return progress
};

/* @deprecated Use thunk */
export const thunkProgress = thunk;

export default Progress
