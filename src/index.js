#!/usr/bin/env node
const watch = require('node-watch')
const fs = require('fs')
const WriteableStream = require('stream').Writable
const path = require('path')

const argv = require('yargs')
  .usage('Usage: $0 [options]')
  .option('file', {
    alias: 'f',
    describe: 'Log file',
    type: 'string',
    default: './zerto.log'
  })
  .option('verbose', {
    alias: 'v',
    describe: 'Verbose level',
    type: 'count'
  })
  .option('recursive', {
    alias: 'r',
    describe: 'Recursive',
    type: 'boolean'
  })
  .option('path', {
    alias: 'p',
    describe: 'Directory path',
    type: 'string',
    default: '.'
  })
  .help('h')
  .option('help', {
    alias: 'h',
    describe: 'Show help'
  })
  .argv

const observedPath = path.isAbsolute(argv.path) ? argv.path : path.resolve(process.cwd(), argv.path)
const logFile = path.isAbsolute(argv.file) ? argv.file : path.resolve(process.cwd(), argv.file)

if (!fs.existsSync(observedPath)) {
  console.error(`${observedPath} does not exists`)
  process.exit(-2) // @see https://github.com/rvagg/node-errno/blob/master/errno.js#L5
}

function isFileAchievable (file) {
  if (fs.existsSync(file)) {
    try {
      fs.accessSync(file, fs.W_OK)
      return fs.lstatSync(file).isFile()
    } catch (e) {
      return false
    }
  } else {
    const fileDir = path.dirname(file)
    if (!fs.existsSync(fileDir)) return false
    try {
      fs.accessSync(fileDir, fs.W_OK)
      return true
    } catch (e) {
      return false
    }
  }
}

if (!isFileAchievable(logFile)) {
  console.error(`${logFile} does not writeable`)
  process.exit(-2) // @see https://github.com/rvagg/node-errno/blob/master/errno.js#L5
}

const options = {
  recursive: argv.recursive,
  filter: function (name) {
    return name !== argv.file
  }
}

const fileLogStream = fs.createWriteStream(logFile, {flags: 'a'})
fileLogStream.on('open', startWatching)

let watcher
let logStream = new WriteableStream()
logStream._write = (chunk) => {}
logStream = argv.verbose ? process.stdout : logStream

function startWatching () {
  watcher = watch(observedPath, options)
  console.log(`Start watch ${observedPath}${argv.recursive ? ' recursively' : ''}`)
  console.log(`Log file is ${logFile}`)

  watcher.on('change', (evt, name) => {
    const ext = path.extname(name)
    if (ext !== '.pdf') {
      const currentTimestamp = Math.floor(Date.now() / 1000)
      name = name.replace(new RegExp(ext + '$'), `_${currentTimestamp}${ext}\n`)
    } else {
      name = `${name}\n`
    }
    logStream.write(name)
    fileLogStream.write(name)
  })

  watcher.on('error', process.stderr.write)
}

function stopHandler () {
  if (watcher) watcher.close()
  fileLogStream.end()
  console.log(`Stop watching\n`)
}

process.on('SIGTERM', stopHandler)
process.on('SIGINT', stopHandler)
process.on('SIGHUP', stopHandler)
