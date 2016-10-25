import {run} from "@cycle/most-run"
import DOM from "@culli/dom"
import Store from "@culli/store"

import Counter from "./counter"
import BasicList, {newId} from "./basic-list"


const initial = []
for (let i = 0; i < 5; i++) {
  initial.push({id: newId(), value: 0})
}

run(BasicList, {
  DOM: DOM("#app"),
  Store: Store(initial)
});
