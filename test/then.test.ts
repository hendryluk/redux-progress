import * as Progress from '../src/redux-progress'

const mapper = (r: number) => r + 5;

it('maps correctly a Resolved progress', () => {
  expect(Progress.resolve(10).then(mapper)).toEqual(Progress.resolve(15))
});

it('identity mapper should return the same progress', () => {
  const p = Progress.resolve({});
  expect(p.then(r => r)).toBe(p);
});

it('maps correctly a Rejected progress', () => {
  expect(Progress.reject('x').then(mapper)).toEqual(Progress.reject('x'))
});

it('maps correctly an Pending', () => {
  expect(Progress.pending.then(mapper)).toEqual(Progress.pending)
});

it('maps correctly a None progress', () => {
  expect(Progress.none.then(mapper)).toEqual(Progress.none)
});

it('maps errors to Rejected progress', () => {
  const error = { foo: 'bar' };
  expect(Progress.resolve(10).then(() => {throw error;})).toEqual(Progress.reject(error));
});

it('can map to a progress result', () => {
  const result = Progress.resolve('abcd');
  expect(Progress.resolve(10).then(() => result)).toEqual(result);
});

it('can catch and map error', () => {
  expect(Progress.reject(10).then(r => r + 1, e => e + 2))
    .toEqual(Progress.resolve(12));
});

it('can catch and rethrow error', () => {
  expect(Progress.reject(10).then(r => r + 1, e => { throw e }))
    .toEqual(Progress.reject(10));
});
