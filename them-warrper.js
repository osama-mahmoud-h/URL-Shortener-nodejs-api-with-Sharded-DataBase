require('colors')
module.exports = {
    error: message => console.log(message.red),
    warn: message => console.log(message.yellow),
    log: message =>console.log(message.yellow)
}