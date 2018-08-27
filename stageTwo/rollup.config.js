import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import builtins from 'rollup-plugin-node-builtins';


export default [{
	input: './js/main.js',
	plugins: [
    resolve({
			jsnext: true,
			main: true,
			browser: true,
		}),
    commonjs(),
		builtins(),

     ],
	output: {
		file: './js/bundle.js',
		format: 'iife'
	}
}, {
	input: './js/dbhelper.js',
	plugins: [
    resolve({
			jsnext: true,
			main: true,
			browser: true,
		}),
    commonjs(),
		builtins(),

     ],
	output: {
		file: './js/bundle2.js',
		format: 'iife',
		globals: {
			idb: 'idb'
		}
	}
}];
