import Progress from '../src/redux-progress'

const mapper = {
  none: () => 'was none',
  pending: () => 'was pending',
  resolved: (r: string) => `was resolved with ${r}`,
  rejected: (e: string) => `was rejected with ${e}`,
};

describe('none', () => {
  const progress = Progress.none;

  test('when matched, should map', () => {
    expect(progress.when(mapper)).toEqual(Progress.resolve('was none'));
  });

  test('when not matched, should remain', () => {
    expect(progress.when({})).toBe(progress);
  });
});

describe('pending', () => {
  const progress = Progress.pending;

  test('when matched, should map', () => {
    expect(progress.when(mapper)).toEqual(Progress.resolve('was pending'));
  });

  test('when not matched, should remain', () => {
    expect(progress.when({})).toBe(progress);
  });
});

describe('resolved', () => {
  const progress = Progress.resolve('foo');

  test('when matched, should map', () => {
    expect(progress.when(mapper)).toEqual(Progress.resolve('was resolved with foo'));
  });

  test('when not matched, should remain', () => {
    expect(progress.when({})).toBe(progress);
  });
});

describe('rejected', () => {
  const progress = Progress.reject('bar');

  test('when matched, should map', () => {
    expect(progress.when(mapper)).toEqual(Progress.resolve('was rejected with bar'));
  });

  test('when not matched, should remain', () => {
    expect(progress.when({})).toBe(progress);
  });
});
