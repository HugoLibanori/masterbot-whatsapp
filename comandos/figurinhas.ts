import { Client, MessageMedia } from 'whatsapp-web.js';
require('dotenv').config();
import { removerNegritoComando, erroComandoMsg } from '../src/util';
import Stickers from '../src/sticker';
import msgs_texto from '../src/msgs';

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
                            const mediaData: MessageMedia = (await message.downloadMedia()) || (await media_quoted.downloadMedia());
                            if (!mediaData) return await message.reply('Erro ao fazer o download da imagem, por favor não apague!');
                            dadosStickers.stickerName += ' Sticker';
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
                    }
                }
            }
        } catch (err: any) {
            console.log(err);
        }
    }
}

export default Figurinhas;
