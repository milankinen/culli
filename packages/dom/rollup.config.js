import buble from "rollup-plugin-buble"
import nodeResolve from "rollup-plugin-node-resolve"
import commonjs from "rollup-plugin-commonjs"

export default {
  entry: "src/index.js",
  dest: "dist/culli.dom.js",
  format: "umd",
  moduleName: "CULLI.DOM",
  sourceMap: true,
  plugins: [
    buble(),
    nodeResolve({
      jsnext: true,
      main: true,
      module: true
    }),
    commonjs({
      include: "node_modules/**"
    })
  ],
  external: [
    "@culli/base"
  ],
  globals: {
    "@culli/base": "CULLI.Base"
  }
}
