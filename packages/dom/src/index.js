import {O, extend} from "@culli/base"
import {isStr, newId} from "./util"
import H from "./h"
import Combine from "./combine"
import Lifecycle from "./lifecycle"
import P from "./patching"
import {Events, make} from "./events"
import * as domApi from "./dom"

import Combined from "./vdom/Combined"
import Text from "./vdom/Text"
import Element from "./vdom/Elem"
import StaticElement from "./vdom/StaticElem"


export default function (domRoot) {
  function DOMDriver(vdom, SA) {
    const events = new Events()
    const context = {}

    extend(context, {domApi, newId})
    extend(context, Lifecycle(context))
    extend(context, {events: make(SA, events)})
    extend(context, {patch: P(context)})
    extend(context, {
      Nodes: {
        Combined: Combined(context),
        Text: Text(context),
        Element: Element(context),
        StaticElement: StaticElement(context)
      }
    })
    extend(context, {
      h: H(SA, context),
      combine: Combine(SA, context)
    })


    domRoot = isStr(domRoot) ? document.querySelector(domRoot) : domRoot
    const rootNode = {
      onChildReady: (app) => {
        domRoot.appendChild(app.create())
      }
    }
    O.subscribe({
      next: vnode => {
        const app = context.link(vnode, rootNode)
        events.mount(domRoot)
        app.start()
      }
    }, vdom)

    return {
      h: context.h,
      combine: context.combine
    }
  }

  DOMDriver.streamAdapter = O.Adapter
  return DOMDriver
}
