import { Client, MessageMedia } from 'whatsapp-web.js';
require('dotenv').config();
import { removerNegritoComando, erroComandoMsg } from '../src/util';
import Stickers from '../src/sticker';
import msgs_texto from '../src/msgs';
import fs from 'fs';
import path from 'path';

class Figurinhas {
    async criarFigurinhas(client: Client, message: any): Promise<void> {
        try {
            const { body, hasQuotedMsg, hasMedia, type, from } = message;
            const { quotedMsg, mimetype } = message._data;
            let command: string = body.split(' ')[0];
            const args: string[] = body.split(' ');
            command = removerNegritoComando(command).toLowerCase();

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
            if (command === `${process.env.PREFIX}s`) {
                try {
                    if (hasMedia || hasQuotedMsg) {
                        interface DadosMsgImg {
                            tipo: string;
                            mimetype: string;
                        }

                        const dadosMsgImg: DadosMsgImg = {
                            tipo: hasMedia ? type : quotedMsg.type,
                            mimetype: hasMedia ? mimetype : quotedMsg.mimetype,
                        };
                        if (dadosMsgImg.tipo === 'image') {
                            await message.reply('[AGUARDE] Em andamento ⏳ espere por favor.');
                            const media_quoted: any = await message.getQuotedMessage();
                            dadosStickers.stickerName += ' Sticker';
                            const mediaData: MessageMedia = (await message.downloadMedia()) || (await media_quoted.downloadMedia());
                            if (!mediaData) return await message.reply('Erro ao fazer o download da imagem, por favor não apague!');

                            if (args[1] === '1') {
                                const imageCircle = await Stickers.imageCircular(mediaData);
                                const imageCircular = new MessageMedia('image/png', imageCircle);
                                await client.sendMessage(from, imageCircular, dadosStickers).catch((err: any) => {
                                    console.log(err);
                                    message.reply(msgs_texto.figurinhas.sticker.erro_s);
                                });
                                return;
                            }

                            await client.sendMessage(from, mediaData, dadosStickers).catch((err: any) => {
                                console.log(err);
                                message.reply(msgs_texto.figurinhas.sticker.erro_s);
                            });
                        } else {
                            return await message.reply(erroComandoMsg(command));
                        }
                    } else {
                        return await message.reply(erroComandoMsg(command));
                    }
                } catch (err: any) {
                    console.log(err);
                }
            } else if (command === `${process.env.PREFIX}sgif`) {
                try {
                    if (hasMedia || quotedMsg) {
                        interface DadosMsgGif {
                            mimetype: string;
                            duracao: number;
                            mensagem: any;
                        }

                        const dadosMsgGif: DadosMsgGif = {
                            mimetype: hasMedia ? mimetype : quotedMsg.mimetype,
                            duracao: hasMedia ? message.duration : quotedMsg.duration,
                            mensagem: message,
                        };
                        if (dadosMsgGif.mimetype === 'video/mp4' && dadosMsgGif.duracao < 11) {
                            await message.reply(msgs_texto.geral.espera);
                            const media_quoted: any = await message.getQuotedMessage();
                            const mediaData: MessageMedia = (await message.downloadMedia()) || (await media_quoted.downloadMedia());
                            dadosStickers.stickerName += ' Sticker animado';
                            if (!mediaData) return await message.reply(msgs_texto.figurinhas.sticker.download);

                            // if (args[1] === '1') {
                            //     const videoCircle = await Stickers.videoCircular(mediaData);
                            //     const videoCircular = new MessageMedia(mediaData.mimetype, videoCircle);
                            //     await client.sendMessage(from, videoCircular, dadosStickers).catch((err: any) => {
                            //         console.log(err);
                            //         message.reply(msgs_texto.figurinhas.sticker.erro_s);
                            //     });
                            //     return;
                            // }

                            await client.sendMessage(from, mediaData, dadosStickers).catch((err: any) => {
                                console.log(err);
                                message.reply(msgs_texto.figurinhas.sticker.erro_sgif);
                            });
                        } else {
                            return await message.reply(msgs_texto.figurinhas.sticker.video_invalido);
                        }
                    } else {
                        return await message.reply(erroComandoMsg(command));
                    }
                } catch (err: any) {
                    console.log(err);
                }
            } else if (command === `${process.env.PREFIX}tps`) {
                if (args.length === 1 || type != 'chat') return await message.reply(erroComandoMsg(command));
                const usuarioTexto: string = body.slice(5).trim();
                if (usuarioTexto.length > 100) return message.reply(msgs_texto.figurinhas.tps.texto_longo);
                try {
                    const imagemBase64 = await Stickers.textoParaFoto(usuarioTexto);
                    const media = new MessageMedia('image/png', imagemBase64);
                    dadosStickers.stickerName += ' Texto para Sticker';
                    await client.sendMessage(from, media, dadosStickers).catch(err => {
                        message.reply(msgs_texto.figurinhas.sticker.erro_s);
                        console.log(err);
                    });
                } catch (err: any) {
                    await message.reply(err.message);
                }
            } else if (command === `${process.env.PREFIX}simg`) {
                if (quotedMsg && quotedMsg.type === 'sticker') {
                    const quotedMessage: any = await message.getQuotedMessage();
                    const media: MessageMedia = await quotedMessage.downloadMedia();
                    await client.sendMessage(from, media, { caption: 'aqui seu sticker em imagem.' });
                } else {
                    await message.reply(erroComandoMsg(command));
                }
            } else if (command === `${process.env.PREFIX}ssf`) {
                if (hasMedia || quotedMsg) {
                    interface DadosMsgSsf {
                        tipo: string;
                        mimetype: string;
                    }

                    const dadosMsgSsf: DadosMsgSsf = {
                        tipo: hasMedia ? type : quotedMsg.type,
                        mimetype: hasMedia ? mimetype : quotedMsg.mimetype,
                    };

                    if (dadosMsgSsf.tipo === 'image') {
                        const media_quoted: any = await message.getQuotedMessage();
                        const midiaData: MessageMedia = (await message.downloadMedia()) || (await media_quoted.downloadMedia());
                        const buffer: Buffer = Buffer.from(midiaData.data, 'base64');
                        try {
                            const saidaImg: string = await Stickers.removerFundoImagem(buffer, midiaData.mimetype);
                            const dataImg: MessageMedia = new MessageMedia('image/png', saidaImg);
                            dadosStickers.stickerName += ' Sticker sem fundo';
                            await client.sendMessage(from, dataImg, dadosStickers).catch(err => {
                                console.log(err);
                                message.reply(msgs_texto.figurinhas.sticker.erro_s);
                            });
                        } catch (err: any) {
                            console.log(err);
                        }
                    } else {
                        return await message.reply(msgs_texto.figurinhas.sticker.ssf_imagem);
                    }
                } else {
                    await message.reply(erroComandoMsg(command));
                }
            } else if (command === `${process.env.PREFIX}figurinhas`) {
                const imageFolder = path.resolve('figurinhas');

                try {
                    const files = fs.readdirSync(imageFolder);
                    const imageFiles = files.filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file));
                    if (imageFiles.length === 0)
                        return await message.reply('Sem imagens para enviar, adicione dentro da pasta figurinhas do seu projeto.');
                    await message.reply(`Ok, vou enviar um total de ${imageFiles.length} figurinhas, ⏳ aguarde!`);

                    dadosStickers.stickerName += ' Sticker';
                    for (const file of files) {
                        const media = MessageMedia.fromFilePath(`${imageFolder}/${file}`);
                        await client.sendMessage(from, media, dadosStickers);

                        // Atraso de 1 segundo antes de enviar a próxima figurinha
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                    await message.reply('✅ Figurinhas enviadas com sucesso.');
                } catch (error) {
                    console.error('Erro ao ler a pasta de imagens:', error);
                }
            }
        } catch (err: any) {
            console.log(err);
        }
    }
}

export default Figurinhas;
