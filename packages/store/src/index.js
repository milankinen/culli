import {__, O, throws, pipe, isObj, identity} from "@culli/base"
import makeStore, {Action} from "./store"
import * as L from "./lenses"

const DEV = process.env.NODE_ENV !== "production"


// Driver Factory

export default function (storage, opts = {}) {
  const {eq = strictEquals, logErrors = true} = opts

  function StoreDriver(actions, SA) {
    const Store = makeStore(SA, eq)

    const adaptedStorage =
      storage.__culli ? storage : pipe(O.adaptOut(SA), storage, O.adaptIn(SA.streamSubscribe))

    const value =
      __(actions,
        O.tap(action => DEV && !(action instanceof Action) && throws("Received action is not valid: " + action)),
        adaptedStorage,
        O.skipRepeats(eq),
        O.hold)

    __(value, O.subscribe({
      error: err => {
        if (logErrors) {
          console.error(err.stack || err)   // eslint-disable-line no-console
        }
      }
    }))

    return Store(value, L.identity)
  }

  function strictEquals(a, b) {
    return a === b
  }

  StoreDriver.streamAdapter = O.Adapter
  return StoreDriver
}

// Utils

export function byType(reducers) {
  !isObj(reducers) && throws(`Reducers must be an object of functions, instead got: ${reducers}`)
  return function byTypeReducer(state, action) {
    const reducer = action && action.type ? reducers[action.type] || identity : identity
    return reducer(state, action && action.payload)
  }
}

// Storages

export {default as Memory} from "./storage/memory"
export {default as ReduxDevtools} from "./storage/reduxDevtools"
