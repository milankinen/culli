# @culli/store

[![npm](https://img.shields.io/npm/v/@culli/store.svg?style=flat-square)](https://www.npmjs.com/package/@culli/store)

Utility for Cycle state management and storage.

## Motivation

The traditional Cycle state management relies on local state encoded into streams.
This enables very simple and elegant implementations of simple applications. However,
when application's complexity increases and parent-child-parent dependencies are
required, the traditional state management easily turns to very complex and cumbersome.
The goal of `@culli/store` is to provide familiar and straightforward way to managed
your Cycle application state in a way that scales from a tiny counter app to enterprise
portals with tens of thousands of LOC!


## How does it work?

If you've used [`redux`](http://redux.js.org/) or my previous work 
[`stanga`](https://github.com/milankinen/stanga), you should be familiar with this 
package as well. `@culli/store` is just another CycleJS driver whose working principles 
are the following:

  * **State is separated from application logic.** In `@culli/store`, application state
    "lives" outside the app. Application can read the state by using `Store` source,
    provided by `main`, and update the state by dispatching actions via `Store` sink. Whether
    the state comes from Store driver or parent component, it's irrelevant to the component.
    
    
  * **Component defines itself, who does it modify the state.** Although the state lives
    physically outside the component, component defines itself how and when it modifies 
    its state. This makes `@culli/store` completely [fractal](http://staltz.com/unidirectional-user-interface-architectures.html).
    The state modifications are done in exactly same and familiar way as they 
    are done in Redux: by using [reducer pattern](http://redux.js.org/docs/basics/Reducers.html).
    Component defines a reducer function `(state, action) => state` which receives the
    current state and the dispatched action and calculates the new state based on them.
    
  * **Component can slice its state.** Many times it's wise to split your component
    into smaller sub-components. However, in order to make those sub-components generic and
    reusable, the can't operate the whole state. That's why `@culli/store` stores have
    easy and concise way to focus on certain sub-state so that the focused sub-state has
    exactly same features as the parent store, but it can access only the focused part
    of the state. This focused sub-state (or sub-store) can be then passed to child 
    components as their store (remember that for component, the origin of its `Store` 
    is irrelevant!).
    
  * **`Store` is only an interface for the actual storage.** *"`@culli/store` does not
    have any side-effects, so it can't be a driver!"*, enthusiastics might yell. That is
    not actually true. To be precise, `Store` is a *meta-driver*. It's agnostic about
    how the state is stored: instead it takes a `Storage` that defines how the state
    is persited. In some cases in-memory persistence is enough, whereas in another cases
    there might be need for local storage or even more sophisticated state synchronization
    with server or other clients (e.g. by using WebSockets). So `@culli/store` **can**
    have side-effects.


## Some code, please!

### Basic usage

Here is the traditional counter app written with `@culli/store` (and with `most` but
`@culli/store` is compatible with any Cycle Diversity supported streaming library):
```js
import * as O from "most"
import {run} from "@cycle/most-run"
import {makeDOMDriver as DOM} from "@cycle/dom"
import Store, {Memory} from "@culli/store"

run(main, {
  DOM: DOM("#app"),
  Store: Store(Memory({num: 0}))
})



function main({DOM, Store}) {
  const {dispatch, props} = model(Store)
  const vdom = view(props)
  const actions = intent(DOM)

  return {
    DOM: vdom,
    Store: dispatch(actions)
  }


  function model({actions, value}) {
    const dispatch = actions.reduce((state, action) => {
      switch (action.type) {
        case "INC":
          return {...state, num: state.num + 1}
        case "DEC":
          return {...state, num: state.num - 1}
        default:
          return state
      }
    })

    return {
      dispatch,
      props: {
        num: value.map(v => v.num)
      }
    }
  }

  function view({num}) {
    return num.map(num => 
      h("div", [
        h("h1", ["Counter: ", num]),
        h("div", [
          h("button.inc", "Increment"),
          h("button.dec", "Decrement")
        ])
      ]))
  }

  function intent(DOM) {
    const incrementActions = DOM.select(".inc")
      .events("click")
      .map(() => ({type: "INC"})
    const decrementActions = DOM.select(".dec")
      .events("click")
      .mpa(() => ({type: "DEC"})

    return O.merge(incrementActions, decrementActions)
  }
}
```

- - -

Okay, let's look at the code line by line.

```js
import Store, {Memory} from "@culli/store"
```
Here we import all dependencies that are needed to initilize store driver. `@culli/store` 
provides the driver factory function as its default import. It also provides some built-in 
storages that can be used for state persistence. In this example we are using in-memory
`Memory` storage.

```js
run(main, {
  DOM: DOM("#app"),
  Store: Store(Memory({num: 0}))
})
```
Here we initialize the drivers and start the app just like any other CycleJS application.
New store driver can be initialized by calling the driver factory function we imported
few lines above, and giving a valid storage to it. Storages are basically just functions
`(Observable<Action>) => Observable<State>`. Now we create an in-memory storage and give
an initial value to.

```js
function main({DOM, Store}) {
  ...
```
Because we defined `Store` as a driver, we can now access it's utilities from sources.
And thanks to Cycle Diversity, those utilities are available for your favourite streaming
library as well!

```js
function model({actions, value}) {
  ...
```
`Store` driver source has two public properties: `actions` and `value`. `actions` is an
object that represent the actions dispatched by this component. `value` is just a normal
`Observable` that represents the current state of store, thus you can use this observable
like you'd use any other observable in your Cycle app.

```js
const dispatch = actions.reduce((state, action) => {
  ...
})
```
This is where you define how the component state can be modified. If you've used Redux
before, you can notice that the pattern is exactly same as described in 
[Redux docs](http://redux.js.org/docs/basics/Store.html) (`{dispatch} = createStore(reducer)`
vs. `dispatch = actions.reduce(reducer)`). The reducer of `actions.reduce` is invoked
*every time* when your component dispatches an action. We've used now the traditional
Redux boilerplate with `action.type` but it doesn't necessary need to be like that -
`@culli/store` is unopinionated how the actions and reducers are implemented.

You may also notice that `actions.reduce` returns a `dispatch` function. This is also
similar to its Redux counterpart: you must dispatch the component actions by using
this function (explained later in detail).

```js
return {
  dispatch,
  props: {
    num: value.map(v => v.num)
  }
}
```
After defining the reducer function, we must define the actual data model. If you've
used React+Redux before, you've probably passed some props to your render method. Essentially,
`view` in Cycle apps is same as `render` in React. Thus let's return some "props" from
our model as well! 

As we learned before, store's `value` is just like any other observable so we can map
or filter or debounce it (or do anything that your streaming library supports). Because
the counter state has schema `{num: <int>}`, we must extract the raw number by using `.map`.

Finally we can return both props and `dispatch` function that we got from `actions.reduce`.

```js
function view({num}) {
  return num.map(num => 
    h("div", ...))
}
```
If you've read Cycle tutorials, there is absolutely nothing new here! We're just using
the model to build components virtual dom stream.

```js
function intent(DOM) {
  const incrementActions = DOM.select(".inc")
    .events("click")
    .map(() => ({type: "INC"})
  const decrementActions = DOM.select(".dec")
    .events("click")
    .mpa(() => ({type: "DEC"})

  return O.merge(incrementActions, decrementActions)
}
```
Although we've already defined the reducer function, the state can't be changed without
the actions. Like everything else in Cycle, also `@culli/store` actions are modelled
(surprise!) as streams. `@culli/store` is unopinionated how those action streams are
generated: they can come from DOM events, WebSocket events or keyboard/mouse events.

**NOTE:** This example is pretty simple because action streams are generated from 
DOM events only. However, in more complex cases the action stream generation may require 
also access to the current state. Luckily this is not a problem: note that we can access
also `props` from this point.

```js
return {
  DOM: vdom,
  Store: dispatch(actions)
}
```
The final step in your component is to dispatch the action streams so that they
can be sent to the reducer function. This is done by using the `dispatch` function
we received before: `dispatch` takes the action stream and converts it to a stream
that can be sent to Store driver via sink.


### Child components

Components should be small and has only one responsibility. But how to keep components
small when the state grows. `@culli/store` provides a simple solution that makes possible
to slice the state into smaller sub-states, that can be given to child components so that
the child components don't need to know the whole application state.

Let's go through how to split your application with `@culli/store`:

```js
import * as O from "most"
import isolate from "@cycle/isolate"
import {run} from "@cycle/most-run"
import {makeDOMDriver as DOM} from "@cycle/dom"
import Store, {Memory} from "@culli/store"

import {main as Counter} from "./previous-example"


run(main, {
  DOM: DOM("#app"),
  Store: Store(Memory({text: "", a: {num: 0}, b: {num: 0}}))
})


function main({DOM, Store}) {
  const {dispatch, props} = model(Store)
  const {vdom, childActions} = view(props)
  const actions = intent(DOM)

  return {
    DOM: vdom,
    Store: O.merge(dispatch(actions), childActions)
  }


  function model({actions, value}) {
    const dispatch = actions.reduce((state, action) => {
      switch (action.type) {
        case "SET_TEXT":
          return {...state, text: action.payload}
        default:
          return state
      }
    })

    return {
      dispatch,
      props: {
        a: value.select("a"),
        b: value.select("b"),
        text: value.map(s => s.text)
      }
    }
  }

  function view({a, b, text}) {
    const counterA = isolate(Counter)({DOM, Store: a})
    const counterB = isolate(Counter)({DOM, Store: b})

    return {
      childActions: O.merge(counterA.Store, counterB.Store),
      vdom: O.combineArray((aDOM, bDOM, txt) =>
        h("div", [
          h("h1", ["Hello: ", txt]),
          aDOM,
          bDOM,
          h("hr"),
          h("input.text", {props: {value: txt}})
        ]), [counterA.DOM, counterB.DOM, text])
    }
  }

  function intent(DOM) {
    return DOM.select(".text")
      .events("input")
      .map(e => ({
        type: "SET_TEXT",
        payload: e.target.value
      }))
  }
}
```

Again, let's go through the code line by line.

- - -
```js
import {main as Counter} from "./previous-example"
```
Because our components are fractal, we can use the counter component from the previous
example as it is.

```js
run(main, {
  DOM: DOM("#app"),
  Store: Store(Memory({text: "", a: {num: 0}, b: {num: 0}}))
})
```
Nothing new here, we're just creating a little bit more complex state with a text property
and two counters, `a` and `b`.

```js
function model({actions, value}) {
  const dispatch = actions.reduce((state, action) => {
     switch (action.type) {
       case "SET_TEXT":
         return {...state, text: action.payload}
       default:
         return state
     }
   })

  return {
    dispatch,
    props: {
      a: value.select("a"),
      b: value.select("b"),
      text: value.map(s => s.text)
    }
  }
}
```
Look pretty same as in the previous example, huh? Note that because the parent component
wants to update only `text` property, we are reacting only to `SET_TEXT` actions in the reducer.
There should be nothing new in the code, except these two lines:
```js
a: value.select("a"),
b: value.select("b"),
```
Although store's values are normal observables, `@culli/store` adds one extra method to 
them, `select`. This method takes one argument which represents property name in the state.
`select` returns new `Store` source (action and value) that is "focused" on the given
property - the returned store can access (read/write) **only** to the focused property.
If the store updates the focused value, changes are also synchronized with parent store
automatically. Same applies to parent store: if parent store changes the focused value,
the changes are synchronized with the focused store.

**NOTE:** if the parent state is an array, `select` accepts also integer representing
the index of the focused item.

```js
function view({a, b, text}) {
  const counterA = isolate(Counter)({DOM, Store: a})
  const counterB = isolate(Counter)({DOM, Store: b})

  return {
    childActions: O.merge(counterA.Store, counterB.Store),
    vdom: O.combineArray((aDOM, bDOM, txt) =>
      h("div", ...), [counterA.DOM, counterB.DOM, text])
  }
}
```
Here comes the interesting part: now that our focused stores have identical features
as the parent store, we can use them as `Store` source in our child components! Then
we can use child components' return values (`DOM` and `Store` in this case) like we'd 
use them in traditional Cycle apps.

**NOTE:** In case you're wondering why we're using `isolate` here - we need to isolate
`DOM` events (clicks) from sibling counters `a` and `b`. Isolation has no effect to
`@culli/store` stores.

```js
return {
  DOM: vdom,
  Store: O.merge(dispatch(actions), childActions)
}
```
Finally we must merge the actions coming from the child components with the action
coming from the parent component (like we must do to all other cycle sinks as well,
e.g. `HTTP`).

That's it!


### Dynamic lists 

`TODO...`

## API

Please see [here](API.md)


## License

MIT
