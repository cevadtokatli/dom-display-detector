const pkg = require('./package');
const nodeResolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const babel = require('rollup-plugin-babel');

const banner = `/*!
 *   DOM Display Detector
 *   version: ${pkg.version}
 *    author: ${pkg.author.name} <${pkg.author.email}>
 *   website: ${pkg.author.url}
 *    github: ${pkg.repository.url}
 *   license: ${pkg.license}
 */
`;

module.exports = {
    input: 'src/dom-display-detector.js',
    output: [
        {
            banner,
            file: 'dist/dom-display-detector.js',
            format: 'umd',
            name: 'DOMDisplayDetector'
        },
        {
            banner,
            file: 'dist/dom-display-detector.common.js',
            format: 'cjs'
        },
        {
            banner,
            file: 'dist/dom-display-detector.esm.js',
            format: 'es'
        }
    ],
    plugins: [
        nodeResolve(),
        commonjs(),
        babel({
            plugins: [
                ['external-helpers']
            ],
            presets: [
                ['env', {modules: false}]
            ]
        })
    ]
};