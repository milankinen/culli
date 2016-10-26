import {O} from "@culli/base"

let __ID__ = 0

export const newId = () => {
  return ++__ID__
}

export const noop = () => {
}

export const isStr = x => {
  return typeof x === "string"
}

export const isNum = x => {
  return typeof x === "number"
}

export const isBool = x => {
  return typeof x === "boolean"
}

export const isPrimitive = x => {
  return isStr(x) || isNum(x) || isBool(x)
}


export const startMods = (mods, observer) => {
  const next = mod => {
    observer.onMod(mod)
  }
  const error = err => {
    // TODO: better error handling
    console.error(err.stack || err)   // eslint-disable-line
  }
  return mods && mods.length ? O.subscribe({next, error}, mods.length > 1 ? O.merge(mods) : mods[0]) : void 0
}

export const stopMods = dispose => {
  dispose && dispose()
  return void 0
}

export const throws = (msg) => {
  throw new Error(msg)
}
