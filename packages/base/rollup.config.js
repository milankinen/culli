import buble from "rollup-plugin-buble"
import nodeResolve from "rollup-plugin-node-resolve"
import commonjs from "rollup-plugin-commonjs"

export default {
  entry: "src/index.js",
  dest: "dist/culli.base.js",
  format: "umd",
  moduleName: "CULLI.Base",
  sourceMap: true,
  plugins: [
    buble(),
    nodeResolve({
      jsnext: true
    }),
    commonjs({
      include: ["node_modules/@most/**", "node_modules/most-subject/**"]
    })
  ],
  external: [
    "most"
  ],
  globals: {
    most: "most"
  }
}

