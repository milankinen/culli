# @culli/dom

> Concise, ultra high-performance and minimalistic Virtual DOM implementation
> that supports true Cycle MVI pattern without need of isolation

[![npm](https://img.shields.io/npm/v/@culli/dom.svg?style=flat-square)](https://www.npmjs.com/package/@culli/dom)

**WIP!** This package is still under heavy development, use with extreme care!!

## Example

```js
import * as O from "most"
import {run} from "@cycle/most-run"
import DOM from "@culli/dom"

function main(x) {
  console.log(x)
  const {DOM: {h, combine}} = x
  const date =
    O.periodic(1000).map(() => new Date().toTimeString())

  const vdom = h("div", [
    h("h2", ["Clock is: ", date])
  ])

  return {
    DOM: combine(vdom)
  }
}

run(main, {
  DOM: DOM("#app")
})
```


## License

MIT
