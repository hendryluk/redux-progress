# Redux Progress

Redux model to capture states of asynchronous operations (i.e. promises)

## Usage

After you install this module (probably from npm) you can import base class called `Progress`

```javascript
import Progress from 'redux-progress';
```

`Progress` class provides useful utilities to handle different states in your application.

In addition you can import Progress static props and methods as separate functions.

```javascript
import {none, inProgress, success, fail, all} from 'redux-progress';
```

### Create instance
You can create instance through one of this static methods.  
`static success: <T>(result: T)=> Progress<T>`  
`static fail: (any) => Progress<any>;`

```javascript
const success = Progress.success({});
const fail = Progress.fail({a: '1'});
```

Once instance is created there is no way to change object status (e.g. success or failed).
Two more statuses are available through static properties `Progress.inProgress` and `Progress.none`.
Basically those properties is `Progress` instances with predefined statuses.


### Instance properties

#### success
`Boolean`. True if the instance object has `success` status.

#### failed
`Boolean`. True if the instance object has `failed` status.

#### isCompleted
`Boolean`. True if the instance object has `success` or `failed` status.

#### inProgress
`Boolean`. True if the instance object has `inProgress` status.

#### isStarted
`Boolean`. True if the instance object has `inProgress` or `isCompleted` status.

#### isNone
`Boolean`. True if the instance object has no setted status
(true if `isStarted` === false).

#### result
`R | void`. Contains value of success operation or undefined.

#### error
`R | void`. Contains error value of failed operation.


### Instance methods

#### map
`map<T>(mapper: (r: R) => T): Progress<T>`  
Allows to map over a value stored inside `Progress` object. Mapper applied only to successive instances.
Returns the new `Progress` object with transformed value inside.

```javascript
Progress
  .success(10)
  .map(x => x + 5)
  .result; // => 15

Progress
  .fail('Failed')
  .map(x => x + 5)
  .result; // => Failed
```


#### flatMap
`flatMap<T>(mapper: (r: R) => Progress<T>): Progress<T>`  
Similar to `map` method, except that mapper function should return `Progress` instance.
Useful for chaining.
Mapper applied only to successive instances.

```javascript
Progress
  .success(10)
  .flatMap(x => Progress.success(x + 5))
  .result; // => 15
```


#### fold
`fold<T>(folder: Folder<R, T>): T | null`  
Fold receives object (Folder) that specifies different actions for different `Progress` states.
Useful to applying side effects and reduce boilerplate code.

```javascript
const requestFolder = {
  success: (x) => console.log('Result is - ', x),
  failed: (reason) => console.log('Failed to get result. ', reason),
  none: () => console.log('There is no data')
};

const makeRequest = () => {
  return fetch('/request-url')
    .then(request => request.json())
    .then(data => data ? Progress.success(data) : Progress.none)
    .catch(error => Progress.fail(error));
};

makeRequest()
  .fold(requestFolder); // => logs result or error or no data message
```


#### ifSuccess
`ifSuccess<T>(func: (r: R) => T): T | null`  
Works similar to `fold` method, but handle the only successive case.
Basically `.ifSuccess(func)` it's a shortcut for `.fold({success: func})`.

```javascript
Progress
  .success(10)
  .ifSuccess(x => x + 5); // => 15

Progress
  .fail('Some error')
  .ifSuccess(x => x + 5); // null
```


#### unwrap
`unwrap(): R`  
Extract the value from `Progress` object.

```javascript
Progress
  .success(10)
  .unwrap(); // => 15

Progress
  .fail('Some error')
  .unwrap(); // => Some error
```


### Composition
`Progress` class has two static methods for composing many instances together.
API pretty similar to `Promise.all` and `Promise.race` methods.


#### all
`all: <I: Array<Progress<mixed>>>(...I)=> Progress<$TupleMap<I, ExtractResult>>`  
Returns first `failed` or `inProgress` or `none` item from passed items.
If all items are `success` then will return successive `Progress` object with an array of all items values

```javascript
Progress.all(
  Progress.success({ a: "1" }),
  Progress.success({ b: "2" })
); // => the same that Progress.success([ { a: "1" }, { b: "2" } ])

Progress.all(
  Progress.success({}),
  Progress.fail({a: '1'}),
  Progress.inProgress
); // => the same that Progress.fail({a: '1'})
```


#### race
`race: <T>(...Progress<T>[])=> Progress<T>`  
Returns first complete item (`failed` or `success`).
If there are no complete items then will return the first item from arguments.
If arguments empty will return `Progress.none`.

```javascript
Progress.race(
  Progress.success({ a: "1" }),
  Progress.success({ b: "2" })
); // => the same that Progress.success({ a: "1" })
```


## Usage with redux

 To wire up those utilities with redux you can use the `thunkProgress` function inside your actions.
 You can use this in pair with redux-thunk middleware.

 ```javascript
import {thunkProgress} from 'redux-progress';
import {createStore, combineReducers, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';

// Reducer to handle async states
const asyncReducer = (state = {}, {type, progress}) => {
  switch (type) {
    case 'MY_ASYNC_ACTION_NAME':
      return {
        loading: progress.inProgress,
        result: progress.result,
        error: progress.error
      };

    default:
      return state;
  }
};

const store = createStore(
  combineReducers({asyncReducer}),
  applyMiddleware(thunk)
);

// Action creator
const doAsyncAction = () => {
  return thunkProgress(
    'MY_ASYNC_ACTION_NAME',
    fetch('/my-url').then(response => response.json())
  );
};

// Inside React component
dispatch(doAsyncAction());
 ```

Also could be useful to save the `Progress` instance to the state and use all
available instances methods inside redux containers or components.

```javascript
const asyncReducer = (state = {}, {type, userProgress}) => {
  switch (type) {
    case 'SET_USER':
      return {
        user: userProgress
      };

    default:
      return state;
  }
};

// Inside React component or redux container
const MyComponent = ({userName}) => {
  return (
    <div>
      {userName.fold({
         success: (u) => <div className="user-name">{u}</div>,
         failed: (error) => <div className="user-error">{error}</div>,
         loading: () => <span>"Loading ..."</span>
       })}
    </div>
  );
};

export default connect(
  state => ({
    userName: state.user.map(u => u.name.toUpperCase())
  })
)(MyComponent);
```
