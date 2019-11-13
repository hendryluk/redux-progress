import Progress from '../src/redux-progress'

it('returns Success when no Progress is passed', () => {
  expect(Progress.all()).toEqual(Progress.resolve([]))
})

it('returns None when a none is provided', () => {
  expect(Progress.all(Progress.none)).toEqual(Progress.none)
})

it('returns Failed when a Failed is present', () => {
  expect(
    Progress.all(Progress.none, Progress.pending, Progress.resolve({}), Progress.reject('e'))
  ).toEqual(Progress.reject('e'))
})

it('returns a InProgress when present', () => {
  expect(Progress.all(Progress.none, Progress.pending, Progress.resolve({}))).toEqual(
    Progress.pending
  )
})

it('returns an array of Success', () => {
  expect(Progress.all(Progress.resolve('a'), Progress.resolve('b'), Progress.resolve('c'))).toEqual(
    Progress.resolve(['a', 'b', 'c'])
  )
})
