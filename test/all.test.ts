import * as Progress from '../src/redux-progress'

it('returns Success when no Progress is passed', () => {
  expect(Progress.all()).toEqual(Progress.success([]))
})

it('returns None when a none is provided', () => {
  expect(Progress.all(Progress.none)).toEqual(Progress.none)
})

it('returns Failed when a Failed is present', () => {
  expect(
    Progress.all(Progress.none, Progress.inProgress, Progress.success({}), Progress.failed('e'))
  ).toEqual(Progress.failed('e'))
})

it('returns a InProgress when present', () => {
  expect(Progress.all(Progress.none, Progress.inProgress, Progress.success({}))).toEqual(
    Progress.inProgress
  )
})

it('returns an array of Success', () => {
  expect(Progress.all(Progress.success('a'), Progress.success('b'), Progress.success('c'))).toEqual(
    Progress.success(['a', 'b', 'c'])
  )
})
