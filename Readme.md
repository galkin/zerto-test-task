# Zetro test task
[![Build Status](https://travis-ci.org/galkin/zerto-test-task.svg?branch=master)](https://travis-ci.org/galkin/zerto-test-task)
[![Dependency Status](https://david-dm.org/galkin/zerto-test-task.svg)](https://david-dm.org/galkin/zerto-test-task)
[![devDependency Status](https://david-dm.org/galkin/zerto-test-task/dev-status.svg)](https://david-dm.org/galkin/zerto-test-task#info=devDependencies)
## Description

The NodeJS CLI will listen to a change event of the directory mentioned by user input.

When a user places a file in the source directory, the program will identify it and append the filename to a log file, as follow:
1. [*.pdf] files should be written to log as-is.
2. Other types of files should be logged with the current time added to the filename. For example a file originally called "root.png" will be renamed to "root_1235.png"

Please add unit tests / integration test / automation tests as much as you can.

## Install

`npm install -g @galkin/zetro`

## Running

```
$ zetro
Options:
  --file, -f       Log file                    [string] [default: "./zerto.log"]
  --verbose, -v    Verbose level                                         [count]
  --recursive, -r  Recursive                                           [boolean]
  --path, -p       Directory path                        [string] [default: "."]
  --help, -h       Show help                                           [boolean]
```

## Testing Approach

Download [repository](https://github.com/galkin/zerto-test-task)
Run `npm test`. It will run:
- linting for code and tests
- functional tests with mocha
