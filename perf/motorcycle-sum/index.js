import {run} from '@motorcycle/run'
import {makeDomComponent} from '@motorcycle/dom'
import Store, {Memory} from '@culli/store'
import List, {nextId} from './List'
import { O } from '@culli/base'

const N = 2000
const sliders =
  Array.apply(0, Array(N)).map(() => ({ id: nextId(), val: Math.floor(10 + Math.random() * 80) }))

const domDriver = makeDomComponent(document.body)
const storeDriver = Store(Memory({items: sliders}))

function effects(sinks) {
  return {
    DOM: domDriver({view$: sinks.DOM}).dom,
    Store: storeDriver(sinks.Store, O.Adapter)
  }
}

run(List, effects)
