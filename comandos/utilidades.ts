import { Client, MessageMedia } from 'whatsapp-web.js';
import { consoleErro, criarTexto, erroComandoMsg } from '../src/util';
import msgs_texto from '../src/msgs';
import api from '../src/api';
import fs from 'fs';

export default class Utilidade {
    async utilidades(client: Client, message: any) {
        try {
            const { body, from, caption, quotedMsg, hasQuotedMsg } = message;
            const { mentionedJidList, author, quotedParticipant } = message._data;
            const command: string = quotedMsg ? caption : body;
            const args: string[] = command.split(' ');
            const comando = args[0].toLowerCase().trim();
            const PREFIX = process.env.PREFIX || '!';

            if (comando === `${PREFIX}voz`) {
                let usuarioTexto = '';
                if (args.length === 1) {
                    return message.reply(erroComandoMsg(command));
                } else if (quotedMsg && quotedMsg.type == 'chat') {
                    usuarioTexto = body.slice(8).trim();
                } else {
                    usuarioTexto = body.slice(8).trim();
                }
                if (!usuarioTexto) return message.reply(msgs_texto.utilidades.voz.texto_vazio);
                if (usuarioTexto.length > 200) return message.reply(msgs_texto.utilidades.voz.texto_longo);
                const idioma = body.slice(5, 7).toLowerCase();
                try {
                    const respostaAudio = await api.textoParaVoz(idioma, usuarioTexto);
                    const audio = MessageMedia.fromFilePath(respostaAudio);
                    await message
                        .reply(audio)
                        .then(() => fs.unlinkSync(respostaAudio))
                        .catch(() => fs.unlinkSync(respostaAudio));
                } catch (err: any) {
                    message.reply(err.message);
                }
            } else if (comando === `${PREFIX}pesquisa`) {
                if (args.length === 1) return message.reply(erroComandoMsg(command));
                try {
                    const usuarioTexto = body.slice(10).trim();
                    const pesquisaResultados = await api.obterPesquisaWeb(usuarioTexto);
                    let pesquisaResposta = criarTexto(msgs_texto.utilidades.pesquisa.resposta_titulo, usuarioTexto);
                    for (const resultado of pesquisaResultados) {
                        pesquisaResposta += '═════════════════\n';
                        pesquisaResposta += criarTexto(
                            msgs_texto.utilidades.pesquisa.resposta_itens,
                            resultado.titulo,
                            resultado.link,
                            resultado.descricao,
                        );
                    }
                    await message.reply(pesquisaResposta);
                } catch (err: any) {
                    await message.reply(err.message);
                }
            } else if (comando === `${PREFIX}noticias`) {
                try {
                    const listaNoticias = await api.obterNoticias();
                    let respostaNoticias = msgs_texto.utilidades.noticia.resposta_titulo;
                    for (const noticia of listaNoticias) {
                        respostaNoticias += criarTexto(
                            msgs_texto.utilidades.noticia.resposta_itens,
                            noticia.titulo,
                            noticia.descricao || 'Sem descrição',
                            noticia.url,
                        );
                    }
                    await message.reply(respostaNoticias);
                } catch (err: any) {
                    await message.reply(err.message);
                }
            } else if (comando === `${PREFIX}clima`) {
                try {
                    if (args.length === 1) return await message.reply(erroComandoMsg(command));
                    const usuarioTexto = body.slice(7).trim();
                    const clima = await api.obterClima(usuarioTexto);
                    const respostaClimaTexto = criarTexto(msgs_texto.utilidades.clima.resposta, clima.texto);
                    await message.reply(respostaClimaTexto);
                } catch (err: any) {
                    await message.reply(criarTexto(msgs_texto.geral.erro_comando_codigo, command));
                    err.message = `${command} - ${err.message}`;
                    throw err;
                }
            } else if (comando === `${PREFIX}master`) {
                try {
                    if (args.length === 1) return await message.reply(erroComandoMsg(command));
                    const usuarioTexto = body.slice(5).trim();
                    const { sucesso, texto, erro } = await api.respostaHercaiTexto(usuarioTexto);
                    if (!sucesso) return await message.reply(criarTexto(msgs_texto.geral.erro_api, command, erro || 'Erro Desconhecido'));
                    else await message.reply(criarTexto(msgs_texto.utilidades.master.resposta, texto || ''));
                } catch (err: any) {
                    await message.reply(criarTexto(msgs_texto.geral.erro_comando_codigo, command));
                    err.message = `${command} - ${err.message}`;
                    throw err;
                }
            }
        } catch (err: any) {
            consoleErro(err.message, 'UTILIDADES');
        }
    }
}
