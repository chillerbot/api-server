const { insertPlaytime } = require('./database')

for(let i = 0; i < 10; i++) {
    insertPlaytime('xxx', 'nameless tee', '127.0.0.1', 10)
}
insertPlaytime('xxx', 'brainless tee', '127.0.0.1', 10)
insertPlaytime('zzz', 'ChillerDragon', '127.0.0.1', 666)
