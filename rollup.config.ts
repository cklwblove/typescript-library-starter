import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import sourceMaps from 'rollup-plugin-sourcemaps'
import { terser } from 'rollup-plugin-terser'
import camelCase from 'lodash.camelcase'
import typescript from 'rollup-plugin-typescript2'
import json from '@rollup/plugin-json'

const pkg = require('./package.json')

const external = [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})]

const libraryName = '--libraryname--'

/**
 * Comment with library information to be appended in the generated bundles.
 */
const banner = `/*!
 * ${pkg.name} v${pkg.version}
 * (c) ${pkg.author}
 * Released under the ${pkg.license} License.
 */
`

/**
 * Creates an output options object for Rollup.js.
 * @param {import('rollup').OutputOptions} options
 * @returns {import('rollup').OutputOptions}
 */
function createOutputOptions(options) {
  return {
    banner,
    name: `${libraryName}`,
    sourcemap: true,
    ...options,
  };
}

/**
 * @type {import('rollup').RollupOptions}
 */
const options = {
  input: `src/${libraryName}.ts`,
  output: [
    createOutputOptions({
      file: pkg.module,
      format: 'esm',
    }),
    createOutputOptions({
      file: pkg.main,
      format: 'umd',
      name: `${camelCase(libraryName)}`
    }),
    createOutputOptions({
      file: `./dist/${libraryName}.umd.min.js`,
      format: 'umd',
      plugins: [terser()],
      name: `${camelCase(libraryName)}`
    }),
  ],
  // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
  external,
  watch: {
    include: 'src/**'
  },
  plugins: [
    // Allow json resolution
    json(),
    // Compile TypeScript files
    typescript(),
    // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
    commonjs(),
    // Allow node_modules resolution, so you can use 'external' to control
    // which external modules to include in the bundle
    // https://github.com/rollup/rollup-plugin-node-resolve#usage
    resolve(),
    // Resolve source maps to the original source
    sourceMaps()
  ],
};

export default options;
