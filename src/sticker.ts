import { Client, MessageTypes, MessageMedia } from 'whatsapp-web.js';
import { createCanvas, loadImage, registerFont, Canvas, Image, CanvasRenderingContext2D } from 'canvas';
import fs, { createWriteStream } from 'fs';
import axios, { AxiosRequestConfig } from 'axios';
import FormData from 'form-data';
import * as path from 'path';
import { obterNomeAleatorio, consoleErro } from './util';
import msgs_texto from './msgs';
import sharp from 'sharp';
const gifyImport = require('gify') as any;
import GIFEncoder = require('gifencoder');
import ffmpeg from 'fluent-ffmpeg';
import qs from 'qs';

class Stickers {
    public static textoParaFoto = async (texto: string): Promise<any> => {
        try {
            registerFont('./fonts/impact.ttf', { family: 'impact' });
            const canvas: Canvas = createCanvas(512, 512);
            const ctx = canvas.getContext('2d');
            const fontColor: string = 'white';

            ctx.fillStyle = 'rgba(0, 0, 0, 0)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            const maxFontSize: number = 100;
            const minFontSize: number = 20;
            const margin: number = 40;

            let fontSize: number = maxFontSize;
            const words: string[] = texto.split(' ');

            let textFits: boolean = false;
            let lines: string[] = [];

            while (!textFits && fontSize >= minFontSize) {
                ctx.font = `${fontSize}px 'impact'`;

                lines = [];
                let currentLine: string = '';

                words.forEach(word => {
                    const testLine: string = currentLine + ' ' + word;
                    const testWidth: number = ctx.measureText(testLine).width;

                    if (testWidth > canvas.width - margin * 2) {
                        lines.push(currentLine.trim());
                        currentLine = word;
                    } else {
                        currentLine = testLine;
                    }
                });

                lines.push(currentLine.trim());

                const totalTextHeight: number = lines.length * (fontSize * 1.2);
                if (totalTextHeight <= canvas.height - margin * 2) {
                    textFits = true;
                } else {
                    fontSize--;
                }
            }

            const lineHeight: number = fontSize * 1.2;
            const startY: number = (canvas.height - lineHeight * lines.length) / 2;

            ctx.strokeStyle = 'black';
            ctx.lineWidth = 8;
            ctx.fillStyle = fontColor;
            ctx.font = `${fontSize}px 'impact'`;

            lines.forEach((line, index) => {
                const lineY: number = startY + index * lineHeight;
                ctx.strokeText(line, canvas.width / 2, lineY + ctx.lineWidth / 2);
                ctx.fillText(line, canvas.width / 2, lineY + ctx.lineWidth / 2);
            });

            const dataURL: string = canvas.toDataURL();
            const image: Image = await loadImage(dataURL);
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
            const imageBase64: string = canvas.toDataURL().replace(/^data:image\/png;base64,/, '');

            fs.writeFileSync('sticker.png', canvas.toBuffer('image/png'));
            fs.unlinkSync('sticker.png');

            return imageBase64;
        } catch (err: any) {
            console.log(err.message, 'STICKER textoParaFoto');
            throw new Error('Erro na conversão de texto para imagem.');
        }
    };

    public static textoParaGif = async (texto: string): Promise<string> => {
        try {
            const output = path.resolve('media/videos/animated.gif');
            registerFont('./fonts/impact.ttf', { family: 'impact' });
            const canvas = createCanvas(512, 512);
            const ctx: any = canvas.getContext('2d');
            const encoder = new GIFEncoder(512, 512);

            encoder.setTransparent(0x00000000);

            const stream = encoder.createReadStream();
            stream.pipe(createWriteStream(output));

            encoder.start();
            encoder.setRepeat(0);
            encoder.setDelay(500);
            encoder.setQuality(10);

            const colors = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'];

            const words = texto.split(' ');
            let fontSize = 100;
            if (texto.length > 50) {
                fontSize = 50;
            }
            const lineHeight = fontSize;
            let line = '';
            let y = canvas.height / 2 - (lineHeight * (words.length - 1)) / 2;

            colors.forEach(color => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = color;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.font = `${fontSize}px impact`;

                for (let n = 0; n < words.length; n++) {
                    const testLine = line + words[n] + ' ';
                    const metrics = ctx.measureText(testLine);
                    const testWidth = metrics.width;
                    if (testWidth > canvas.width && n > 0) {
                        ctx.fillText(line, canvas.width / 2, y);
                        line = words[n] + ' ';
                        y += lineHeight;
                    } else {
                        line = testLine;
                    }
                }
                ctx.fillText(line, canvas.width / 2, y);
                y = canvas.height / 2 - (lineHeight * (words.length - 1)) / 2;
                line = '';

                encoder.addFrame(ctx);
            });

            encoder.finish();

            await new Promise(resolve => setTimeout(resolve, 3000));
            const base64Gif = fs.readFileSync(output, { encoding: 'base64' });

            await new Promise(resolve => setTimeout(resolve, 3000));
            fs.unlinkSync(output);

            return base64Gif;
        } catch (err: any) {
            console.log(err, 'Erro na conversão de texto para GIF.');
            throw new Error('Erro na conversão de texto para GIF.');
        }
    };

    private static getApiKey(): string | undefined {
        const apiKey = process.env.API_REMOVEBG;
        if (apiKey?.trim() === '??????') {
            console.log('API_REMOVEBG não foi definida.');
        }
        return apiKey?.trim();
    }

    public static removerFundoImagem = async (imagemBuffer: Buffer): Promise<string> => {
        try {
            const nomeArquivo = obterNomeAleatorio('.png');
            const data = new FormData();
            data.append('files', imagemBuffer, { filename: nomeArquivo });

            let config: AxiosRequestConfig = {
                method: 'post',
                maxBodyLength: Infinity,
                url: 'https://download1.imageonline.co/ajax_upload_file.php',
                headers: {
                    'User-Agent': ' Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0',
                    Accept: ' */*',
                    Origin: ' https://imageonline.co',
                    Connection: ' keep-alive',
                    Referer: ' https://imageonline.co/',
                    'Sec-Fetch-Dest': ' empty',
                    'Sec-Fetch-Mode': ' cors',
                    'Sec-Fetch-Site': ' same-site',
                    ...data.getHeaders(),
                },
                data: data,
            };

            const respostaUpload = await axios.request(config).catch(() => {
                throw new Error('Erro na requisição de fazer upload da foto');
            });

            const dadosUpload = JSON.parse(JSON.stringify(respostaUpload.data));
            const newData: FormData = new FormData();
            newData.append('name', dadosUpload.files[0].name);
            newData.append('originalname', dadosUpload.files[0].old_name);
            newData.append('option3', dadosUpload.files[0].extension);
            newData.append('option4', '1');

            config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: 'https://download1.imageonline.co/pngmaker.php',
                headers: {
                    'User-Agent': ' Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0',
                    Accept: ' */*',
                    'Accept-Language': ' pt-BR,pt;q=0.8,en-US;q=0.5,en;q=0.3',
                    'Accept-Encoding': ' gzip, deflate, br',
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Origin: ' https://imageonline.co',
                    Connection: ' keep-alive',
                    Referer: ' https://imageonline.co/',
                    'Sec-Fetch-Dest': ' empty',
                    'Sec-Fetch-Mode': ' cors',
                    'Sec-Fetch-Site': ' same-site',
                },
                data: newData,
            };

            const respostaFotoUrl = await axios.request(config).catch(() => {
                throw new Error('Erro na requisição de obter a imagem sem fundo.');
            });
            const fotoUrl = respostaFotoUrl.data.match(
                /https:\/\/download1\.imageonline\.co\/download\.php\?filename=[A-Za-z0-9]+-imageonline\.co-[0-9]+\.png/m,
            );
            const imagemBufferResposta = await axios.get(fotoUrl[0], { responseType: 'arraybuffer' }).catch(() => {
                throw new Error('Erro em obter o buffer da imagem sem fundo.');
            });
            return imagemBufferResposta.data.toString('base64');
        } catch (err: any) {
            err.message = `API removerFundo - ${err.message}`;
            throw err;
        }
    };
    public static autoSticker = async (message: any, client: Client): Promise<void> => {
        interface DadosStickers {
            sendMediaAsSticker: boolean;
            stickerAuthor: string;
            stickerName: string;
        }

        const dadosStickers: DadosStickers = {
            sendMediaAsSticker: true,
            stickerAuthor: `${process.env.NOME_AUTOR_FIGURINHAS}`,
            stickerName: `${process.env.NOME_BOT}`,
        };

        if (message.type === MessageTypes.IMAGE) {
            const media_quoted: any = await message.getQuotedMessage();
            const mediaData: MessageMedia = (await message.downloadMedia()) || (await media_quoted.downloadMedia());
            dadosStickers.stickerName += ' Sticker';
            await client.sendMessage(message.from, mediaData, dadosStickers).catch((err: any) => {
                console.log(err);
                message.reply(msgs_texto.figurinhas.sticker.erro_s);
            });
        }
        if (message.type == MessageTypes.VIDEO) {
            if (message.duration > 11) return;
            const media_quoted: any = await message.getQuotedMessage();
            const mediaData: MessageMedia = (await message.downloadMedia()) || (await media_quoted.downloadMedia());
            dadosStickers.stickerName += ' Sticker animado';
            if (!mediaData) return await message.reply(msgs_texto.figurinhas.sticker.download);
            await client.sendMessage(message.from, mediaData, dadosStickers).catch((err: any) => {
                console.log(err);
                message.reply(msgs_texto.figurinhas.sticker.erro_sgif);
            });
        }
    };

    public static imageCircular = async (base64: MessageMedia) => {
        const imageBuffer = Buffer.from(base64.data, 'base64');

        // Usa o sharp para recortar a imagem em círculo e redimensionar para 512x512
        const circularImageBuffer = await sharp(imageBuffer)
            .resize(512, 512)
            .composite([{ input: Buffer.from('<svg><circle cx="256" cy="256" r="256"/></svg>'), blend: 'dest-in' }])
            .png()
            .toBuffer();

        const circularImageBase64 = circularImageBuffer.toString('base64');

        return circularImageBase64;
    };

    public static videoCircular = async (caminho: string): Promise<string> => {
        try {
            const outputGif = path.resolve(`media/videos/circular_${obterNomeAleatorio('.gif')}`);
            const outputWebp = path.resolve(`media/videos/circular_${obterNomeAleatorio('.webp')}`);

            return new Promise((resolve, reject) => {
                ffmpeg.ffprobe(caminho, (err, metadata) => {
                    if (err) {
                        reject(err);
                    } else {
                        const stream = metadata.streams[0];
                        if (stream && stream.width && stream.height) {
                            const menorLado = Math.min(stream.width, stream.height);
                            const x = (stream.width - menorLado) / 2;
                            const y = (stream.height - menorLado) / 2;

                            const encoder = new GIFEncoder(menorLado, menorLado);
                            const streamGif = encoder.createReadStream();
                            streamGif.pipe(createWriteStream(outputGif));

                            encoder.start();
                            encoder.setRepeat(0);
                            encoder.setDelay(500);
                            encoder.setQuality(10);

                            const canvas = createCanvas(menorLado, menorLado);
                            const ctx: any = canvas.getContext('2d');

                            ffmpeg(caminho)
                                .outputOptions([
                                    `-vf crop=${menorLado}:${menorLado}:${x}:${y},scale=${menorLado}:${menorLado}`,
                                    `-pix_fmt rgb24`,
                                ])
                                .format('image2pipe')
                                .pipe()
                                .on('data', data => {
                                    sharp(data)
                                        .resize(menorLado, menorLado)
                                        .toBuffer()
                                        .then(buffer => {
                                            const img = new Image();
                                            img.onload = () => {
                                                ctx.clearRect(0, 0, canvas.width, canvas.height);
                                                ctx.save();
                                                ctx.beginPath();
                                                ctx.arc(canvas.width / 2, canvas.height / 2, menorLado / 2, 0, Math.PI * 2, true);
                                                ctx.closePath();
                                                ctx.clip();
                                                ctx.drawImage(img, 0, 0, menorLado, menorLado);
                                                ctx.restore();
                                                encoder.addFrame(ctx);
                                            };
                                            img.src = buffer;
                                        })
                                        .catch(reject);
                                })
                                .on('end', () => {
                                    encoder.finish();
                                    ffmpeg(outputGif)
                                        .outputOptions([`-vcodec libwebp`, `-vf fps=30`, `-loop 0`])
                                        .save(outputWebp)
                                        .on('end', () => {
                                            const gifBuffer = fs.readFileSync(outputWebp);
                                            const base64Gif = gifBuffer.toString('base64');
                                            resolve(base64Gif);
                                            fs.unlinkSync(outputGif);
                                            fs.unlinkSync(outputWebp);
                                        })
                                        .on('error', reject);
                                })
                                .on('error', reject);
                        } else {
                            reject(new Error('Não foi possível obter a largura e a altura do vídeo.'));
                        }
                    }
                });
            });
        } catch (err: any) {
            console.log(err.message, 'Erro na conversão de vídeo para GIF.');
            throw new Error('Erro na conversão de vídeo para GIF.');
        }
    };

    public static salvarArquivoBase64 = (caminho: string, dadosBase64: string): Promise<string> => {
        return new Promise((resolve, reject) => {
            const buffer = Buffer.from(dadosBase64, 'base64');

            fs.promises
                .writeFile(caminho, buffer)
                .then(() => {
                    resolve(caminho);
                })
                .catch(err => {
                    console.error('Erro ao salvar o arquivo:', err);
                    reject(err);
                });
        });
    };

    public static recortarVideo = (caminho: string): Promise<string> => {
        const output = path.resolve(`media/videos/output_${obterNomeAleatorio('.h264')}`);
        return new Promise((resolve, reject) => {
            ffmpeg.ffprobe(caminho, (err, metadata) => {
                if (err) {
                    reject(err);
                } else {
                    const stream = metadata.streams[0];
                    if (stream && stream.width && stream.height) {
                        const menorLado = Math.min(stream.width, stream.height);
                        const x = (stream.width - menorLado) / 2;
                        const y = (stream.height - menorLado) / 2;

                        ffmpeg(caminho)
                            .outputOptions([`-vf crop=${menorLado}:${menorLado}:${x}:${y}`])
                            .save(output)
                            .on('end', () => {
                                resolve(output);
                            })
                            .on('error', reject);
                    } else {
                        reject(new Error('Não foi possível obter a largura e a altura do vídeo.'));
                    }
                }
            });
        });
    };

    public static extrairEmojis = (texto: string): Array<string> | null => {
        const regexEmoji =
            /[\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E0}-\u{1F1FF}]/gu;
        const emojis = texto.match(regexEmoji);
        return emojis;
    };
}

export default Stickers;
