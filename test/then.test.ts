import * as Progress from '../src/redux-progress'

const mapper = (r: number) => r + 5

it('maps correctly a Success progress', () => {
  expect(Progress.success(10).then(mapper)).toEqual(Progress.success(15))
})

it('identity mapper should return the same progress', () => {
  const p = Progress.success({})
  expect(p.then(r => r)).toBe(p)
})

it('maps correctly a Failed progress', () => {
  expect(Progress.failed('x').then(mapper)).toEqual(Progress.failed('x'))
})

it('maps correctly an InProgress', () => {
  expect(Progress.inProgress.then(mapper)).toEqual(Progress.inProgress)
})

it('maps correctly a None progress', () => {
  expect(Progress.none.then(mapper)).toEqual(Progress.none)
})
