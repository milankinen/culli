# @culli/store

[![npm](https://img.shields.io/npm/v/@culli/store.svg?style=flat-square)](https://www.npmjs.com/package/@culli/store)

Concise and familiar (at least for Redux users) way to manage your application
state and storage without need to worry about the performance.


## Motivation

The "classical Cycle state management" relies on local state encoded into streams.
This enables very simple and elegant implementations of simple applications. However,
when application's complexity increases and parent-child-parent dependencies are
required, the traditional state management easily turns to very complex and cumbersome.
The goal of `@culli/store` is to provide familiar and straightforward way to manage
your Cycle application state in a way that scales from a tiny counter app to enterprise
portals with tens of thousands of LOC!


## How does it work?

If you've used [`redux`](http://redux.js.org/) or my previous work 
[`stanga`](https://github.com/milankinen/stanga), you should be familiar with this 
package as well. The design principles of `@culli/store` are:

  * **State is separated from application logic.** In `@culli/store`, application state
    "lives" outside the app. Application can read the state by using `Store` source,
    provided by `main`, and update the state by dispatching actions via `Store` sink. It's
    irrelevant to the component whether the state comes from Store driver or parent component, 
    from memory or from the server.
    
  * **Component defines itself, how it modifies the state.** Although the state lives
    physically outside the component, component defines itself how and when it modifies 
    its state. The state modifications are done in exactly same and familiar way as they 
    are done in Redux, by using the [reducer pattern](http://redux.js.org/docs/basics/Reducers.html).
    Component defines a reducer function `(state, action) => state` which receives the
    current state and the dispatched action and calculates the new state based on them.
    
  * **Component can slice its state.** Many times it's wise to split your component
    into smaller sub-components. However, in order to make those sub-components generic and
    reusable, the can't operate over the whole state. That's why `@culli/store` stores have
    easy and concise way to focus on certain sub-state so that the focused sub-state has
    exactly same features as the parent store, but it can access only the focused part
    of the state. This focused sub-state (or sub-store) can be then passed to child 
    components as a store sink (remember that the origin of `Store` is irrelevant to the
    components!).
    
  * **`Store` is only an interface for the actual data storage.** *"`@culli/store` does not
    have any side-effects, so it can't be a driver!"*, enthusiastics might yell. That is
    not actually true. To be precise, `Store` is a *meta-driver*. It's agnostic about
    how the state is stored: instead it takes a `Storage` function that defines how the state
    is persited. In some cases in-memory persistence is enough, whereas in another cases
    there might be need for local storage or even more sophisticated state synchronization
    with server or other clients (e.g. by using WebSockets). So `@culli/store` **can**
    have side-effects.


## How does it differ from `cycle-onionify`?

Global state based Cycle state management gained some momentum lately when `cycle-onionify`
was released. Although `@culli/store` and `cycle-onionify` may seem very similar at first 
glance (and both have their own pros and cons), they have some fundemental differences:

  * `@culli/store` dispatches action objects to component sink, whereas `cycle-onionify` 
    dispatches reducer functions (although `@culli/store` could dispatch reducers as well)
  * `@culli/store` needs a way to identify list objects due to performance and compatibility 
    reasons when creating child components, whereas `cycle-onionify` doesn't
  * `@culli/store` is unopinionated how/where the state is stored (it is just an interface
    for your application state), whereas `cycle-onionify` stores the state always in memory
  * `@culli/store` is a driver whereas `cycle-onionify` is a higher-order component
  * `@culli/store` uses manual state splicing whereas `cycle-onionify` uses `@cycle/isolate`
  * In `@culli/store`, the initial state must be defined outside the component (during the 
    driver initilization at top level), whereas in `cycle-onionify`, the initial state is
    created with an initial reducer

### When to choose `cycle-onionify`?

You should choose `cycle-onionify` when:

  * You want to use `@cycle/isolate` to manage the state splitting
  * You don't want to use ids or other identities for your child state items (for lists)
  * Your lists are not big and/or you don't need to worry about performance
  * You need only in-memory state
  * You are using `xstream`
  * You don't have any components using "classical Cycle state management" that you
    want to use in your app (it depends on the component whether it's possible to use
    it with `cycle-onionify` or not)
    
### When to choose `@culli/store`?

You should choose `@culli/store` when:

  * You are familiar with Redux style state management and single reducer
  * You want a fine-grained way to manage the state splicing (athough a bit more
    verbose than when using `@cycle/isolate`)
  * You have big/medium sized lists and you don't want to 
    [worry about your application's performance](https://vimeo.com/189159952)
  * You want to use other streaming library than `xstream` (all Cycle Diversity supported stream
    libraries are supported)
  * You need to (re-)use components that are still using the "classical Cycle state management"
    (`@culli/store` list handling doesn't loose the component's local state even if the
    list changes)
  * You want to keep an option for more complex state storage (like hot-reloadable
    memory, local storage or server/websockets)
  * You want to benefit from Redux's [rich ecosystem](https://vimeo.com/189374682)


## Some code, please!

### Basic usage

Here is the traditional counter app written with `@culli/store` (and with `most` but
`@culli/store` is compatible with any Cycle Diversity supported streaming library):
```js
import * as O from "most"
import {run} from "@cycle/most-run"
import {makeDOMDriver as DOM, h} from "@cycle/dom"
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
        h("h1", [`Counter: ${num}`]),
        h("div", [
          h("button.inc", "Increment"),
          h("button.dec", "Decrement")
        ])
      ]))
  }

  function intent(DOM) {
    const incrementActions = DOM.select(".inc")
      .events("click")
      .map(() => ({type: "INC"}))
    const decrementActions = DOM.select(".dec")
      .events("click")
      .map(() => ({type: "DEC"}))

    return O.merge(incrementActions, decrementActions)
  }
}
```

- - -

Let's look at the code line by line.

```js
import Store, {Memory} from "@culli/store"
```
Here we import all dependencies that are needed to initilize the store driver. `@culli/store` 
provides a driver factory function as its `default` import. It also provides some built-in 
storages that can be used for state persistence. In this example we are using in-memory
`Memory` storage.

```js
run(main, {
  DOM: DOM("#app"),
  Store: Store(Memory({num: 0}))
})
```
Here we initialize the drivers and start the app just like any other CycleJS application.
A new store driver can be initialized by calling the driver factory function we imported
few lines above and giving a valid storage to it. Storages are basically just functions
`(Observable<Action>) => Observable<State>`. Now we create an in-memory storage and give
an initial value to.

```js
function main({DOM, Store}) {
  ...
```
Because we defined `Store` as a driver, we can now access its utilities from sources.
And thanks to Cycle Diversity, those utilities are available for your favourite streaming
library as well!

```js
function model({actions, value}) {
  ...
```
`Store` driver's source has two public properties: `actions` and `value`. `actions` is an
object that represents the actions belonging to this component. `value` is just a normal
`Observable` that represents the current state of the store, thus you can use this observable
like you'd use any other observable in your Cycle app.

```js
const dispatch = actions.reduce((state, action) => {
  ...
})
```
This is where you define how the component state is be modified. If you've used Redux
before, you can notice that the pattern is exactly same as described in 
[Redux docs](http://redux.js.org/docs/basics/Store.html) (`{dispatch} = createStore(reducer)`
vs. `dispatch = actions.reduce(reducer)`). The reducer function of `actions.reduce` is invoked
*every time* when your component dispatches an action. We've now used the traditional
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

As we've learned before, store's `value` is just like any other observable so we can map
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
the obsevable state to build component's virtual dom stream.

```js
function intent(DOM) {
  const incrementActions = DOM.select(".inc")
    .events("click")
    .map(() => ({type: "INC"})
  const decrementActions = DOM.select(".dec")
    .events("click")
    .map(() => ({type: "DEC"})

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
that can be sent to the Store driver via sink.


### Child components

Components should be small and have only one responsibility. But how to keep components
small when the state grows. Luckily, `@culli/store` provides a simple solution that makes possible
to slice the state into smaller sub-states. And those sub-states can be given to child components 
so that the child components don't need to know the whole application state!

Let's go through how to slice your application state with `@culli/store`:

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
        text: value.select("text")
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
        ]), [counterA.DOM, counterB.DOM, text.value])
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
      text: value.select("text")
    }
  }
}
```
Looks pretty same as in the previous example, huh? Note that because the parent component
wants to update only `text` property, we are reacting only to `SET_TEXT` actions in the reducer.

There should be nothing new in the code, except these three lines:
```js
a: value.select("a"),
b: value.select("b"),
text: value.select("text")
```
Although the store's values are normal observables, `@culli/store` adds one extra method to 
them, `select`. This method takes one argument which represents property name in the state.
`select` returns a new `Store` source (action and value) that is "focused" on the given
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
      h("div", ...), [counterA.DOM, counterB.DOM, text.value])
  }
}
```
Here comes the interesting part: now that our focused stores have identical features
as the parent store, we can use them as the `Store` source in our child components! Then
we can use child components' return values (`DOM` and `Store` in this case) like we'd 
use them in traditional Cycle apps. Also note that because `text.value` is a normal
observable, you can use it with any other combinators like `combineArray`.

**NOTE:** In case you're wondering why we're using `isolate` here - we need to isolate
`DOM` events (clicks) from the sibling counters `a` and `b`. Isolation has no effect to
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

Let's go through how we can split our application into smaller components when we have a list 
of data that might change over time:

```js
import * as O from "most"
import isolate from "@cycle/isolate"
import {run} from "@cycle/most-run"
import {makeDOMDriver as DOM, h} from "@cycle/dom"
import Store, {Memory} from "@culli/store"

import Counter from "./Counter"

let id = 0
const newId = () => ++id

run(main, {
  DOM: DOM("#app"),
  Store: Store(Memory({items: [{id: newId(), num: 0}, {id: newId(), num: 0}]}))
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
        case "ADD":
          return {...state, items: [...state.items, {id: newId(), num: 0}]}
        default:
          return state
      }
    })

    return {
      dispatch,
      props: {
        items: value.select("items")
      }
    }
  }

  function view({items}) {
    const children = items.value.mapChildren((counter, id) => {
      const Component = isolate(Counter, id)
      return Component({DOM, Store: counter})
    }, {values: ["DOM"], events: ["Store"]})

    return {
      childActions: children.Store,
      vdom: children.DOM.map(childDOMs => h("div", [
        h("h1", "Counter list"),
        h("div", childDOMs),
        h("hr"),
        h("button.add", "Add new counter")
      ]))
    }
  }

  function intent(DOM) {
    return DOM.select(".add")
      .events("click")
      .map(e => ({type: "ADD"}))
  }
}
```

And yet again, let's go through the code line by line...

- - -

```js
run(main, {
  DOM: DOM("#app"),
  Store: Store(Memory({items: [{id: newId(), num: 0}, {id: newId(), num: 0}]}))
})
```
Here we initialize the state with an initial list of counters. In order to work efficiently, 
`@culli/store` needs some kind of way to identify individual items. By default, `id`
property is used for the job, hence we need to also give unique ids to your list items.

```js
const children = items.value.mapChildren((counter, id) => {
  const Component = isolate(Counter, id)
  return Component({DOM, Store: counter})
}, {values: ["DOM"], events: ["Store"]})
```
Here we go! This is basically all you need to do when processing dynamic lists with
`@culli/store`. Store's value has `mapChildren` which iterates and invokes the given
transform function for each list item. Transform function receives two arguments:
item which is a `Store` instance focused on the specific item (same as we did with
`select` previously) and an identity of the item. By using these values, you can call
the child component and return its sinks to `mapChildren`. Notice that again you
can use the focused store as a store in the child component!

The return value of `mapChildren` is a CycleJS sink object that emits values from
the created child components. But unfortunately **there is a catch**: `mapChildren` 
doesn't know the extracted sinks beforehand. That's why you must give a `{values, events}` 
specification which defines the names of the extracted value and event sinks 
(if you're not familiar with observable values and events, please see [this](TODO)).
Value sinks are extracted by using `combine` combinator (resulting an observable
with signature `Observable<Array<V>>`). Event sinks are extracted by using 
`merge` combinator (resulting an observable with signature `Observable<E>`). 
 
**NOTE:** if your items don't have `id` field, store has also `mapChildrenBy` which
takes an additional key function, which can be used to define the identity for items
by using other means than `id`:
```js
const customIdentity = item =>
  item.otherKey
  
const children = items.value.mapChildrenBy(customIdentity, (item, key) => {
  // now: key === otherKey
  ...
}, {values: ..., events: ...})
```


Now you can use e.g. the child vdom nodes to build your parent component's virtual dom:
```js
return {
  childActions: children.Store,
  vdom: children.DOM.map(childDOMs => h("div", [
    ...
  ]))
}
```

### Some persistence thx!

`TODO...`

### What else?

Congrats! There is nothing new to learn. You known how to read, write and slice the application
state: the basic ingredients that can be used to build any kind of app, let it be small 
or big. Happy coding!

All runnable tutorial codes are available [here](../../tutorials/store).


## API

API docs can be found from [here](API.md)


## License

MIT
