#!/usr/bin/env node
'use strict'

const yargs =   require('yargs')
const path =    require('path')
const fs =      require('fs')
const byline =  require('byline')
const spy =     require('through2-spy')
const codeSVG = require('code-svg-stream')
const wrap =    require('wrap-stream')





const argv =   yargs.argv
const source = argv._[0]
const dest =   argv._[1] || source + '.svg'
const silent = (argv.silent === true) || (argv.s === true)

if (argv.help || argv.h) {
	process.stdout.write(`Usage:
  code-svg-stream <input-file> [output-file] [-s]

Options:
  -s, --silent     No output
` + '\n')
	process.exit(0)
}



const count = (lines) => new Promise(function (resolve, reject) {
	let n = 0, count = lines.pipe(spy((l) => n++))
	count.on('data', function () {})
	count.on('end', () => resolve(n))
})

const log = function (message) { if (!silent) console.info(message) }

const onError = function (err) {
	process.stderr.write(err.message)
	process.exit(1)
}



log(source + ' -> ' + dest)
count(byline(fs.createReadStream(source), {keepEmptyLines: true}))
.then(function (lines) {

	const head = `<svg xmlns="http://www.w3.org/2000/svg" \
width="200" height="${lines * 20 - 20}" \
viewBox="0 0 100 ${lines * 10 - 10}">
<style>.code{fill:#333}</style>`
	const tail = '\n</svg>'

	fs.createReadStream(source).on('error', onError)
	.pipe(codeSVG({tabSize: 4})).on('error', onError)
	.pipe(wrap(head, tail)).on('error', onError)
	.pipe(fs.createWriteStream(dest)).on('error', onError)

	.on('finish', log.bind({}, 'done'))
}, onError)
