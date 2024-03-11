import ytdl from "ytdl-core";
import { createReadStream, createWriteStream, existsSync, mkdirSync, unlink } from "fs";

const YoutubeMusicApi = require("youtube-music-api");
const yt = new YoutubeMusicApi();

export async function main(api: any, event: any, regex: any) {
	const data = regex[1]

	let music: any = {
		content: [],
	}
	await yt.initalize();
	music = await yt.search(data.replace(/[^\w\s]/gi, ""), "video");

	const url = `https://www.youtube.com/watch?v=${music.content[0].videoId}`;
	const info = await ytdl.getInfo(url);
	const file = `${__dirname}/../../temp/${event.chat.id}/${info.videoDetails.title.replace(/\//gi, "")}.mp3`;

	if (music.content.length <= 0) {
		return api.sendMessage(event.chat.id, "There's no video found.");
	} else if (music.content[0].videoId == undefined) {
		return api.sendMessage(event.chat.id, "There's no video found.");
	} else {
		if (existsSync(file)) {
			return api.sendMessage(
				event.chat.id,
				"Your request is still in process.",
			)
		}

		if(!existsSync(`${__dirname}/../../temp/${event.chat.id}`)){
			mkdirSync(`${__dirname}/../../temp/${event.chat.id}`)
		}

		const file2 = createWriteStream(`temp/${event.chat.id}/${info.videoDetails.title.replace(/\//gi, "")}.mp3`);
		ytdl(url, {
			quality: "lowest",
		})
		.pipe(file2)
		.on("finish", async () => {
			api.sendAudio(event.chat.id, createReadStream(file).on("end", () => {
				if (existsSync(file)) {
					unlink(file, (error) => {})
					api.deleteMessage(event.chat.id, event.message_id)
				}
			}))
		})
	}
}
