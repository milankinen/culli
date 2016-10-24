import {__, O, isFun, throws} from "@culli/base"
import {update, identity} from "./lenses"
import makeStore from "./store"


const DEV = process.env.NODE_ENV !== "production"


export default function (initial, opts = {}) {
  const {eq = strictEquals, logErrors = true} = opts

  function StoreDriver(mods, SA) {
    const Store = makeStore(SA, Mod, eq)

    const value =
      __(O.merge([mods, O.never()]),
        O.scan((s, mod) => {
          DEV && !(mod instanceof Mod) && throws("Received modification is not valid: " + mod)
          return mod.update(s)
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

    return Store(value, identity)
  }

  StoreDriver.streamAdapter = O.Adapter
  return StoreDriver
}


function strictEquals(a, b) {
  return a === b
}

class Mod {
  constructor(fn, lens) {
    DEV && !isFun(fn) && throws("The given modification is not a function: " + fn)
    this.f = fn
    this.l = lens
  }

  update(s) {
    const {f, l} = this
    return update(l, f, s)
  }
}
