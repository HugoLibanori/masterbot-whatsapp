import { Client, MessageMedia } from 'whatsapp-web.js';
require('dotenv').config();
import { removerNegritoComando, erroComandoMsg, isAdminGroup, obterNomeAleatorio, consoleErro } from '../src/util';
import Stickers from '../src/sticker';
import msgs_texto from '../src/msgs';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import api from '../src/api';

class Figurinhas {
    async criarFigurinhas(client: Client, message: any): Promise<void> {
        try {
            const { body, hasQuotedMsg, hasMedia, type, from } = message;
            const { quotedMsg, mimetype, author } = message._data;
            let command: string = body.split(' ')[0];
            const dadosGrupo = await message.getChat();
            const isGroup = dadosGrupo.isGroup;
            const dadosAdmin = isGroup ? await dadosGrupo.groupMetadata.participants : '';
            const isGroupAdmins: boolean = isGroup ? isAdminGroup(author, dadosAdmin) : false;
            const args: string[] = body.split(' ');
            command = removerNegritoComando(command).toLowerCase();
            const ownerNumber = process.env.NUMERO_DONO?.trim();
            const isOwner = isGroup ? ownerNumber === author.replace(/@c.us/g, '') : ownerNumber === from.replace(/@c.us/g, '');
            const PREFIX = process.env.PREFIX || '!';

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
            if (command === `${PREFIX}s`) {
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
            } else if (command === `${PREFIX}sgif`) {
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

                            if (args[1] === '1') {
                                const pathVideo = path.resolve('media/videos/video_recortado.mp4');
                                const videoSave = await Stickers.salvarArquivoBase64(pathVideo, mediaData.data);
                                // Atraso de 3 segundo
                                await new Promise(resolve => setTimeout(resolve, 3000));
                                const videoCrop = await Stickers.recortarVideo(videoSave);
                                const videoRecortado = MessageMedia.fromFilePath(videoCrop);
                                await client.sendMessage(from, videoRecortado, dadosStickers).catch((err: any) => {
                                    console.log(err);
                                    message.reply(msgs_texto.figurinhas.sticker.erro_s);
                                });
                                await new Promise(resolve => setTimeout(resolve, 3000));
                                fs.unlinkSync(videoCrop);
                                fs.unlinkSync(videoSave);
                                return;
                            } else if (args[1] === '2') {
                                const pathVideo = path.resolve('media/videos/video_recortado_circular.mp4');
                                const videoSave = await Stickers.salvarArquivoBase64(pathVideo, mediaData.data);
                                // Atraso de 2 segundo
                                await new Promise(resolve => setTimeout(resolve, 2000));
                                const videoCrop = await Stickers.videoCircular(videoSave);
                                const videoRecortado = new MessageMedia('video/gif', videoCrop);
                                await client.sendMessage(from, videoRecortado, dadosStickers).catch((err: any) => {
                                    console.log(err);
                                    message.reply(msgs_texto.figurinhas.sticker.erro_s);
                                });
                                // fs.unlinkSync(videoCrop);
                                fs.unlinkSync(videoSave);
                                return;
                            }

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
            } else if (command === `${PREFIX}tps`) {
                if (args.length === 1 || type != 'chat') return await message.reply(erroComandoMsg(command));
                const usuarioTexto: string = body.slice(5).trim();
                if (usuarioTexto.length > 100) return message.reply(msgs_texto.figurinhas.tps.texto_longo);
                try {
                    await message.reply(msgs_texto.figurinhas.tps.espera);
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
            } else if (command === `${PREFIX}simg`) {
                if (quotedMsg && quotedMsg.type === 'sticker') {
                    const quotedMessage: any = await message.getQuotedMessage();
                    const media: MessageMedia = await quotedMessage.downloadMedia();
                    await client.sendMessage(from, media, { caption: 'aqui seu sticker em imagem.' });
                } else {
                    await message.reply(erroComandoMsg(command));
                }
            } else if (command === `${PREFIX}ssf`) {
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
                        await message.reply(msgs_texto.figurinhas.sticker.ssf_espera);
                        const media_quoted: any = await message.getQuotedMessage();
                        const midiaData: MessageMedia = (await message.downloadMedia()) || (await media_quoted.downloadMedia());
                        const buffer: Buffer = Buffer.from(midiaData.data, 'base64');
                        try {
                            const saidaImg: string = await Stickers.removerFundoImagem(buffer);
                            const dataImg: MessageMedia = new MessageMedia('image/png', saidaImg);
                            dadosStickers.stickerName += ' Sticker sem fundo';
                            await client.sendMessage(from, dataImg, dadosStickers).catch(err => {
                                console.log(err);
                                message.reply(msgs_texto.figurinhas.sticker.erro_s);
                            });
                        } catch (err: any) {
                            await message.reply('[❗] Sistem de remover fundo das imagens esta temporariamente fora!');
                            console.log(err);
                        }
                    } else {
                        return await message.reply(msgs_texto.figurinhas.sticker.ssf_imagem);
                    }
                } else {
                    await message.reply(erroComandoMsg(command));
                }
            } else if (command === `${PREFIX}figurinhas`) {
                if (isGroup) {
                    if (!isGroupAdmins) return message.reply(msgs_texto.permissao.apenas_admin);
                    const arquivoFile = path.resolve(`figurinhas/figurinhas.txt`);

                    try {
                        const content = fs.readFileSync(arquivoFile, 'utf-8');

                        const files = JSON.parse(content);

                        const quantidadeObjetos = files.length;

                        if (quantidadeObjetos === 0) return await message.reply('Sem figurinhas salva para enviar');

                        await message.reply(`✅ ok, vou enviar um total de ${quantidadeObjetos} figurinhas`);

                        dadosStickers.stickerName += ' Sticker';
                        for (const file of files) {
                            const media = new MessageMedia(file.mimetype, file.data, file.filename, file.filesize);
                            await client.sendMessage(from, media, dadosStickers);

                            // Atraso de 1 segundo antes de enviar a próxima figurinha
                            await new Promise(resolve => setTimeout(resolve, 1000));
                        }
                        await message.reply('✅ Figurinhas enviadas com sucesso.');
                    } catch (error) {
                        console.error('Erro ao ler o arquivo de figurinhas:', error);
                    }
                } else {
                    const arquivoFile = path.resolve(`figurinhas/figurinhas.txt`);

                    try {
                        const content = fs.readFileSync(arquivoFile, 'utf-8');

                        const files = JSON.parse(content);

                        const quantidadeObjetos = files.length;

                        if (quantidadeObjetos === 0) return await message.reply('Sem figurinhas salva para enviar');

                        await message.reply(`✅ ok, vou enviar um total de ${quantidadeObjetos} figurinhas`);

                        dadosStickers.stickerName += ' Sticker';
                        for (const file of files) {
                            const media = new MessageMedia(file.mimetype, file.data, file.filename, file.filesize);
                            await client.sendMessage(from, media, dadosStickers);

                            // Atraso de 1 segundo antes de enviar a próxima figurinha
                            await new Promise(resolve => setTimeout(resolve, 1000));
                        }
                        await message.reply('✅ Figurinhas enviadas com sucesso.');
                    } catch (error) {
                        console.error('Erro ao ler o arquivo de figurinhas:', error);
                    }
                }
            } else if (command === `${PREFIX}salvar`) {
                if (!isGroup) return message.reply(msgs_texto.permissao.grupo);
                if (!isGroupAdmins) return message.reply(msgs_texto.permissao.apenas_admin);
                if (hasQuotedMsg) {
                    const arquivoFile = path.resolve(`figurinhas/figurinhas.txt`);
                    const content = fs.readFileSync(arquivoFile, 'utf-8');
                    const files = JSON.parse(content);
                    if (files.length >= 250) return await message.reply('[❗] Limite máximo de figurinhas ja atingindo.');
                    const media_quoted: any = await message.getQuotedMessage();
                    const midiaData: MessageMedia = await media_quoted.downloadMedia();

                    const pathToFigurinhas = path.resolve(`figurinhas/figurinhas.txt`);

                    try {
                        const content = fs.existsSync(pathToFigurinhas) ? fs.readFileSync(pathToFigurinhas, 'utf-8') : '[]';

                        const existingData = JSON.parse(content);

                        existingData.push({
                            mimetype: midiaData.mimetype,
                            data: midiaData.data,
                            filename: midiaData.filename,
                            filesize: midiaData.filesize,
                        });

                        const jsonString = JSON.stringify(existingData, null, 2);
                        fs.writeFileSync(pathToFigurinhas, jsonString);

                        await message.reply('✅ Figurinha salva com sucesso.');
                    } catch (error) {
                        console.error('Erro ao salvar figurinhas:', error);
                        await message.reply('❌ Ocorreu um erro ao salvar figurinhas.');
                    }
                } else {
                    await message.reply(erroComandoMsg(command));
                }
            } else if (command === `${PREFIX}atps`) {
                if (args.length === 1 || type != 'chat') return await message.reply(erroComandoMsg(command));
                const usuarioTexto: string = body.slice(5).trim();
                if (usuarioTexto.length > 50) return message.reply(msgs_texto.figurinhas.atps.texto_longo);
                try {
                    await message.reply(msgs_texto.figurinhas.atps.espera);
                    const imagemBase64 = await Stickers.textoParaGif(usuarioTexto);
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    const media = new MessageMedia('video/gif', imagemBase64);
                    dadosStickers.stickerName += ' Texto animado Sticker';
                    await client.sendMessage(from, media, dadosStickers).catch(err => {
                        message.reply(msgs_texto.figurinhas.sticker.erro_s);
                        console.log(err);
                    });
                } catch (err: any) {
                    await message.reply(err.message);
                }
            } else if (command === `${PREFIX}figurinhas+18`) {
                if (isGroup) return message.reply(msgs_texto.permissao.pv);
                const arquivoFile = path.resolve(`figurinhas/figurinhas+18.txt`);

                try {
                    const content = fs.readFileSync(arquivoFile, 'utf-8');

                    const files = JSON.parse(content);

                    const quantidadeObjetos = files.length;

                    if (quantidadeObjetos === 0) return await message.reply('Sem figurinhas+18 salva para enviar');

                    await message.reply(`✅ ok, vou enviar um total de ${quantidadeObjetos} figurinhas`);

                    dadosStickers.stickerName += ' Sticker';
                    for (const file of files) {
                        const media = new MessageMedia(file.mimetype, file.data, file.filename, file.filesize);
                        await client.sendMessage(from, media, dadosStickers);

                        // Atraso de 1 segundo antes de enviar a próxima figurinha
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                    await message.reply('✅ Figurinhas+18 enviadas com sucesso.');
                } catch (error) {
                    console.error('Erro ao ler o arquivo de figurinhas:', error);
                }
            } else if (command === `${PREFIX}salvar+18`) {
                if (!isOwner) return message.reply(msgs_texto.permissao.apenas_dono_bot);
                if (hasQuotedMsg) {
                    const media_quoted: any = await message.getQuotedMessage();
                    const midiaData: MessageMedia = await media_quoted.downloadMedia();

                    const pathToFigurinhas = path.resolve(`figurinhas/figurinhas+18.txt`);

                    try {
                        const content = fs.existsSync(pathToFigurinhas) ? fs.readFileSync(pathToFigurinhas, 'utf-8') : '[]';

                        const existingData = JSON.parse(content);

                        existingData.push({
                            mimetype: midiaData.mimetype,
                            data: midiaData.data,
                            filename: midiaData.filename,
                            filesize: midiaData.filesize,
                        });

                        const jsonString = JSON.stringify(existingData, null, 2);
                        fs.writeFileSync(pathToFigurinhas, jsonString);

                        await message.reply('✅ Figurinha+18 salva com sucesso.');
                    } catch (error) {
                        console.error('Erro ao salvar figurinhas:', error);
                        await message.reply('❌ Ocorreu um erro ao salvar figurinhas.');
                    }
                } else {
                    await message.reply(erroComandoMsg(command));
                }
            } else if (command === `${PREFIX}emojimix`) {
                try {
                    if (!isOwner) return message.reply(msgs_texto.permissao.apenas_dono_bot);
                    if (args.length !== 2) return await message.reply(erroComandoMsg(command));
                    if (args[1].split('+').length !== 2) return await message.reply(erroComandoMsg(command));

                    await message.reply(msgs_texto.geral.espera);
                    const emoji1 = encodeURIComponent(args[1].split('+')[0].trim());
                    const emoji2 = encodeURIComponent(args[1].split('+')[1].trim());
                    const url = `https://api.lolhuman.xyz/api/emojimix/${emoji1}+${emoji2}`;

                    await axios
                        .get(url, {
                            params: {
                                apikey: process.env.API_LOLHUMAN,
                            },
                            responseType: 'arraybuffer',
                        })
                        .then(async response => {
                            const buffer = Buffer.from(response.data);
                            const base64 = buffer.toString('base64');
                            const media = new MessageMedia('image/png', base64);
                            dadosStickers.stickerName += ' Sticker';
                            await client.sendMessage(from, media, dadosStickers);
                        })
                        .catch(err => {
                            if (err.response.status === 429) return message.reply('[❗] Você excedeu o limite gratis diario a API.');
                            consoleErro(err.message, 'API EMOJIMIX');
                            message.reply(msgs_texto.figurinhas.sticker.erro_conversao);
                        });
                } catch (err: any) {
                    consoleErro(err.message, 'API TRY/CATCH EMOJIMIX');
                }
            }
        } catch (err: any) {
            console.log(err);
        }
    }
}

export default Figurinhas;
