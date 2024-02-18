import { Client, MessageMedia } from 'whatsapp-web.js';
import { removerNegritoComando, erroComandoMsg, criarTexto, consoleErro } from '../src/util';
import msgs_texto from '../src/msgs';
import api from '../src/api';
import fs from 'fs-extra';

class Download {
    async download(client: Client, message: any) {
        try {
            const { body, hasMedia, type, from } = message;
            const { author, notifyName, quotedMsg, mimetype, mentionedJidList, quotedParticipant } = message._data;
            let command: string = body.split(' ')[0];
            const args: string[] = body.split(' ');
            command = removerNegritoComando(command).toLowerCase();

            if (command === `${process.env.PREFIX}play`) {
                if (args.length === 1) return await message.reply(erroComandoMsg(command));
                try {
                    const usuarioTexto: string = body.slice(6).trim();
                    const videoInfo = await api.obterInfoVideoYT(usuarioTexto);
                    if (videoInfo === null) return await message.reply(msgs_texto.downloads.play.nao_encontrado);
                    if (videoInfo.duration > 900000) return await message.reply(msgs_texto.downloads.play.limite);
                    const mensagemEspera = criarTexto(msgs_texto.downloads.play.espera, videoInfo.title, videoInfo.durationFormatted);
                    await message.reply(mensagemEspera);
                    const saidaAudio = await api.obterYtMp3(videoInfo);
                    const audio = MessageMedia.fromFilePath(saidaAudio);
                    await message
                        .reply(audio)
                        .then(() => {
                            fs.unlinkSync(saidaAudio);
                        })
                        .catch(() => {
                            fs.unlinkSync(saidaAudio);
                            message.reply(msgs_texto.downloads.play.erro_download);
                        });
                } catch (err: any) {
                    console.log(err);
                    return await message.reply(err.message);
                }
            } else if (command === `${process.env.PREFIX}yt`) {
                if (args.length === 1) return await message.reply(erroComandoMsg(command));
                try {
                    const usuarioTexto = body.slice(4).trim();
                    const videoInfo = await api.obterInfoVideoYT(usuarioTexto);
                    if (videoInfo == null) return await message.reply(msgs_texto.downloads.yt.nao_encontrado);
                    if (videoInfo.duration > 900000) return await message.reply(msgs_texto.downloads.yt.limite);
                    const mensagemEspera = criarTexto(msgs_texto.downloads.yt.espera, videoInfo.title, videoInfo.durationFormatted);
                    await message.reply(mensagemEspera);
                    const saidaVideoInfo = await api.obterYTMp4URL(videoInfo);
                    const media = await MessageMedia.fromUrl(saidaVideoInfo.download, { unsafeMime: true });
                    await message.reply(media).catch(() => {
                        message.reply(msgs_texto.downloads.yt.erro_download);
                    });
                } catch (err: any) {
                    console.log(err);
                    return await message.reply(err.message);
                }
            } else if (command === `${process.env.PREFIX}fb`) {
                if (args.length === 1) return await message.reply(erroComandoMsg(command));
                try {
                    const usuarioURL: string = body.slice(4).trim();
                    await message.reply(msgs_texto.downloads.fb.espera);
                    const resultadosMidia: string = await api.obterMidiaFacebook(usuarioURL);
                    const caminhoVideo = await api.realizarDownload(resultadosMidia);
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    const video: MessageMedia = MessageMedia.fromFilePath(caminhoVideo);
                    await client
                        .sendMessage(from, video, { caption: 'Aqui seu video/image.' })
                        .then(() => {
                            fs.unlinkSync(caminhoVideo);
                        })
                        .catch((err: any) => {
                            fs.unlinkSync(caminhoVideo);
                            console.log(err);
                            message.reply(msgs_texto.downloads.fb.erro_download);
                        });
                } catch (err: any) {
                    message.reply(err.message);
                }
            } else if (command === `${process.env.PREFIX}ig`) {
                if (args.length === 1) return await message.reply(erroComandoMsg(command));
                await message.reply(msgs_texto.downloads.ig.espera);
                try {
                    const usuarioTexto = body.slice(4).trim();
                    const resultadosMidia = await api.obterMidiaInstagram(usuarioTexto);
                    const caminhoVideo = await api.realizarDownload(resultadosMidia);
                    if (!resultadosMidia) return await message.reply(msgs_texto.downloads.ig.nao_encontrado);
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    const media: MessageMedia = MessageMedia.fromFilePath(caminhoVideo);
                    if (resultadosMidia) {
                        await client
                            .sendMessage(from, media, { caption: 'Aqui seu video/image.' })
                            .then(() => {
                                fs.unlinkSync(caminhoVideo);
                            })
                            .catch((err: any) => {
                                fs.unlinkSync(caminhoVideo);
                                console.log(err);
                                message.reply(msgs_texto.downloads.ig.erro_download);
                            });
                    } else {
                        let temErro = false;
                        for (const url of resultadosMidia) await message.reply(url).catch(() => (temErro = true));
                        if (temErro) await message.reply(msgs_texto.downloads.ig.erro_download);
                    }
                } catch (err: any) {
                    console.log(err);
                    await message.reply(err.message);
                }
            } else if (command === `${process.env.PREFIX}img`) {
                if (quotedMsg || type != 'chat') return await message.reply(erroComandoMsg(command));
                const usuarioQuantidadeFotos: number = Number(args[1]);
                let qtdFotos = 1;
                let textoPesquisa = '';
                if (!isNaN(usuarioQuantidadeFotos)) {
                    if (usuarioQuantidadeFotos > 0 && usuarioQuantidadeFotos <= 5) {
                        qtdFotos = usuarioQuantidadeFotos;
                        textoPesquisa = args.slice(2).join(' ').trim();
                    } else {
                        return await message.reply(msgs_texto.downloads.img.qtd_imagem);
                    }
                } else {
                    textoPesquisa = body.slice(5).trim();
                }
                if (!textoPesquisa) return await message.reply(erroComandoMsg(command));
                if (textoPesquisa.length > 120) return await message.reply(msgs_texto.downloads.img.tema_longo);
                try {
                    const resultadosImagens = await api.obterImagens(textoPesquisa, qtdFotos);
                    for (const imagem of resultadosImagens) {
                        const foto = await MessageMedia.fromUrl(imagem);
                        message.reply(foto).catch(async () => {
                            await message.reply(msgs_texto.downloads.img.erro_imagem);
                        });
                    }
                } catch (err: any) {
                    await message.reply(err.message);
                }
            }
        } catch (err: any) {
            consoleErro(err.message, 'DOWNLOAD');
        }
    }
}

export default Download;
