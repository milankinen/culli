import {O, pipe, keys, extend, identity} from "@culli/base"
import {MapChildrenSource, CycleSinkExtractSource} from "./children"
import lift, * as L from "./lenses"



export default (SA, equality) => {
  const convertIn = O.adaptIn(SA.streamSubscribe)
  const outStream = O.adaptOut(SA)
  const outValue = pipe(outStream, SA.remember)

  const skipDups = O.skipRepeats(equality)
  const toValue = pipe(skipDups, O.hold)

  const toAction = l => a =>
    a instanceof Action ? a : new Action(a, l)

  return function Store(value, rootLens) {
    function select(selector) {
      const lens = lift(selector)
      return Store(toValue(O.map(s => L.get(lens, s), value)), L.comp(rootLens, lens))
    }

    function reduce(reducer) {
      const dispatch = (...actions) => {
        const storeLens =
          L.comp(rootLens, L.lens(identity, (a, s) => reducer(s, a)))
        const stream = !actions.length
          ? O.empty()
          : O.merge(actions.map(pipe(convertIn, O.map(toAction(storeLens)))))
        return outStream(O.multicast(stream))
      }
      return dispatch
    }

    function mapChildren(fn, eventSinks, valueSinks) {
      return mapChildrenBy(it => it.id, fn, eventSinks, valueSinks)
    }

    function mapChildrenBy(identityFn, fn, eventSinks = ["Store"], valueSinks = ["DOM"]) {
      // make sure identity is string type
      const ident = pipe(identityFn, str)

      // augment transform function so that it converts output item stream to
      // model and converts returned cycle sinks (from app) back to internal streams
      const childFn = (item, key) => {
        const itemValue = outValue(item)
        const itemLens = L.find(it => ident(it) === key)
        const itemModel = Store(itemValue, L.comp(rootLens, itemLens))
        return cycleSinksToInternal(fn(itemModel, key))
      }

      // create custom MapChildren source that does the list state management,
      // calls childFn function every time when new item is added to the observed
      // list and is compatible with child value extraction
      const mcSource = new MapChildrenSource(value.source, ident, childFn, valueSinks, eventSinks)
      // create output sinks by extracting them by their key from the map children source
      const events = extract(mcSource, eventSinks, pipe(O.multicast, outStream), false)
      const values = extract(mcSource, valueSinks, pipe(O.hold, outValue), true)
      return extend({}, events, values)
    }

    // Public API
    return {
      value: extend(outValue(value), {
        select,
        mapChildrenBy,
        mapChildren
      }),
      actions: {
        reduce
      }
    }
  }

  // ... internal ...

  function extract(mapChildrenSource, sinkNames, toOutput, isValue) {
    const extracted = {}
    for (let i = 0, n = sinkNames.length; i < n; i++) {
      const name = sinkNames[i]
      const stream = O.fromSource(new CycleSinkExtractSource(mapChildrenSource, name, isValue))
      extracted[name] = toOutput(stream)
    }
    return extracted
  }

  function cycleSinksToInternal(sinks) {
    const internal = {}
    let k = keys(sinks), i = k.length
    while (i--) {
      const name = k[i]
      internal[name] = convertIn(sinks[name])
    }
    return internal
  }
}

export class Action {
  constructor(val, lens) {
    this.value = val
    this.l = lens
  }

  apply(state) {
    const {value, l} = this
    return L.set(l, value, state)
  }
}

function str(x) {
  return `${x}`
}
