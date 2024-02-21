import axios from 'axios';
import msgs_texto from '../src/msgs';
import Youtube from 'youtube-sr';
import ytdl from 'ytdl-core';
import path from 'path';
import { obterNomeAleatorio, consoleErro } from '../src/util';
import ffmpeg from 'fluent-ffmpeg';
import fbDownloader from '@xaviabot/fb-downloader';
// @ts-expect-error: Temporário, resolverá quando as declarações de tipos estiverem disponíveis.
import { ndown as instagramGetUrl } from 'nayan-media-downloader';
// @ts-expect-error: Temporário, resolverá quando as declarações de tipos estiverem disponíveis.
import gis from 'g-i-s';
import { exec } from 'child_process';
import { promisify } from 'util';
const asyncExec = promisify(exec);
import googleIt from 'google-it';

export = {
    obterInfoVideoYT: async (query: string): Promise<any> => {
        try {
            const res = await Youtube.searchOne(query);
            const video = res;
            return video;
        } catch (err: any) {
            consoleErro(err.message, 'API obterInfoVideoYT');
            throw new Error(msgs_texto.downloads.yt.erro_pesquisa);
        }
    },

    converterM4aParaMp3: async (caminhoAudio: string): Promise<string> => {
        return new Promise((resolve, reject) => {
            const nomeAleatorio: string = obterNomeAleatorio('.mp3') ?? 'GIHieiu2837.mp3';
            const saidaAudio = path.resolve(`media/audios/${nomeAleatorio}`);

            ffmpeg(caminhoAudio)
                .on('end', () => {
                    resolve(saidaAudio);
                })
                .on('error', (err: any) => {
                    reject(err.message);
                })
                .audioBitrate('128k')
                .audioCodec('libmp3lame')
                .save(saidaAudio);
        });
    },

    realizarDownload: async (url: string): Promise<string> => {
        try {
            const nomeAleatorio: string = obterNomeAleatorio('.mp4') ?? 'GIHieiu2837.mp4';
            const caminhoDestino = path.resolve(`media/videos/${nomeAleatorio}`);
            const ffmpegCommand = `ffmpeg -i "${url}" -c:v libx264 -c:a aac -strict experimental -b:a 192k ${caminhoDestino}`;
            await asyncExec(ffmpegCommand).catch((err: any) => {
                consoleErro(err.message, 'REALIZAR DOWNLOAD');
            });
            return caminhoDestino;
        } catch (erro: any) {
            console.error('Erro ao fazer o download:', erro.message);
            throw new Error('Falha ao fazer o download');
        }
    },

    obterYtMp3: async (videoInfo: any): Promise<any> => {
        const res = await ytdl.getInfo(videoInfo.id);
        const audioFormats = ytdl.filterFormats(res.formats, 'audioonly');
        const format = ytdl.chooseFormat(audioFormats, { filter: format => format.container === 'mp4' });
        const response = await axios({
            url: format.url,
            method: 'GET',
            responseType: 'stream',
        });
        const saidaAudio = await module.exports.converterM4aParaMp3(response.data);
        return saidaAudio;
    },

    obterYTMp4URL: async (videoInfo: any): Promise<any> => {
        try {
            const res = await ytdl.getInfo(videoInfo.id);
            const format = ytdl.chooseFormat(res.formats, {
                filter: format => format.container === 'mp4' && format.qualityLabel === '360p' && format.audioCodec != null,
            });

            return {
                titulo: res.player_response.videoDetails.title,
                download: format.url,
            };
        } catch (err: any) {
            consoleErro(err.message, 'API obterYTMp4URL');
            throw new Error(msgs_texto.downloads.yt.erro_link);
        }
    },
    obterMidiaFacebook: async (url: string): Promise<string> => {
        try {
            const res = await fbDownloader(url);
            return res.hd;
        } catch {
            throw new Error(msgs_texto.downloads.fb.erro_download);
        }
    },
    obterMidiaInstagram: async (url: string): Promise<string> => {
        try {
            const res = await instagramGetUrl(url);
            return res.data[0].url;
        } catch (err: any) {
            consoleErro(err.message, 'API obterMidiaInstagram');
            throw new Error(msgs_texto.downloads.ig.erro_download);
        }
    },
    obterImagens: async (pesquisaTexto: string, qtdFotos: number = 1): Promise<string[]> => {
        try {
            const imagens: any[] = await new Promise((resolve, reject) => {
                gis(pesquisaTexto, (err: any, res: any) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(res);
                    }
                });
            });

            const resultadosAleatorios: string[] = [];

            if (imagens.length === 0) {
                throw new Error(msgs_texto.downloads.img.nao_encontrado);
            }

            for (let i = 0; i < qtdFotos; i++) {
                const maxFotos = imagens.length > 20 ? 20 : imagens.length;
                const indexAleatorio = Math.floor(Math.random() * maxFotos);
                resultadosAleatorios.push(imagens[indexAleatorio].url);
                imagens.splice(indexAleatorio, 1);
            }

            if (resultadosAleatorios.length === 0) {
                throw new Error(msgs_texto.downloads.img.nao_encontrado);
            }

            return resultadosAleatorios;
        } catch (err: any) {
            const errors: string[] = [msgs_texto.downloads.img.nao_encontrado];
            if (!errors.includes(err.message)) {
                consoleErro(err.message, 'API obterImagens');
                throw new Error(msgs_texto.downloads.img.erro_api);
            } else {
                throw err;
            }
        }
    },
    textoParaVoz: async (idioma: string, texto: string): Promise<string> => {
        return new Promise<string>((resolve, reject) => {
            const ttsLanguages: Record<string, any> = {
                pt: require('node-gtts')('pt'),
                en: require('node-gtts')('en'),
                jp: require('node-gtts')('ja'),
                es: require('node-gtts')('es'),
                it: require('node-gtts')('it'),
                ru: require('node-gtts')('ru'),
                ko: require('node-gtts')('ko'),
                sv: require('node-gtts')('sv'),
            };

            const tts = ttsLanguages[idioma];

            if (tts) {
                const outputPath = path.resolve(`media/audios/res${idioma.toUpperCase()}.mp3`);

                tts.save(outputPath, texto, () => {
                    resolve(outputPath);
                });
            } else {
                reject(new Error('Idioma não suportado'));
            }
        }).catch(err => {
            const errors = ['Idioma não suportado'];
            if (!errors.includes(err.message)) {
                console.error(err.message, 'API textoParaVoz');
                throw new Error('Erro ao gerar áudio');
            } else {
                throw err;
            }
        });
    },
    obterPesquisaWeb: async (pesquisaTexto: string) => {
        try {
            let resultados = await googleIt({ disableConsole: true, query: pesquisaTexto });
            const resposta = [];
            if (resultados.length == 0) throw new Error(msgs_texto.utilidades.pesquisa.sem_resultados);
            resultados = resultados.slice(0, 5);
            for (const resultado of resultados) {
                resposta.push({
                    titulo: resultado.title,
                    link: resultado.link,
                    descricao: resultado.snippet,
                });
            }
            return resposta;
        } catch (err: any) {
            const errors = [msgs_texto.utilidades.pesquisa.sem_resultados];
            if (!errors.includes(err.message)) {
                consoleErro(err.message, 'API obterPesquisaWeb');
                throw new Error(msgs_texto.utilidades.pesquisa.erro_servidor);
            } else {
                throw err;
            }
        }
    },
    obterNoticias: async () => {
        try {
            const api_news_org = process.env.API_NEWS_ORG || '';
            const res = await axios.get(`http://newsapi.org/v2/top-headlines?country=br&apiKey=${api_news_org.trim()}`);
            const resposta = [];
            for (const noticia of res.data.articles) {
                resposta.push({
                    titulo: noticia.author,
                    descricao: noticia.title,
                    url: noticia.url,
                });
            }
            return resposta;
        } catch (err) {
            consoleErro(msgs_texto.api.newsapi, 'API obterNoticias');
            throw new Error(msgs_texto.utilidades.noticia.indisponivel);
        }
    },
};
