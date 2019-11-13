import Progress, { from, Status } from '../src/redux-progress'

it('deserializes Success as expected', () => {
  expect(
    from({
      status: Status.resolved,
      value: {
        x: 1
      }
    })
  ).toEqual(Progress.resolve({ x: 1 }))
});

it('deserializes Failed as expected', () => {
  const error = new Error('abc')

  expect(
    from({
      status: Status.rejected,
      error
    })
  ).toEqual(Progress.reject(error))
});

it('deserializes InProgress as expected', () => {
  expect(
    from({
      status: Status.pending,
    })
  ).toEqual(Progress.pending)
});

it('deserializes None as expected', () => {
  expect(
    from({
      status: Status.none,
    })
  ).toEqual(Progress.none)
})
