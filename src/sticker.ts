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
                ctx.strokeText(line, canvas.width / 2, lineY);
                ctx.fillText(line, canvas.width / 2, lineY);
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

            const stream = encoder.createReadStream();
            stream.pipe(createWriteStream(output));

            encoder.start();
            encoder.setRepeat(0); // 0 for repeat, -1 for no-repeat
            encoder.setDelay(500); // frame delay in ms
            encoder.setQuality(10); // image quality. 10 is default.

            const colors = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'];

            colors.forEach(color => {
                ctx.fillStyle = color;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = 'white';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.font = '50px impact';
                ctx.fillText(texto, canvas.width / 2, canvas.height / 2);

                encoder.addFrame(ctx);
            });

            encoder.finish();

            await new Promise(resolve => setTimeout(resolve, 3000));
            const image = await loadImage(path.resolve('media/videos/animated.gif'));
            await ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
            const imageBase64 = canvas.toDataURL().replace(/^data:image\/png;base64,/, '');

            return imageBase64;
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

    public static removerFundoImagem = async (buffer: Buffer, mimetype: string): Promise<string> => {
        const imagemEntradaCaminho: string = path.resolve('media/img/tmp/' + obterNomeAleatorio('.jpg'));
        try {
            fs.writeFileSync(imagemEntradaCaminho, buffer);

            const data: FormData = new FormData();
            data.append('size', 'auto');
            data.append('image_file', fs.createReadStream(imagemEntradaCaminho));

            // interface Config {
            //     method: string;
            //     url: string;
            //     data: FormData;
            //     responseType: string;
            //     headers: {
            //         'X-Api-Key': string;
            //     };
            //     encoding: null;
            // }

            const config: AxiosRequestConfig = {
                method: 'post',
                url: 'https://api.remove.bg/v1.0/removebg',
                data: data,
                responseType: 'arraybuffer',
                headers: {
                    ...data.getHeaders(),
                    'X-Api-Key': Stickers.getApiKey(),
                },
            };

            const res = await axios(config);
            const base64 = Buffer.from(res.data).toString('base64');

            fs.unlinkSync(imagemEntradaCaminho);
            return base64;
        } catch (err) {
            if (imagemEntradaCaminho) {
                fs.unlinkSync(imagemEntradaCaminho);
            }
            consoleErro(
                'Houve um erro na API REMOVEBG, confira se o limite gratuito da chave excedeu ou se ela está configurada.',
                'API REMOVEBG',
            );
            throw new Error();
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
        const output = path.resolve(`media/videos/output_${obterNomeAleatorio('.mp4')}`);
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
}

export default Stickers;
