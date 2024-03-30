const tg = require("node-telegram-bot-api");
import express, { Express } from 'express'
import axios from 'axios'
import { rm, mkdirSync, readFileSync, writeFileSync, existsSync } from "fs";

const app: Express = express()

const tokens = JSON.parse(readFileSync("tokens.json", "utf-8")) // "6537153326:AAEJOD5BH9ifVe6wAH-L8FkKX0NzYJnbVPE";

const json = JSON.parse(readFileSync(`${__dirname}/../config.json`, "utf-8"));

import { main } from "./commands/music";

const start = async (token_: string|undefined) => {
	try{
		const bot = new tg(token_, {
			polling: true
		})
		if (existsSync(`${__dirname}/../temp`)) {
			rm(`${__dirname}/../temp`, { recursive: true }, (error: any) => {
				if (error)
					return console.error(`Pre may error ${JSON.stringify(error)}`);
				setTimeout(() => {
					mkdirSync(`${__dirname}/../temp`);
				}, 500);
			});
		} else {
			mkdirSync(`${__dirname}/../temp`);
		}

		bot.onText(/!music\s([\w\W]+)/gi, (msg: any, match: RegExp) => {
			main(bot, msg, match);
			json[msg.chat.id] = "music";
			writeFileSync(
				`${__dirname}/../config.json`,
				JSON.stringify(json),
				"utf-8",
			);
		});

		bot.onText(/([\w\W]+)/gi, (msg: any, match: RegExp) => {
			if (json[msg.chat.id] && msg.chat.id == msg.from.id) {
				console.log(JSON.stringify(msg))
				main(bot, msg, match);
			}
		});
	}catch(e){}
};


app.listen(3000, () => {
	console.log("Ey")
})

app.get("/", (req: any, res: any) => {
	res.sendFile(`${__dirname}/templates/index.html`)
})

app.get("/keep-alive", (req, res) => {
	res.send("Buhay pa")
})

app.get("/token", async (req: any, res: any) => {
	if(tokens.tokens.includes(req.query.token)){
		res.send("This token is already included in the server")
	}else{
		tokens.tokens.push(req.query.token)
		writeFileSync("tokens.json", JSON.stringify(tokens, null, 2), "utf-8")
		await start(req.query.token)
		res.send("Please check if your bot is working.")
	}
})

for(let i = 0; i < tokens.tokens.length; i++){
	start(tokens.tokens[i])
}

setInterval(() => {
	axios.get("http://localhost:3000/keep-alive").then(r => {
		console.log(r.data)
	}).catch(e => {
		console.error(e)
	})
}, 1000);
