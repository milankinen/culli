# Getting rid of `switch-case` blocks

You may have noticed that having `switch-case` blocks inside model's reducer functions
is syntactically pretty heavy structure and contains lot of unnecessary repetition.
Luckily there are few ways to replace the `switch-case` and preserve the semantics
of your reducer function.

## Recommended way: `byType` helper function

### The magic behind `byType`

This is battle-proven and extremely simple solution. It uses the fact that every action
contains the `type` field, which is a string. Let's take a simple example:

```js
const dispatch = actions.reduce((state, action) => {
  switch(action.type) {
    case "ADD": 
      return state + action.payload
    case "SUB":
      return state - action.payload
    default:
      return state
  }
})
```

Let's split those actions into several mini-reducers:
```js
const dispatch = actions.reduce((state, action) => {
  const reducer = ((type) => {
    switch(type) {
      case "ADD": 
        return add
      case "SUB":
        return sub
      default:
        return noop
    }
  })(action.type)
  return reducer(state, action.payload)
  
  function add(state, payload) {
    return state + payload
  }
  function sub(state, payload) {
    return state - payload
  }
  function noop(state) {
    return state
  }
})
```

But we can go further. Because `action.type` is a string, we can assign the mini-reducers
behind object keys that correspond to `action.type` values and retrieve the used mini-reducer
by using that lookup object:

```js
const dispatch = actions.reduce((state, action) => {
  const reducers = {
    "ADD": add,
    "sub": sub
  }
  const reducer = reducers[action.type] || noop
  return reducer(state, action.payload)
  
  function add(state, payload) {
    return state + payload
  }
  function sub(state, payload) {
    return state - payload
  }
  function noop(state) {
    return state
  }
})
```

We can still go further! Let's make our reducer a [higher-order function](https://en.wikipedia.org/wiki/Higher-order_function)
that takes those reducers from outside and name it `byType`:

```js
function byType(reducers) {
  return (state, action) => {
    const reducer = reducers[action.type] || noop
    return reducer(state, action.payload)
  }
  function noop(state) {
    return state
  }
}
```

And there we go! We can use our `byType` function to construct `switch-case` free 
reducer for any component`

```js
import {byType} from "./utils"
...

const dispatch = actions.reduce(byType({
  "ADD": (state, payload) => state + payload,
  "SUB": (state, payload) => state - payload
})
```


### The "official" version

Now that you're familiar with the "magic" behind `byType`, you can use it safely with any project.
In fact you don't even need to create this `byType` helper function by yourself - `@culli/store` 
provides it as an export!

```js
import {byType} from "@culli/store"
...

const dispatch = actions.reduce(byType({
  "ADD": (state, payload) => state + payload,
  "SUB": (state, payload) => state - payload
})
```

Happy coding! 


## Alternative way: dispatch reducer functions as actions

Another way to remove `switch-case` blocks from the state reducer is to use `cycle-onionify` 
approach and pass mini-reducers functions as actions. However, this way limits the potential of
actions because they are not serializable anymore: for example Redux Devtools are not available
anymore and more sophisticated storage methods like WebSocket sync become more complex.

The "mini-reducer" approach is quite straightforward. Use it if you understand the consequences:

```js
function model({value, actions}) {
  // action is now mini-reducer function taking the current state and producing new state
  const dispatch = actions.reduce((s, a) => a(s))
  ...
}

function intent(DOM) {
  ...
  return O.merge(
    incClick$.map(() => state => state + 1),
    decClick$.map(() => state => state - 1)
  )
}
```

