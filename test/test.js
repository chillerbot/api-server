const assert = require('assert')
require('../src/seed')
const { getPlaytime } = require('../src/database')

assert.equal(getPlaytime('xxx'), 110)
assert.equal(getPlaytime('zzz'), 666)
