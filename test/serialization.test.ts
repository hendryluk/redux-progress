import * as Progress from '../src/redux-progress'

it('serializes Success as expected', () => {
  expect(JSON.stringify(Progress.success({ x: 1 }))).toEqual(
    JSON.stringify({
      type: 'success',
      _result: {
        x: 1
      }
    })
  )
})

it('serializes Failed as expected', () => {
  const error = new Error('abc')

  expect(JSON.stringify(Progress.failed(error))).toEqual(
    JSON.stringify({
      type: 'failed',
      error
    })
  )
})

it('serializes InProgress as expected', () => {
  expect(JSON.stringify(Progress.inProgress)).toEqual(
    JSON.stringify({
      type: 'inProgress'
    })
  )
})
it('serializes InProgress as expected', () => {
  it('serializes None as expected', () => {
    expect(JSON.stringify(Progress.none)).toEqual(
      JSON.stringify({
        type: 'none'
      })
    )
  })
  expect(JSON.stringify(Progress.inProgress)).toEqual(
    JSON.stringify({
      type: 'inProgress'
    })
  )
})

it('serializes None as expected', () => {
  expect(JSON.stringify(Progress.none)).toEqual(
    JSON.stringify({
      type: 'none'
    })
  )
})
