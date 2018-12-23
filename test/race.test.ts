import * as Progress from '../src/redux-progress'

it('should return a successful progress if present', () => {
  expect(Progress.race(Progress.success('x'), Progress.inProgress)).toEqual(Progress.success('x'))
})

it('should return an InProgress if no success present', () => {
  expect(Progress.race(Progress.none, Progress.inProgress)).toEqual(Progress.inProgress)
})

it('should return none if no complete progress present', () => {
  expect(Progress.race(Progress.none)).toEqual(Progress.none)
})

it('should return none with no args', () => {
  expect(Progress.race()).toEqual(Progress.none)
})
