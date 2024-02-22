import { Client, MessageTypes, MessageMedia } from 'whatsapp-web.js';
import { createCanvas, loadImage, registerFont, Canvas, Image } from 'canvas';
import * as fs from 'fs';
import axios, { AxiosRequestConfig } from 'axios';
import FormData from 'form-data';
import * as path from 'path';
import { obterNomeAleatorio, consoleErro } from './util';
import msgs_texto from './msgs';
import sharp from 'sharp';
const gifyImport = require('gify') as any;

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

    private static getApiKey(): string | undefined {
        const apiKey = process.env.API_REMOVEBG;
        if (apiKey?.trim() === '??????') {
            console.log('API_REMOVEBG não foi definida.');
        }
        return apiKey?.trim();
    }

    public static removerFundoImagem = async (buffer: Buffer, mimetype: string): Promise<string> => {
        try {
            const imagemEntradaCaminho: string = path.resolve('media/img/tmp/' + obterNomeAleatorio('.jpg'));
            fs.writeFileSync(imagemEntradaCaminho, buffer);

            const data: FormData = new FormData();
            data.append('size', 'auto');
            data.append('image_file', fs.createReadStream(imagemEntradaCaminho));

            interface Config {
                method: string;
                url: string;
                data: FormData;
                responseType: string;
                headers: {
                    'X-Api-Key': string;
                };
                encoding: null;
            }

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
            // Restante do seu código aqui...
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

    public static videoCircular = async (base64: MessageMedia): Promise<string> => {
        let videoBuffer;

        if (base64.mimetype === 'image/gif') {
            videoBuffer = await gifyImport(Buffer.from(base64.data, 'base64'));
        } else {
            videoBuffer = Buffer.from(base64.data, 'base64');
        }
        const circularVideoBuffer = await sharp({
            create: { width: 512, height: 512, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
        })
            .composite([{ input: videoBuffer, blend: 'dest-in' }])
            .webp() // ou o formato desejado (webp, png, etc.)
            .toBuffer();

        // Converte o vídeo circular para base64
        const circularVideoBase64 = circularVideoBuffer.toString('base64');
        return circularVideoBase64;
    };
}

export default Stickers;
