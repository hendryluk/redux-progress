import * as Progress from '../src/redux-progress'

it('should return a successful progress if present', () => {
  expect(Progress.race(Progress.resolve('x'), Progress.pending)).toEqual(Progress.resolve('x'))
})

it('should return an InProgress if no success present', () => {
  expect(Progress.race(Progress.none, Progress.pending)).toEqual(Progress.pending)
})

it('should return none if no complete progress present', () => {
  expect(Progress.race(Progress.none)).toEqual(Progress.none)
})

it('should return none with no args', () => {
  expect(Progress.race()).toEqual(Progress.none)
})
