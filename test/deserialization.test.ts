import * as Progress from '../src/redux-progress'

it('deserializes Success as expected', () => {
  expect(
    Progress.from({
      type: 'success',
      _result: {
        x: 1
      }
    })
  ).toEqual(Progress.success({ x: 1 }))
})

it('deserializes Failed as expected', () => {
  const error = new Error('abc')

  expect(
    Progress.from({
      type: 'failed',
      error
    })
  ).toEqual(Progress.failed(error))
})

it('deserializes InProgress as expected', () => {
  expect(
    Progress.from({
      type: 'inProgress'
    })
  ).toEqual(Progress.inProgress)
})
it('deserializes InProgress as expected', () => {
  it('deserializes None as expected', () => {
    expect(
      Progress.from({
        type: 'none'
      })
    ).toEqual(Progress.none)
  })
  expect(
    Progress.from({
      type: 'inProgress'
    })
  ).toEqual(Progress.inProgress)
})

it('deserializes None as expected', () => {
  expect(
    Progress.from({
      type: 'none'
    })
  ).toEqual(Progress.none)
})
