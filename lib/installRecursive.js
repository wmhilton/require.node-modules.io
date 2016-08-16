'use strict'
const fs = require('fs')
const path = require('path')

const sh = require('shelljs')
const watt = require('watt')
const debug = require('debug')('node-modules.io:npmjs')

const parseModuleString = require('./parseModuleString')
const installOne = require('./installOne')

module.exports = watt(function * (module_string, next) {
  let m = yield parseModuleString(module_string)
  // Install module if missing.
  if (!sh.test('-d', m.install_path)) {
    yield installOne(module_string)
  }
  // Abort if missing package.json
  let package_path = path.join(m.install_path, 'package.json')
  if (!sh.test('-f', package_path)) {
    throw Error(`Could not find package.json in ${m.pretty_fullname}`)
  }
  // Load package.json
  try {
    var raw = fs.readFileSync(package_path, 'utf8')
  } catch (e) {
    throw Error(`Could not read this file: ${package_path}`)
  }
  try {
    var json = JSON.parse(raw)
  } catch (e) {
    throw Error(`Invalid JSON in file: ${package_path}`)
  }
  // Load dependencies
  let deps = json.dependencies || {}
  for (let name in deps) {
    let version = deps[name]
    debug(`${name}/${version}`)
  }
})