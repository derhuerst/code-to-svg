#!/usr/bin/env coffee
'use strict'

proc =    require 'child_process'
fs =      require 'fs'
cheerio = require 'cheerio'
assert =  require 'assert'



proc.execSync './bin.js test/file.js test/file.js.svg'
rects = cheerio.load(fs.readFileSync 'test/file.js.svg')('rect').toArray()

assert rects.length > 0
