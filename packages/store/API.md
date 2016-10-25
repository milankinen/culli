# Store API

### `type StoreDriver<S> = (Observable<Action<S>>) => StoreSource<S>`

`StoreDriver` is a standard CycleJS driver that takes stream of actions as
an input and returns `StoreSource`. 

### `StoreDriverFactory :: (storage: Storage<S>, config: DriverConfig?) => StoreDriver<S>`

`StoreDriverFactory` is a factory function meant for new store driver initialization.
This function is available as a `default` export from `@culli/store`.

#### Parameters

  * `storage` : storage strategy that will be used to store and sync state of
    the store driver
  * `config` : optional object containing additional configurations...TODO
  
#### Return value
 
Store driver function that can be used like any other CycleJS driver.

#### Example usage
```js
import Store, {Memory} from "@culli/store"

run(main, {
  Store: Store(Memory({value: "culli!"})),
  ...
})
```

### `type StoreSource<S> = { actions: StoreActions<S>, value: StoreValue<S> }`

Store driver source containing two properties:

  * `actions` : actions belonging to this store and that can used to modify the
    state of the store
  * `value` : observable value of this store
  

### `type StoreActions<S> = { reduce :: (reducer: (state: S, action: any) => S) => DispatchFunction }`

Store's actions that can be used to modify the store's state. In order to modify the store's state,
user must invoke `reduce` function and give a `reducer` function, that modifies the state based on
the received actions. 

`reduce` returns a `DispatchFunction` which must be used to wrap outgoing action streams
before they are returned via store sink.

### Example usage
```js
function main({Store: {value, actions}) {
  const dispatch = actions.reduce((state, action) => action.type === "INC" ? state + 1 : state)
  ...
  const incActions = DOM.select(".inc").events("click").mapTo({type: "INC"})
  return {
    Store: dispatch(incActions)
  }
}
```

### `type StoreValue<S> = Observable<S> & { select, mapChildren, mapChildrenBy }`

Observable state of the store, that can be used like any other observable in your
application. In addition, `StoreValue` has also three additional methods:

#### `select :: (selector: Selector) => StoreSource<T>`

This method focuses on the given selector, creating new `StoreSource` that has 
exacly same features as the parent `StoreSource` but which can access (read/write) 
only the focused part of the state. Possible selector types are:
  
  * `propertyName :: string` : focus on single property of the parent object
  * `index :: int` : focus on single item of parent array

##### Example usage
```js
run(main, {
  Store: Store(Memory({num: 1, msg: "tsers!"})),
})

function main({Store: {value, actions}) {
  const msg = value.select("msg")
  msg.subscribe({next: ::console.log})    // prints "tsers!"
  ...
}

```
      
#### `mapChildren :: (fn: ChildFn, eventSinks = ["Store"], valueSinks: ["DOM"]) => {[string]: Observable<any>}` 
```
ChildFn :: (item: StoreSource<S>, key: string) => {[string]: Observable<any>}
```

If the store's value is an array, this method maps through all array items and applies
the given child function `fn` to each item in the array. Returned child sink objects are
combined, flattened and exracted so that the result value of this method is a 
CycleJS sink object whose sinks emit values from child sink objects.

In order to detect which sinks this method must exract, user must define the names
of the extracted value and event sinks (see section [observable values and events](TODO)).
Value sinks are exracted by using `combine` combinator, event sinks are extracted
by using `merge` combinator. Default values are `["Store"]` (event sink names) and
`["DOM"]` (value sink names).


This method is extremely useful if you want to create a list of child components,
one for each item.

**ATTENTION:** this method requires that items have `id` attribute that identifies
each item in the array.

##### Example usage
```js
run(Parent, {
  Store: Store(Memory([{id: 1, text: "foo"}, {id: 2, text: "bar"}])),
})

function Parent(sources) {
  const {Store: {value, actions}} = sources
  ...
  const children = value.mapChildren(item => {
    const sinks = Child({...sources, Store: item})
    return sinks
  })
  
  const vdom = children.DOM.map(childVDOM => h("div", childVDOM))
  return {
    DOM: vdom,
    Store: children.Store
  }
}

function Child({DOM, Store}) {
  ...
  return { DOM: vdom, Store: dispatch(childActions) }
}
```

```js 
run(Parent, {
  Store: Store(Memory([{id: 1, text: "foo"}, {id: 2, text: "bar"}])),
  HTTP: ...
})

function Parent(sources) {
  const {Store: {value, actions}} = sources
  ...
  const children = value.mapChildren(item => {
    const sinks = Child({...sources, Store: item})
    return sinks
  }, ["Store", "HTTP"])
  
  const vdom = children.DOM.map(childVDOM => h("div", childVDOM))
  return {
    DOM: vdom,
    Store: children.Store,
    HTTP: children.HTTP
  }
}

function Child({DOM, Store}) {
  ...
  return { DOM: vdom, Store: dispatch(childActions), HTTP: childRequests }
}
```


#### `mapChildrenBy :: (keyFn: KeyFn, fn: ChildFn, eventSinks = ["Store"], valueSinks: ["DOM"]) => {[string]: Observable<any>}` 
```
KeyFn :: (item: S) => string
```

Samek as `mapChildren` but allows to use custom identity for items instead of `id` property.
Identity must be defined by using `keyFn` which receives an item (plain value) and must return
an (serializable) identity of the given item.

##### Example usage
```js
run(main, {
  Store: Store(Memory([{_id: 1, text: "foo"}, {_id: 2, text: "bar"}])),
})

function main(sources) {
  const {Store: {value, actions}} = sources
  const ident = item => item._id
  const children = value.mapChildrenBy(ident, item => Child({...sources, Store: item}))
  ...
}
```


### Storages
#### `type Action<S> = { apply :: (state: S) => S, value :: any }`
#### `type Storage<S> = (actions: Observable<Actions<S>>) => Observable<S>`

Storages are functions that transform user actions to store's value. Storages are allowed to 
perform side effects when they are processing the input actions. Input actions have `apply` method
which transforms the given scalar state into new state.

### Built-in storages

#### `Memory<S> :: (initialState: S) => Storage<S>`

`Memory` storage is the simpliest possible storage. It keeps the store's state in memory and
modifies it synchronously based on the received actions. The new state is emitted immediately
to the application.

#### `HotReloadable<S> :: (initialState: S) => Storage<S>`

Same as `Memory` but preserves the state across Hot Module Reloads but will re-create the
state when browser window is refreshed. Perfect pair with `HMR` loader.

#### More will come...
