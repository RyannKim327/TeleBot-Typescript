import ytdl from "ytdl-core";
const { choosy, download, search } = require("tubidy-scrape")
import {
	createReadStream,
	createWriteStream,
	existsSync,
	mkdirSync,
	unlink,
} from "fs";

import https from 'https'

export async function main(api: any, event: any, regex: any) {
	let data = regex[0];
	if(data.startsWith("/music ")){
		let x = data.split(" ")
		x.shift()
		data = x.join(" ")
	}
	console.log(data)
	const a = await search(data)
	console.log("-- Search --")
	console.log(a[0].link)
	const b = await choosy(a[0].link)
	console.log("-- Choosy --")
	console.log(b)
	if(b.length > 0){
		const c = await download(b[0].link)
		console.log("-- Download --")
		console.log(c)
		
		const file = `${__dirname}/../../temp/${event.chat.id}/${a[0].title.replace(/\//gi, "")}.mp3`;
		
		if (existsSync(file)) {
			return api.sendMessage(
				event.chat.id,
				"Your request is still in process.",
			);
		}
	
		if (!existsSync(`${__dirname}/../../temp/${event.chat.id}`)) {
			mkdirSync(`${__dirname}/../../temp/${event.chat.id}`);
		}
		
		const file2 = createWriteStream(`temp/${event.chat.id}/${a[0].title.replace(/\//gi,"")}.mp3`,);
		https.get(c.download, (r: any) => {
			r.pipe(file2)
			file2.on("finish", async () => {
				api.sendAudio(
					event.chat.id,
					createReadStream(file).on("end", () => {
						if (existsSync(file)) {
							unlink(file, (error) => {});
							api.deleteMessage(event.chat.id, event.message_id);
						}
					}),
				);
			});
		})
	}else{
		api.deleteMessage(event.chat.id, event.message_id);
	}
}
