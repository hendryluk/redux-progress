import * as Progress from '../src/redux-progress'

it('serializes Success as expected', () => {
  expect(JSON.stringify(Progress.resolve({ x: 1 }))).toEqual(
    JSON.stringify({
      status: 'resolved',
      value: {
        x: 1
      }
    })
  )
})

it('serializes Failed as expected', () => {
  const error = new Error('abc')

  expect(JSON.stringify(Progress.reject(error))).toEqual(
    JSON.stringify({
      status: 'rejected',
      error
    })
  )
})

it('serializes InProgress as expected', () => {
  expect(JSON.stringify(Progress.pending)).toEqual(
    JSON.stringify({
      status: 'pending'
    })
  )
})

it('serializes None as expected', () => {
  expect(JSON.stringify(Progress.none)).toEqual(
    JSON.stringify({
      status: 'none'
    })
  )
})
