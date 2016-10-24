import {__, O, throws} from "@culli/base"
import makeStore, {Action} from "./store"
import * as L from "./lenses"


const DEV = process.env.NODE_ENV !== "production"


export default function (initial, opts = {}) {
  const {eq = strictEquals, logErrors = true} = opts

  function StoreDriver(actions, SA) {
    const Store = makeStore(SA, eq)

    const value =
      __(O.merge([actions, O.never()]),
        O.scan((s, action) => {
          DEV && !(action instanceof Action) && throws("Received action is not valid: " + action)
          return action.apply(s)
        }, initial),
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

  StoreDriver.streamAdapter = O.Adapter
  return StoreDriver
}


function strictEquals(a, b) {
  return a === b
}
