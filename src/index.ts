const tg = require("node-telegram-bot-api")
import { rm, mkdirSync, readFileSync, writeFileSync } from "fs"

const token = "6537153326:AAEJOD5BH9ifVe6wAH-L8FkKX0NzYJnbVPE"
const bot = new tg(token, {
    polling: true
})

const json = JSON.parse(readFileSync(`${__dirname}/../config.json`, "utf-8"))

import { main } from './commands/music'

const start = async () => {
    rm(`${__dirname}/../temp`, { recursive: true }, (error: any) => {
            if(error) return console.error(`Pre may error ${JSON.stringify(error)}`)
            setTimeout(() => {
                mkdirSync(`${__dirname}/../temp`)
            }, 500)
        }
    )
    bot.onText(/!music\s([\w\W]+)/gi, (msg: any, match: RegExp) => {
        main(bot, msg, match)
        json[msg.chat.id] = "music"
        writeFileSync(`${__dirname}/../config.json`, JSON.stringify(json), "utf-8")
    })
    bot.onText(/([\w\W]+)gi/, (msg: any, match: RegExp) => {
        if(json[msg.chat.id]){
            main(bot, msg, match)
        }
    })
}

start()
setInterval(() => {
    console.log("Yamete")
}, 1000)