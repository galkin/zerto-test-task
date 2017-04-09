const BIN_PATH = './bin/zerto'
const spawn = require('child_process').spawn
const expect = require('chai').expect
const fs = require('fs')

describe('CLI', function () {
  let messageCallback
  let errorCallback
  let closeCallback
  const stoppingSignal = 'SIGTERM'
  const newFile = `${__dirname}/new_file.txt`
  const newPdfFile = `${__dirname}/new_file.pdf`
  const logFile = `${__dirname}/zerto.log`

  function startCLI (commandOptions) {
    let childProcess = spawn(BIN_PATH, commandOptions)
    childProcess.stdout.on('data', messageCallback)
    childProcess.stderr.on('data', errorCallback)
    childProcess.on('close', closeCallback)

    return childProcess
  }

  beforeEach(function () {
    messageCallback = () => {}
    errorCallback = () => {}
    closeCallback = () => {}
  })

  afterEach(function () {
    if (fs.existsSync(logFile)) fs.unlinkSync(logFile)
    if (fs.existsSync(newFile)) fs.unlinkSync(newFile)
    if (fs.existsSync(newPdfFile)) fs.unlinkSync(newPdfFile)
  })

  it('should stopping gracefully', function (done) {
    closeCallback = (code) => {
      expect(code).to.equal(0)
      done()
    }
    errorCallback = done

    let cli = startCLI([`-f=${logFile}`, `-p=${__dirname}`])

    setTimeout(() => cli.kill(stoppingSignal), 1000)
  })

  it('should write to log file on pdf only file name', function (done) {
    if (process.env.TRAVIS) this.skip() // @todo Fix on travis file writing
    closeCallback = (code) => {
      expect(code).to.equal(0)
      expect(fs.existsSync(logFile)).to.equal(true)
      const log = fs.readFileSync(logFile, 'utf-8')
      expect(log).to.equal(`${newPdfFile}\n`)
      done()
    }

    errorCallback = done

    let cli = startCLI([`-f=${logFile}`, `-p=${__dirname}`])

    setTimeout(() => fs.writeFileSync(newPdfFile, 'content'), 200)
    setTimeout(() => cli.kill(stoppingSignal), 1000)
  })

  it('should write to log file on not pdf file name with timestamp', function (done) {
    if (process.env.TRAVIS) this.skip() // @todo Fix on travis file writing
    closeCallback = (code) => {
      expect(code).to.equal(0)
      expect(fs.existsSync(logFile)).to.equal(true)
      const log = fs.readFileSync(logFile, 'utf-8')
      expect(log).to.match(/new_file_([0-9]+).txt$/m)
      done()
    }

    errorCallback = done

    let cli = startCLI([`-f=${logFile}`, `-p=${__dirname}`])

    setTimeout(() => fs.writeFileSync(newFile, 'content'), 200)
    setTimeout(() => cli.kill(stoppingSignal), 1000)
  })

  it('should write to stdout on not pdf file name with timestamp on -v', function (done) {
    closeCallback = (code) => {
      expect(code).to.equal(0)
      done()
    }

    messageCallback = (m) => {
      const message = m.toString()
      if (message.startsWith('Start watch')) return
      if (message.startsWith('Log file')) return
      if (message.startsWith('Stop watching')) return
      expect(message).to.match(/new_file_([0-9]+).txt$/m)
    }

    errorCallback = done

    let cli = startCLI([`-f=${logFile}`, `-p=${__dirname}`, '-v'])

    setTimeout(() => fs.writeFileSync(newFile, 'content'), 200)
    setTimeout(() => cli.kill(stoppingSignal), 500)
  })

  it('should write to stdout on pdf only file name on -v', function (done) {
    closeCallback = (code) => {
      expect(code).to.equal(0)
      done()
    }

    messageCallback = (m) => {
      const message = m.toString()
      if (message.startsWith('Start watch')) return
      if (message.startsWith('Log file')) return
      if (message.startsWith('Stop watching')) return
      expect(message).to.equal(`${newPdfFile}\n`)
    }

    errorCallback = done

    let cli = startCLI([`-f=${logFile}`, `-p=${__dirname}`, '-v'])

    setTimeout(() => fs.writeFileSync(newPdfFile, 'content'), 200)
    setTimeout(() => cli.kill(stoppingSignal), 500)
  })

  it('should not start on bad path', function (done) {
    closeCallback = (code) => {
      expect(code).to.equal(254)
      done()
    }

    startCLI(['-p=/notexist/folder'])
  })

  it('should not start on bad log file', function (done) {
    closeCallback = (code) => {
      expect(code).to.equal(254)
      done()
    }

    startCLI([`-f=/notexist/folder/log-file.log`])
  })

  it('should not start on directory instead log file', function (done) {
    closeCallback = (code) => {
      expect(code).to.equal(254)
      done()
    }

    startCLI([`-f=${__dirname}`])
  })
})
