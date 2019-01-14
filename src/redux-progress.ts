/* @deprecated Use WhenMapper */
type FoldMapper <R, T> = {
  none?: () => Resolvable<T>;
  loading?: () => Resolvable<T>;
  success?: (r: R) => Resolvable<T>;
  failed?: (e: any) => Resolvable<T>;
}

type WhenMapper<R, T> = {
  none?: () => Resolvable<T>;
  pending?: () => Resolvable<T>;
  resolved?: (r: R) => Resolvable<T>;
  rejected?: (e: any) => Resolvable<T>;
}

export enum Status {
  resolved = 'resolved',
  rejected = 'rejected',
  pending = 'pending',
  none = 'none',
}

type Resolvable<T> = T | Progress<T>;

interface PendingData { status: Status.pending }
interface NoneData { status: 'none' }

const map = <R, T>(self: Progress<R>, mapper?: () => Resolvable<T>): Progress<T> => {
  if(!mapper) {
    return self as any;
  }

  let result;
  try {
    result = Progress.resolve(mapper())
  }
  catch(e) {
    result = Progress.reject(e);
  }

  return self.equals(result) ? self : result;
};

export abstract class Progress<R> {
  static resolve = <R>(r: Resolvable<R>): Progress<R> => {
    if(r instanceof Progress) {
      return r;
    }
    return new Resolved(r);
  };
  static reject = (error: any): Progress<any> => new Rejected(error);
  static pending: Progress<any> = (() => {
    class Pending extends Progress<any> implements PendingData {
      readonly status = Status.pending;

      ifPending<T>(supplier?: () => Resolvable<T>): Progress<T> {
        return map(this, supplier);
      }

      when<T>(mapper: WhenMapper<any, T>): Progress<T> {
        return this.ifPending(mapper.pending);
      }
    }

    return new Pending()
  })();

  static none: Progress<any> = (() => {
    class None extends Progress<any> implements NoneData {
      readonly status = Status.none;

      ifNone<T>(supplier?: () => Resolvable<T>): Progress<T> {
        return map(this, supplier);
      }

      when<T>(mapper: WhenMapper<any, T>): Progress<T> {
        return this.ifNone(mapper.none);
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
    targets.find(p => p.isFulfilled) || targets.find(p => p.isPending) || targets[0] || Progress.none;

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
  /* @deprecated Use resolve */
  static success = <R>(r: Resolvable<R>): Progress<R> => {
    // console.warn('Progress.success is deprecated. Use resolve');
    return Progress.resolve(r);
  };
  /* @deprecated Use reject */
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
  /* @deprecated Use isFulfilled */
  get isCompleted() : boolean {
    // console.warn('Progress.isCompleted is deprecated. Use isFulfilled');
    return this.isFulfilled;
  }
  /* @deprecated Use get */
  unwrap(): R {
    // console.warn('Progress.unwrap is deprecated. Use get');
    return this.get();
  }
  /* @deprecated Use then().value */
  ifSuccess<T>(mapper: (r: R) => Resolvable<T>): T | null {
    // console.warn('Progress.ifSuccess is deprecated. Use then().value');
    return this.then(mapper).value || null;
  }
  /* @deprecated Use when().value */
  fold<T>(mapper: FoldMapper<R, T>): T | null {
    // console.warn('Progress.fold is deprecated. Use when().value');
    return this.when({
      none: mapper.none,
      pending: mapper.loading,
      resolved: mapper.success,
      rejected: mapper.failed,
    }).value || null;
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

  get isFulfilled(): boolean {
    return this.isRejected || this.isResolved
  }

  ifNone<T>(supplier?: () => Resolvable<T>): Progress<T> {
    return this as any;
  }

  ifPending<T>(supplier?: () => Resolvable<T>): Progress<T> {
    return this as any;
  }

  then<T>(): Progress<T>;
  then<T>(mapper?: (r: R) => Resolvable<T>): Progress<T>;
  then<T1, T2>(mapper?: (r: R) => Resolvable<T1>, errorMapper?: (e: any) => Resolvable<T2>): Progress<T1 | T2>;
  then<T1, T2>(mapper?: (r: R) => Resolvable<T1>, errorMapper?: (e: any) => Resolvable<T2>): Progress<T1 | T2> {
    return this as any
  }

  catch<T>(errorMapper?: (e: any) => Resolvable<T>): Progress<T> {
    return this as any
  }

  finally<T>(supplier?: () => Resolvable<T>): Progress<T> {
    return this.then(supplier, supplier);
  }

  abstract when<T>(mapper: WhenMapper<R, T>): Progress<T>;

  get(): R {
    throw new Error('Progress not completed')
  }

  equals(progress: Progress<any>): boolean {
    return progress &&
      progress instanceof Progress &&
      this.status === progress.status &&
      this.value === progress.value &&
      this.error === progress.error;
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

  then<T>(mapper?: (r: R) => Resolvable<T>): Progress<T> {
    return map(this, mapper && (()=>mapper(this.value)));
  }

  when<T>(mapper: WhenMapper<any, T>): Progress<T> {
    return this.then(mapper.resolved);
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

  then<T>(mapper?: (r: any) => Resolvable<any>, errorMapper?: (e: any) => Resolvable<T>): Progress<T> {
    return this.catch(errorMapper);
  }

  catch<T>(mapper?: (r: any) => Resolvable<T>): Progress<T> {
    return map(this, mapper && (()=>mapper(this.error)));
  }

  when<T>(mapper: WhenMapper<any, T>): Progress<T> {
    return this.catch(mapper.rejected);
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
};

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

/* @deprecated */
export const { inProgress, success, fail } = Progress;
export const { none, pending, resolve, reject, all, race } = Progress;
