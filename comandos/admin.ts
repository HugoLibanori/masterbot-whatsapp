import { Client, MessageMedia } from 'whatsapp-web.js';
import { isAdminGroup, consoleErro } from '../src/util';
import db from '../src/dataBase';
import msgs_texto from '../src/msgs';
import menu from '../src/menu';
import botInfo from '../src/bot';
import fs from 'fs';
import path from 'path';
import { criarTexto, erroComandoMsg } from '../src/util';
import { version } from '../package.json';
import block from '../src/bloquioComandos';

export default class Admin {
    async admin(client: Client, message: any) {
        try {
            const { body, from, type, hasMedia, mentionedIds, hasQuotedMsg } = message;
            const { mimetype, author, quotedMsg, quotedParticipant } = message._data;
            const command: string = body;
            const dadosGrupo = await message.getChat();
            const isGroup = dadosGrupo.isGroup;
            const dadosAdmin = isGroup ? await dadosGrupo?.groupMetadata?.participants : '';
            const grupoInfo = isGroup ? await db.obterGrupo(from) : null;
            const args: string[] = command.split(' ');
            const comando = args[0].toLowerCase().trim();
            const formattedTitle: string = (await client.getChatById(from)).name;
            const isGroupAdmins: boolean = isGroup ? isAdminGroup(author, dadosAdmin) : false;
            const ownerNumber = process.env.NUMERO_DONO?.trim();
            const isOwner = isGroup ? ownerNumber === author.replace(/@c.us/g, '') : ownerNumber === from.replace(/@c.us/g, '');
            const botNumber = client.info.wid._serialized;
            const blockNumberArray = await client.getBlockedContacts();
            const blockNumber = blockNumberArray.map((user: { id: { _serialized: string } }) => user.id._serialized);
            if (!isOwner) return message.reply(msgs_texto.permissao.apenas_dono_bot);
            const PREFIX = process.env.PREFIX || '!';

            if (comando === `${PREFIX}admin`) {
                await message.reply(menu.menuAdmin());
            } else if (comando === `${PREFIX}pvliberado`) {
                const novoEstado = !botInfo.botInfo().pvliberado;
                if (novoEstado) {
                    botInfo.botAlterarPvLiberado(true);
                    await message.reply(msgs_texto.admin.pvliberado.ativado);
                } else {
                    botInfo.botAlterarPvLiberado(false);
                    await message.reply(msgs_texto.admin.pvliberado.desativado);
                }
            } else if (comando === `${PREFIX}infocompleta`) {
                const fotoBot = await client.getProfilePicUrl(botNumber);
                const filePath = path.resolve('database/json/bot.json');
                const infoBot = JSON.parse(fs.readFileSync(filePath, { encoding: 'utf-8' }));
                const nomeCriador = process.env.NOME_ADMINISTRADOR || 'BOT';
                const nomeBot = process.env.NOME_BOT || 'BOT';
                let resposta = criarTexto(msgs_texto.admin.infocompleta.resposta_superior, nomeCriador, nomeBot, version);
                // AUTO-STICKER
                resposta += infoBot.autosticker
                    ? msgs_texto.admin.infocompleta.resposta_variavel.autosticker.on
                    : msgs_texto.admin.infocompleta.resposta_variavel.autosticker.off;
                // PV LIBERADO
                resposta += infoBot.pvliberado
                    ? msgs_texto.admin.infocompleta.resposta_variavel.pvliberado.on
                    : msgs_texto.admin.infocompleta.resposta_variavel.pvliberado.off;

                if (fotoBot) {
                    const mediaFotoBot = await MessageMedia.fromUrl(fotoBot);
                    await client.sendMessage(from, mediaFotoBot, { caption: resposta });
                } else {
                    await client.sendMessage(from, resposta);
                }
            } else if (comando === `${PREFIX}autostickerpv`) {
                const novoEstado = !botInfo.botInfo().autosticker;
                if (novoEstado) {
                    botInfo.botAlterarAutoSticker(true);
                    await message.reply(msgs_texto.admin.autostickerpv.ativado);
                } else {
                    botInfo.botAlterarAutoSticker(false);
                    await message.reply(msgs_texto.admin.autostickerpv.desativado);
                }
            } else if (comando === `${PREFIX}fotobot`) {
                if (hasMedia || hasQuotedMsg) {
                    const dadosMensagem = {
                        tipo: hasMedia ? type : quotedMsg.type,
                        mimetype: hasMedia ? mimetype : quotedMsg.mimetype,
                        mensagem: message,
                    };

                    if (dadosMensagem.tipo === 'image') {
                        const media_quoted = await message.getQuotedMessage();
                        const mediaData = (await message.downloadMedia()) || (await media_quoted.downloadMedia());
                        const res = await client.setProfilePicture(mediaData);
                        if (res) await message.reply(msgs_texto.admin.fotobot.sucesso);
                        else await message.reply(msgs_texto.admin.fotobot.erro);
                    } else {
                        return await message.reply(erroComandoMsg(command));
                    }
                } else {
                    return await message.reply(erroComandoMsg(command));
                }
            } else if (comando === `${PREFIX}bloquear`) {
                let usuariosBloqueados = [];
                if (hasQuotedMsg) {
                    usuariosBloqueados.push(quotedParticipant);
                } else if (mentionedIds.length > 1) {
                    usuariosBloqueados = mentionedIds;
                } else {
                    const numeroInserido = body.slice(10).trim();
                    if (numeroInserido.length == 0) return await message.reply(erroComandoMsg(command));
                    usuariosBloqueados.push(numeroInserido.replace(/\W+/g, '') + '@c.us');
                }
                for (const usuario of usuariosBloqueados) {
                    const contato = await client.getContactById(usuario);
                    if (contato) {
                        const mentions = [];
                        if (ownerNumber == usuario.replace(/@c.us/g, '')) {
                            mentions.push(usuario);
                            await client.sendMessage(from, criarTexto(msgs_texto.admin.bloquear.erro_dono, usuario.replace(/@c.us/g, '')), {
                                mentions,
                            });
                        } else {
                            if (blockNumber.includes(usuario)) {
                                mentions.push(usuario);
                                await client.sendMessage(
                                    from,
                                    criarTexto(msgs_texto.admin.bloquear.ja_bloqueado, usuario.replace(/@c.us/g, '')),
                                    { mentions },
                                );
                            } else {
                                mentions.push(usuario);
                                await contato.block();
                                await client.sendMessage(
                                    from,
                                    criarTexto(msgs_texto.admin.bloquear.sucesso, usuario.replace(/@c.us/g, '')),
                                    { mentions },
                                );
                            }
                        }
                    } else {
                        await message.reply(criarTexto(msgs_texto.admin.bloquear.erro, usuario.replace('@c.us', '')));
                    }
                }
            } else if (comando === `${PREFIX}desbloquear`) {
                let usuariosBloqueados = [];
                if (hasQuotedMsg) {
                    usuariosBloqueados.push(quotedParticipant);
                } else if (mentionedIds.length > 1) {
                    usuariosBloqueados = mentionedIds;
                } else {
                    const numeroInserido = body.slice(13).trim();
                    if (numeroInserido.length === 0) return await message.reply(erroComandoMsg(command));
                    usuariosBloqueados.push(numeroInserido.replace(/\W+/g, '') + '@c.us');
                }
                for (const usuario of usuariosBloqueados) {
                    const contato = await client.getContactById(usuario);
                    const mentions = [];
                    if (!blockNumber.includes(usuario)) {
                        mentions.push(usuario);
                        await client.sendMessage(
                            from,
                            criarTexto(msgs_texto.admin.desbloquear.ja_desbloqueado, usuario.replace(/@c.us/g, '')),
                            {
                                mentions,
                            },
                        );
                    } else {
                        mentions.push(usuario);
                        await contato.unblock();
                        await client.sendMessage(from, criarTexto(msgs_texto.admin.desbloquear.sucesso, usuario.replace(/@c.us/g, '')), {
                            mentions,
                        });
                    }
                }
            } else if (comando === `${PREFIX}alterartipo`) {
                if (args.length === 1) return await message.reply(erroComandoMsg(comando));
                let usuario_tipo: string = '';
                if (hasQuotedMsg) usuario_tipo = quotedParticipant;
                else if (mentionedIds.length === 1) usuario_tipo = mentionedIds[0];
                else if (args.length > 2) usuario_tipo = args.slice(2).join('').replace(/\W+/g, '') + '@c.us';
                else return await message.reply(erroComandoMsg(comando));
                const user_tipo = usuario_tipo.replace('@c.us', '');
                if (ownerNumber === user_tipo) return await message.reply(msgs_texto.admin.alterartipo.tipo_dono);
                const c_registrado = await db.verificarRegistro(usuario_tipo);
                if (c_registrado) {
                    const alterou = await db.alterarTipoUsuario(usuario_tipo, args[1]);
                    if (!alterou) return await message.reply(msgs_texto.admin.alterartipo.tipo_invalido);
                    await message.reply(criarTexto(msgs_texto.admin.alterartipo.sucesso, args[1].toUpperCase()));
                } else {
                    await message.reply(msgs_texto.admin.alterartipo.nao_registrado);
                }
            } else if (comando === `${PREFIX}tipos`) {
                const tipos = botInfo.botInfo().limite_diario.limite_tipos;
                let respostaTipos = '';
                for (const tipo in tipos) {
                    if (tipo === 'bronze') {
                        respostaTipos += criarTexto(msgs_texto.admin.tipos.item_tipo, msgs_texto.tipos.bronze, tipos.bronze.toString());
                    } else if (tipo === 'prata') {
                        respostaTipos += criarTexto(msgs_texto.admin.tipos.item_tipo, msgs_texto.tipos.prata, tipos.prata.toString());
                    } else if (tipo === 'ouro') {
                        respostaTipos += criarTexto(msgs_texto.admin.tipos.item_tipo, msgs_texto.tipos.ouro, tipos.ouro.toString());
                    } else if (tipo === 'vip') {
                        respostaTipos += criarTexto(msgs_texto.admin.tipos.item_tipo, msgs_texto.tipos.vip, '∞');
                    }
                }
                await message.reply(criarTexto(msgs_texto.admin.tipos.resposta, respostaTipos));
            } else if (comando === `${PREFIX}dcmdglobal`) {
                if (args.length === 1) return await message.reply(from, erroComandoMsg(command));
                const usuarioComandos = body.slice(12).split(' '),
                    respostaDesbloqueio = await block.desbloquearComandosGlobal(usuarioComandos);
                await message.reply(respostaDesbloqueio);
            } else if (comando === `${PREFIX}bcmdglobal`) {
                if (args.length === 1) return await message.reply(erroComandoMsg(command));
                const usuarioComandos = body.slice(12).split(' '),
                    respostaBloqueio = await block.bloquearComandosGlobal(usuarioComandos);
                await message.reply(respostaBloqueio);
            } else if (comando === `${PREFIX}listarbloqueados`) {
                if (blockNumber.length === 0) return await message.reply('Nenhum usuário bloqueado.');
                let resposta = criarTexto(msgs_texto.grupo.mm.resposta_titulo_variavel, 'Contatos bloqueados');
                const mentions: string[] = [];
                for (const user of blockNumber) {
                    resposta += criarTexto(msgs_texto.grupo.mm.resposta_itens, user.replace('@c.us', ''));
                    mentions.push(user);
                }
                await client.sendMessage(from, resposta, { mentions });
            }
        } catch (err: any) {
            consoleErro(err, 'ADMINISTRAÇÂO');
        }
    }
}
