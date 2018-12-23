#redux-progress
This library helps represent the state of asynchronous data into your application's state.
 
##Install
`yarn add redux-progress`

or

`npm install --save redux-progress`

##Use

In your state definition:

```
import * as Progress from 'redux-progress';

type User = {
  name: string,
}

type State = {
  users: Progress.AsyncData<User[]>,
}
```

In your action:

```
import * as Progress from 'redux-progress';

const FETCH_USERS = 'FETCH_USERS';
const fetchUsers = Progress.thunk(FETCH_USERS, fetch('/users'));
```

In your reducer:
```
import * as Progress from 'redux-progress';

const usersReducer = (state = Progress.none, action) => {
  if(action.type === 'FETCH_USERS')
      return action.progress;
  return state; 
}
```

Use it:
