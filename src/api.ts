import axios from 'axios';
import msgs_texto from '../src/msgs';
import Youtube, { Video } from 'youtube-sr';
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
import fs from 'fs';
import FormData = require('form-data');

interface Nsfw {
    status: string;
    request: {
        id: string;
        timestamp: number;
        operations: number;
    };
    nudity: {
        sexual_activity: number;
        sexual_display: number;
        erotica: number;
        sextoy: number;
        suggestive: number;
        suggestive_classes: {
            bikini: number;
            cleavage: number;
            cleavage_categories: {
                very_revealing: number;
                revealing: number;
                none: number;
            };
            lingerie: number;
            male_chest: number;
            male_chest_categories: {
                very_revealing: number;
                revealing: number;
                slightly_revealing: number;
                none: number;
            };
            male_underwear: number;
            miniskirt: number;
            other: number;
        };
        none: number;
        context: {
            sea_lake_pool: number;
            outdoor_other: number;
            indoor_other: number;
        };
    };
    media: {
        id: string;
        uri: string;
    };
}

export = {
    obterInfoVideoYT: async (query: string): Promise<Video> => {
        function extractVideoIdFromUrl(url: string): string | null {
            const match = url.match(
                /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
            );
            return match ? match[1] : null;
        }
        try {
            let video: Video;
            const isYoutube = new RegExp(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/[^\/\n\s]+\/|(?:youtu\.be\/))([^\s]+)/gi);

            if (isYoutube.test(query)) {
                video = await Youtube.getVideo(query);
            } else {
                // Se não for um link, realizar uma pesquisa no YouTube
                const res = await Youtube.searchOne(query);
                video = res;
            }
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
                    fs.unlinkSync(saidaAudio);
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

    verificarTipoDeMidia: (url: string | undefined): string => {
        if (!url) {
            return 'URL não fornecido';
        }
        // Verificar se o URL contém uma extensão de imagem comum usando regex
        const regexImagem = /\.(jpg|jpeg|png|gif|bmp|webp|heic)/i;

        if (url.match(regexImagem)) {
            return 'imagem';
        }

        // Se não for uma imagem, assumimos que é um vídeo
        return 'vídeo';
    },

    obterYtMp3: async (videoInfo: Video): Promise<any> => {
        if (!videoInfo.id) return;
        const res = await ytdl.getInfo(videoInfo.id);
        const response = ytdl.downloadFromInfo(res, { filter: 'audioonly' });
        const saidaAudio = await module.exports.converterM4aParaMp3(response);
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
            return res.sd;
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

    obterNsfw: async (url: string): Promise<any> => {
        const data = new FormData();
        data.append('media', fs.createReadStream(url));
        data.append('models', 'nudity-2.0');
        data.append('api_user', process.env.API_USER);
        data.append('api_secret', process.env.API_SECRET);

        try {
            const response: Nsfw = await axios.post('https://api.sightengine.com/1.0/check.json', data, {
                headers: data.getHeaders(),
            });
            return response;
        } catch (error: any) {
            // Handle error
            if (error.response) {
                console.log(error.response.data);
                throw new Error(error.response.data);
            } else {
                console.log(error.message);
                throw new Error(error.message);
            }
        }
    },

    obterClima: async (local: string) => {
        try {
            local = local.normalize(`NFD`).replace(/[\u0300-\u036f]/g, ``);
            const climaTextoURL = `http://pt.wttr.in/${local}?format=Local%20=%20%l+\nClima atual%20=%20%C+%c+\nTemperatura%20=%20%t+\nUmidade%20=%20%h\nVento%20=%20%w\nLua%20agora%20=%20%m\nNascer%20do%20Sol%20=%20%S\nPor%20do%20Sol%20=%20%s`;
            const respostaTexto = await axios.get(climaTextoURL).catch(err => {
                throw new Error(err.message);
            });
            return {
                foto_clima: `http://pt.wttr.in/${local}.png`,
                texto: respostaTexto.data,
            };
        } catch (err: any) {
            err.message = `API obterClima - ${err.message}`;
            throw err;
        }
    },
};
