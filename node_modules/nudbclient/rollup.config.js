import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

export default [
  {
    input: 'src/index.js',
    output: {
      file: 'dist/node.js',
      format: 'cjs',
    },
    plugins: [resolve(), commonjs(), terser()],
  },
  {
    input: 'src/index.js',
    output: {
      file: 'dist/browser.js',
      format: 'iife',
      name: 'Nudb', // Ini yg dipakai di window.Nudb
    },
    plugins: [resolve(), commonjs(), terser()],
  },
];