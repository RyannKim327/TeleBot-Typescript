import ytdl from "ytdl-core";
import { createReadStream, createWriteStream, existsSync, mkdirSync, unlink } from "fs";

const YoutubeMusicApi = require("youtube-music-api");
const yt = new YoutubeMusicApi();

export async function main(api: any, event: any, regex: any) {
	api.sendMessage(event.chat.id, "Hi")
	const data = regex[1];
	const ytFormat1 = /youtube.com\/watch\?v=([a-zA-Z0-9\-_]{11}$)/;
	const ytFormat2 = /youtu.be\/([a-zA-Z0-9\-_]+)/;
	let music: any = {
		content: [],
	};
	if (ytFormat1.test(data)) {
		music = {
			content: [
				{
					videoId: data.match(ytFormat1)[1],
				},
			],
		};
	} else if (ytFormat2.test(data)) {
		music = {
			content: [
				{
					videoId: data.match(ytFormat2)[1],
				},
			],
		};
	} else {
		await yt.initalize();
		music = await yt.search(data.replace(/[^\w\s]gi/, ""), "video");
	}

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
			);
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
					unlink(file, (error) => {});
				}
				api.deleteMessage(event.chat.id, event.from)
			}));
		});
	}
}