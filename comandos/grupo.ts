import { Client, MessageMedia, MessageTypes } from 'whatsapp-web.js';
import { removerNegritoComando, erroComandoMsg, criarTexto, isAdminGroup } from '../src/util';
import msgs_texto from '../src/msgs';
import db from '../src/dataBase';
import botInfo from '../src/bot';

class Grupo {
    async grupo(client: Client, message: any) {
        try {
            const { body, hasMedia, type, from } = message;
            const { author, notifyName, quotedMsg, mimetype, mentionedJidList, quotedParticipant } = message._data;
            let command: string = body.split(' ')[0];
            const args: string[] = body.split(' ');
            command = removerNegritoComando(command).toLowerCase();
            const dadosGrupo = await message.getChat();
            const isGroup = dadosGrupo.isGroup;
            const dadosAdmin = isGroup ? await dadosGrupo.groupMetadata.participants : '';
            const isGroupAdmins: boolean = isGroup ? isAdminGroup(author, dadosAdmin) : false;
            const botNumber = client.info.wid._serialized;
            const dadosGrupoBot = isGroup
                ? dadosGrupo.participants
                      .filter((isAdmin: { isAdmin: boolean }) => isAdmin.isAdmin)
                      .map((admin: { id: { _serialized: string } }) => admin.id._serialized)
                : [];
            const isBotGroupAdmin = isGroup ? dadosGrupoBot.includes(botNumber) : false;
            const PREFIX = process.env.PREFIX || '!';
            if (!isGroup) return message.reply(msgs_texto.permissao.grupo);

            if (command === `${PREFIX}regras`) {
                const grupoDescrition = dadosGrupo.description || msgs_texto.grupo.regras.sem_descrição;
                const fotoGrupo = await client.getProfilePicUrl(from);
                const foto = await MessageMedia.fromUrl(fotoGrupo);
                if (fotoGrupo) {
                    await client.sendMessage(from, foto, { caption: grupoDescrition });
                } else {
                    await client.sendMessage(from, grupoDescrition);
                }
            } else if (command === `${PREFIX}fotogrupo`) {
                if (!isGroupAdmins) return message.reply(msgs_texto.permissao.apenas_admin);
                if (!isBotGroupAdmin) return message.reply(msgs_texto.permissao.bot_admin);

                if (hasMedia || quotedMsg) {
                    interface DadosMsg {
                        tipo: string;
                        mimetype: string;
                    }
                    const dadosMsg: DadosMsg = {
                        tipo: hasMedia ? type : quotedMsg.type,
                        mimetype: hasMedia ? mimetype : quotedMsg.mimetype,
                    };
                    if (dadosMsg.tipo === 'image') {
                        const media_quoted: any = await message.getQuotedMessage();
                        const mediaData: MessageMedia = (await message.downloadMedia()) || (await media_quoted.downloadMedia());
                        const res = await dadosGrupo.setPicture(mediaData);
                        if (res) {
                            await message.reply(msgs_texto.grupo.fotogrupo.sucesso);
                        } else {
                            await message.reply(msgs_texto.grupo.fotogrupo.erro);
                        }
                    }
                } else {
                    return message.reply(erroComandoMsg(command));
                }
            } else if (command === `${PREFIX}status`) {
                if (!isGroupAdmins) return message.reply(msgs_texto.permissao.apenas_admin);
                const grupoInfo = await db.obterGrupo(from);
                let resposta = msgs_texto.grupo.status.resposta_titulo;
                //Bem-vindo
                resposta += grupoInfo.bemvindo.status
                    ? msgs_texto.grupo.status.resposta_variavel.bemvindo.on
                    : msgs_texto.grupo.status.resposta_variavel.bemvindo.off;
                //Mutar
                resposta += grupoInfo.mutar
                    ? msgs_texto.grupo.status.resposta_variavel.mutar.on
                    : msgs_texto.grupo.status.resposta_variavel.mutar.off;
                //Auto-Sticker
                resposta += grupoInfo.autosticker
                    ? msgs_texto.grupo.status.resposta_variavel.autosticker.on
                    : msgs_texto.grupo.status.resposta_variavel.autosticker.off;
                //Anti-Pornô
                resposta += grupoInfo.antiporno
                    ? msgs_texto.grupo.status.resposta_variavel.antiporno.on
                    : msgs_texto.grupo.status.resposta_variavel.antiporno.off;
                //Anti-Link
                let al_filtros = '';
                if (grupoInfo.antilink.filtros.youtube) al_filtros += msgs_texto.grupo.status.resposta_variavel.antilink.filtros.youtube;
                if (grupoInfo.antilink.filtros.whatsapp) al_filtros += msgs_texto.grupo.status.resposta_variavel.antilink.filtros.whatsapp;
                if (grupoInfo.antilink.filtros.facebook) al_filtros += msgs_texto.grupo.status.resposta_variavel.antilink.filtros.facebook;
                if (grupoInfo.antilink.filtros.instagram)
                    al_filtros += msgs_texto.grupo.status.resposta_variavel.antilink.filtros.instagram;
                resposta += grupoInfo.antilink.status
                    ? criarTexto(msgs_texto.grupo.status.resposta_variavel.antilink.on, al_filtros)
                    : msgs_texto.grupo.status.resposta_variavel.antilink.off;
                //Anti-fake
                resposta += grupoInfo.antifake.status
                    ? criarTexto(msgs_texto.grupo.status.resposta_variavel.antifake.on, grupoInfo.antifake.ddi_liberados.toString())
                    : msgs_texto.grupo.status.resposta_variavel.antifake.off;
                //Contador
                resposta += grupoInfo.contador.status
                    ? criarTexto(msgs_texto.grupo.status.resposta_variavel.contador.on, grupoInfo.contador.inicio)
                    : msgs_texto.grupo.status.resposta_variavel.contador.off;
                //Bloqueio de CMDS
                resposta +=
                    botInfo.botInfo().bloqueio_cmds.length != 0
                        ? criarTexto(msgs_texto.grupo.status.resposta_variavel.bloqueiocmds.on, botInfo.botInfo().bloqueio_cmds.toString())
                        : msgs_texto.grupo.status.resposta_variavel.bloqueiocmds.off;
                //Lista Negra
                resposta += criarTexto(msgs_texto.grupo.status.resposta_variavel.listanegra, grupoInfo.lista_negra.length.toString());
                await client.sendMessage(from, resposta);
            } else if (command === `${PREFIX}bv`) {
                if (!isGroupAdmins) return message.reply(msgs_texto.permissao.apenas_admin);
                const grupoInfo = await db.obterGrupo(from);
                const estadoNovo = !grupoInfo.bemvindo.status;
                if (estadoNovo) {
                    const usuarioMensagem = args.slice(1).join(' ');
                    await db.alterarBemVindo(from, true, usuarioMensagem);
                    message.reply(msgs_texto.grupo.bemvindo.ligado);
                } else {
                    await db.alterarBemVindo(from, false);
                    message.reply(msgs_texto.grupo.bemvindo.desligado);
                }
            } else if (command === `${PREFIX}alink`) {
                if (!isGroupAdmins) return message.reply(msgs_texto.permissao.apenas_admin);
                if (!isBotGroupAdmin) return message.reply(msgs_texto.permissao.bot_admin);
                const grupoInfo = await db.obterGrupo(from);
                const estadoNovo = !grupoInfo.antilink.status;
                if (estadoNovo) {
                    const filtros = body.slice(7).trim().toLowerCase().split(' ');
                    const objetoFiltros: { [key in 'youtube' | 'whatsapp' | 'facebook' | 'instagram']: boolean } = filtros.reduce(
                        (obj: any, filtro: string) => {
                            obj[filtro] = true;
                            return obj;
                        },
                        { youtube: false, whatsapp: false, facebook: false, instagram: false },
                    );
                    await db.alterarAntiLink(from, true, objetoFiltros);
                    message.reply(msgs_texto.grupo.antilink.ligado);
                } else {
                    await db.alterarAntiLink(from, false);
                    message.reply(msgs_texto.grupo.antilink.desligado);
                }
            } else if (command === `${PREFIX}autosticker`) {
                if (!isGroupAdmins) return message.reply(msgs_texto.permissao.apenas_admin);
                const grupoInfo = await db.obterGrupo(from);
                const estadoNovo = !grupoInfo.autosticker;
                if (estadoNovo) {
                    await db.alterarAutoSticker(from, true);
                    await message.reply(msgs_texto.grupo.autosticker.ligado);
                } else {
                    await db.alterarAutoSticker(from, false);
                    await message.reply(msgs_texto.grupo.autosticker.desligado);
                }
            } else if (command === `${PREFIX}rlink`) {
                if (!isGroupAdmins) return message.reply(msgs_texto.permissao.apenas_admin);
                if (!isBotGroupAdmin) return message.reply(msgs_texto.permissao.bot_admin);
                const groupChat = await message.getChat();
                await groupChat
                    .revokeInvite()
                    .then(() => {
                        message.reply(msgs_texto.grupo.rlink.sucesso);
                    })
                    .catch(() => {
                        message.reply(msgs_texto.grupo.rlink.erro);
                    });
            } else if (command === `${PREFIX}afake`) {
                if (!isGroupAdmins) return message.reply(msgs_texto.permissao.apenas_admin);
                if (!isBotGroupAdmin) return message.reply(msgs_texto.permissao.bot_admin);
                const grupoInfo = await db.obterGrupo(from);
                const estadoNovo = !grupoInfo.antifake.status;
                if (estadoNovo) {
                    const DDIAutorizados = body.slice(7).length == 0 ? ['55'] : body.slice(7).split(' ');
                    await db.alterarAntiFake(from, true, DDIAutorizados);
                    message.reply(msgs_texto.grupo.antifake.ligado);
                } else {
                    await db.alterarAntiFake(from, false);
                    message.reply(msgs_texto.grupo.antifake.desligado);
                }
            } else if (command === `${PREFIX}mutar`) {
                if (!isGroupAdmins) return message.reply(msgs_texto.permissao.apenas_admin);
                const grupoInfo = await db.obterGrupo(from);
                const estadoNovo = !grupoInfo.mutar;
                if (estadoNovo) {
                    await db.alterarMutar(from);
                    await message.reply(msgs_texto.grupo.mutar.ligado);
                } else {
                    await db.alterarMutar(from, false);
                    await message.reply(msgs_texto.grupo.mutar.desligado);
                }
            } else if (command === `${PREFIX}link`) {
                if (!isBotGroupAdmin) return message.reply(msgs_texto.permissao.bot_admin);
                if (!isGroupAdmins) return message.reply(msgs_texto.permissao.apenas_admin);
                const groupChat = await message.getChat();
                const dadoslink = await groupChat.getInviteCode();
                const link = 'https://chat.whatsapp.com/' + dadoslink;
                await client.sendMessage(from, criarTexto(msgs_texto.grupo.link.resposta, groupChat.name, link), {
                    linkPreview: true,
                });
            } else if (command === `${PREFIX}mm`) {
                if (!isGroupAdmins) return message.reply(msgs_texto.permissao.apenas_admin);

                let text = '';
                const mentions = [];
                const usuarioTexto = body.slice(4).trim();
                text =
                    args.length > 1
                        ? criarTexto(msgs_texto.grupo.mm.resposta_titulo_variavel, usuarioTexto)
                        : msgs_texto.grupo.mm.resposta_titulo_comum;
                for (const participante of dadosGrupo.participants) {
                    if (!participante.isAdmin) {
                        mentions.push(participante.id._serialized);
                        text += criarTexto(msgs_texto.grupo.mm.resposta_itens, participante.id._serialized.split('@')[0]);
                    }
                }
                const nomeBot = process.env.NOME_BOT || 'NOME_BOT';
                text += `╚═〘 ${nomeBot.trim()}®〙`;
                if (mentions.length == 0) return message.reply(msgs_texto.grupo.mm.sem_membros);
                await client.sendMessage(from, text, { mentions });
            } else if (command === `${PREFIX}mt`) {
                if (!isGroupAdmins) return message.reply(msgs_texto.permissao.apenas_admin);

                let text = '';
                const mentions = [];
                const usuarioTexto = body.slice(4).trim();
                text =
                    args.length > 1
                        ? criarTexto(msgs_texto.grupo.mm.resposta_titulo_variavel, usuarioTexto)
                        : msgs_texto.grupo.mm.resposta_titulo_comum;
                for (const participante of dadosGrupo.participants) {
                    mentions.push(participante.id._serialized);
                    text += criarTexto(msgs_texto.grupo.mm.resposta_itens, participante.id._serialized.split('@')[0]);
                }
                const nomeBot = process.env.NOME_BOT || 'NOME_BOT';
                text += `╚═〘 ${nomeBot.trim()}®〙`;
                await client.sendMessage(from, text, { mentions });
            } else if (command === `${PREFIX}add`) {
                if (!isGroupAdmins) return message.reply(msgs_texto.permissao.apenas_admin);
                if (!isBotGroupAdmin) return message.reply(msgs_texto.permissao.bot_admin);
                if (args.length === 1) return message.reply(erroComandoMsg(command));
                const usuarioNumeros: string[] = body.slice(5).split(',');
                for (const numero of usuarioNumeros) {
                    const numeroCompleto: string = numero.trim().replace(/\W+/g, '') + '@c.us';
                    const res: any = await dadosGrupo
                        .addParticipants(numeroCompleto, { sleep: [1000, 2000], autoSendInviteV4: false })
                        .catch((err: any) => {
                            console.log(err);
                            message.reply(criarTexto(msgs_texto.grupo.add.add_erro, numeroCompleto.replace('@c.us', '')));
                        });
                    if (res[numeroCompleto].code === 403) {
                        await message.reply(criarTexto(msgs_texto.grupo.add.convite, numeroCompleto.replace('@c.us', '')));
                    } else if (res[numeroCompleto].code === 408) {
                        await message.reply(criarTexto(msgs_texto.grupo.add.saiu_recente, numeroCompleto.replace('@c.us', '')));
                    } else if (res[numeroCompleto].code === 409) {
                        await message.reply(criarTexto(msgs_texto.grupo.add.membro_grupo, numeroCompleto.replace('@c.us', '')));
                    }
                }
            } else if (command === `${PREFIX}ban`) {
                if (!isGroupAdmins) return message.reply(msgs_texto.permissao.apenas_admin);
                if (!isBotGroupAdmin) return message.reply(msgs_texto.permissao.bot_admin);
                let mentions: any[] = [];
                if (mentionedJidList.length === 0 && quotedMsg) mentions.push(quotedParticipant);
                else if (mentionedJidList.length > 0) mentions = mentionedJidList;
                else return message.reply(erroComandoMsg(command));
                const idParticipantesAtuais = dadosGrupo.participants;
                for (const usuario of mentions) {
                    const res = isAdminGroup(usuario, idParticipantesAtuais);
                    const verificaUserGrupo = isAdminGroup(usuario, idParticipantesAtuais, true);
                    if (verificaUserGrupo) {
                        if (!res) {
                            await dadosGrupo.removeParticipants([usuario]).then(() => {
                                if (mentions.length === 1) {
                                    client.sendMessage(
                                        from,
                                        criarTexto(
                                            msgs_texto.geral.resposta_ban,
                                            usuario.replace('@c.us', ''),
                                            msgs_texto.grupo.banir.motivo,
                                            notifyName,
                                        ),
                                        { mentions },
                                    );
                                }
                            });
                        } else {
                            if (mentions.length === 1) message.reply(msgs_texto.grupo.banir.banir_admin);
                        }
                    } else {
                        if (mentions.length === 1) message.reply(msgs_texto.grupo.banir.banir_erro);
                    }
                }
            } else if (command === `${PREFIX}promover`) {
                if (!isGroupAdmins) return message.reply(msgs_texto.permissao.apenas_admin);
                if (!isBotGroupAdmin) return message.reply(msgs_texto.permissao.bot_admin);
                let mentions = [],
                    respostaUsuarios = '';
                if (mentionedJidList.length > 0) mentions = mentionedJidList;
                else if (quotedMsg) mentions.push(quotedParticipant);
                else return message.reply(erroComandoMsg(command));
                const idParticipantesAtuais = dadosGrupo.participants;

                if (mentions.includes(botNumber)) mentions.splice(mentions.indexOf(botNumber), 1);
                for (const usuario of mentions) {
                    const isAdministrador = isAdminGroup(usuario, idParticipantesAtuais);
                    if (!isAdministrador) {
                        await dadosGrupo.promoteParticipants([usuario]);
                        respostaUsuarios += criarTexto(msgs_texto.grupo.promover.sucesso_usuario, usuario.replace('@c.us', ''));
                    } else {
                        respostaUsuarios += criarTexto(msgs_texto.grupo.promover.erro_usuario, usuario.replace('@c.us', ''));
                    }
                }
                if (!mentions.length) return message.reply(msgs_texto.grupo.promover.erro_bot);
                await client.sendMessage(from, criarTexto(msgs_texto.grupo.promover.resposta, respostaUsuarios), { mentions });
            } else if (command === `${PREFIX}rebaixar`) {
                if (!isGroupAdmins) return message.reply(msgs_texto.permissao.apenas_admin);
                if (!isBotGroupAdmin) return message.reply(msgs_texto.permissao.bot_admin);
                let mentions = [],
                    respostaUsuarios = '';
                if (mentionedJidList.length > 0) mentions = mentionedJidList;
                else if (quotedMsg) mentions.push(quotedParticipant);
                else return message.reply(erroComandoMsg(command));
                const idParticipantesAtuais = dadosGrupo.participants;

                if (mentions.includes(botNumber)) mentions.splice(mentions.indexOf(botNumber), 1);
                for (const usuario of mentions) {
                    const isAdministrador = isAdminGroup(usuario, idParticipantesAtuais);
                    if (isAdministrador) {
                        await dadosGrupo.demoteParticipants([usuario]);
                        respostaUsuarios += criarTexto(msgs_texto.grupo.rebaixar.sucesso_usuario, usuario.replace('@c.us', ''));
                    } else {
                        respostaUsuarios += criarTexto(msgs_texto.grupo.rebaixar.erro_usuario, usuario.replace('@c.us', ''));
                    }
                }
                if (!mentions.length) return message.reply(msgs_texto.grupo.rebaixar.erro_bot);
                await client.sendMessage(from, criarTexto(msgs_texto.grupo.rebaixar.resposta, respostaUsuarios), { mentions });
            } else if (command === `${PREFIX}apg`) {
                if (!isGroupAdmins) return message.reply(msgs_texto.permissao.apenas_admin);
                if (!isBotGroupAdmin) return message.reply(msgs_texto.permissao.bot_admin);
                if (!quotedMsg) return message.reply(erroComandoMsg(command));
                const mensagemCitada = await message.getQuotedMessage();
                if (quotedMsg) {
                    await mensagemCitada.delete(true);
                    await message.reply('✅ Mensagem apagada com sucesso.');
                    return;
                }
                message.reply(erroComandoMsg(command));
            } else if (command === `${PREFIX}f`) {
                if (!isGroupAdmins) return message.reply(msgs_texto.permissao.apenas_admin);
                if (!isBotGroupAdmin) return message.reply(msgs_texto.permissao.bot_admin);
                const estadoNovo = !dadosGrupo.groupMetadata.announce;
                await dadosGrupo.setMessagesAdminsOnly(estadoNovo);
            } else if (command === `${PREFIX}blista`) {
                if (!isGroupAdmins) return message.reply(msgs_texto.permissao.apenas_admin);
                if (!isBotGroupAdmin) return message.reply(msgs_texto.permissao.bot_admin);
                if (args.length == 1) return message.reply(erroComandoMsg(command));
                const blista_numero = body.slice(8).trim().replace(/\W+/g, '');
                if (blista_numero.length === 0) return message.reply(msgs_texto.grupo.blista.numero_vazio);
                const blista_grupo_lista = await db.obterListaNegra(from),
                    blista_id_usuario = blista_numero + '@c.us';
                if (blista_grupo_lista.includes(blista_id_usuario)) return message.reply(msgs_texto.grupo.blista.ja_listado);
                await db.adicionarListaNegra(from, blista_id_usuario);
                message.reply(msgs_texto.grupo.blista.sucesso);
            } else if (command === `${PREFIX}dlista`) {
                if (!isGroupAdmins) return message.reply(msgs_texto.permissao.apenas_admin);
                if (!isBotGroupAdmin) return message.reply(msgs_texto.permissao.bot_admin);
                if (args.length == 1) return message.reply(erroComandoMsg(command));
                const dlista_numero = body.slice(8).trim().replace(/\W+/g, '');
                if (dlista_numero.length == 0) return message.reply(msgs_texto.grupo.dlista.numero_vazio);
                const dlista_grupo_lista = await db.obterListaNegra(from),
                    dlista_id_usuario = dlista_numero + '@c.us';
                if (!dlista_grupo_lista.includes(dlista_id_usuario)) return message.reply(msgs_texto.grupo.dlista.nao_listado);
                await db.removerListaNegra(from, dlista_id_usuario);
                message.reply(msgs_texto.grupo.dlista.sucesso);
            } else if (command === `${PREFIX}listanegra`) {
                if (!isGroupAdmins) return message.reply(msgs_texto.permissao.apenas_admin);
                if (!isBotGroupAdmin) return message.reply(msgs_texto.permissao.bot_admin);
                const lista_negra_grupo = await db.obterListaNegra(from);
                let resposta_listanegra = msgs_texto.grupo.listanegra.resposta_titulo;
                if (lista_negra_grupo.length == 0) return message.reply(msgs_texto.grupo.listanegra.lista_vazia);
                const nomeBot = process.env.NOME_BOT || '';
                const mentions: string[] = [];
                for (const usuario_lista of lista_negra_grupo) {
                    resposta_listanegra += criarTexto(msgs_texto.grupo.listanegra.resposta_itens, usuario_lista.replace(/@c.us/g, ''));
                    mentions.push(usuario_lista);
                }
                resposta_listanegra += `╚═〘 ${nomeBot.trim()}®〙`;
                await client.sendMessage(from, resposta_listanegra, { mentions });
            } else if (command === `${PREFIX}aporno`) {
                if (!isGroupAdmins) return message.reply(msgs_texto.permissao.apenas_admin);
                if (!isBotGroupAdmin) return message.reply(msgs_texto.permissao.bot_admin);
                const grupoInfo = await db.obterGrupo(from);
                const estadoNovo = !grupoInfo.antiporno;
                if (estadoNovo) {
                    await db.alterarAntiPorno(from, true);
                    await message.reply(msgs_texto.grupo.antiporno.ligado);
                } else {
                    await db.alterarAntiPorno(from, false);
                    await message.reply(msgs_texto.grupo.antiporno.desligado);
                }
            } else if (command === `${PREFIX}contador`) {
                if (!isGroupAdmins) return message.reply(msgs_texto.permissao.apenas_admin);
                const grupoInfo = await db.obterGrupo(from);
                const estadoNovo = !grupoInfo.contador.status;
                const membrosAtuais = dadosGrupo.groupMetadata.participants;
                if (estadoNovo) {
                    await db.alterarContador(from);
                    await db.registrarContagemTodos(from, membrosAtuais);
                    message.reply(msgs_texto.grupo.contador.ligado);
                } else {
                    await db.alterarContador(from, false);
                    await db.removerContagemGrupo(from);
                    message.reply(msgs_texto.grupo.contador.desligado);
                }
            } else if (command === `${PREFIX}topativos`) {
                if (!isGroupAdmins) return message.reply(msgs_texto.permissao.apenas_admin);
                if (args.length == 1) return message.reply(erroComandoMsg(command));
                const qtdUsuarios = Number(args[1]);
                if (isNaN(qtdUsuarios)) return message.reply(msgs_texto.grupo.topativos.erro_qtd);
                if (qtdUsuarios < 1 || qtdUsuarios > 50) return message.reply(msgs_texto.grupo.topativos.limite_qtd);
                const grupoInfo = await db.obterGrupo(from);
                if (!grupoInfo.contador.status) return message.reply(msgs_texto.grupo.topativos.erro_contador);
                const usuariosAtivos = await db.obterUsuariosAtivos(from, qtdUsuarios);
                let respostaTop = criarTexto(msgs_texto.grupo.topativos.resposta_titulo, qtdUsuarios.toString());
                const mentions = [];
                for (let i = 0; i < usuariosAtivos.length; i++) {
                    mentions.push(usuariosAtivos[i].id_usuario);
                    let medalha = '';
                    switch (i + 1) {
                        case 1:
                            medalha = '🥇';
                            break;
                        case 2:
                            medalha = '🥈';
                            break;
                        case 3:
                            medalha = '🥉';
                            break;
                        default:
                            medalha = '';
                    }
                    const number = i + 1;
                    respostaTop += criarTexto(
                        msgs_texto.grupo.topativos.resposta_itens,
                        medalha,
                        number.toString(),
                        usuariosAtivos[i].id_usuario.replace(/@c.us/g, ''),
                        usuariosAtivos[i].msg.toString(),
                    );
                }
                const nomeBot = process.env.NOME_BOT || 'BOT';
                respostaTop += `╠\n╚═〘 ${nomeBot.trim()}® 〙`;
                await client.sendMessage(from, respostaTop, { mentions });
            } else if (command === `${process.env.PREFIX}hidetag`) {
                if (!isGroupAdmins) return message.reply(msgs_texto.permissao.apenas_admin);
                const chat = await message.getChat();
                const mediaGrupo = await message.getQuotedMessage();
                if (
                    chat.isGroup &&
                    message.hasQuotedMsg &&
                    (quotedMsg.type === MessageTypes.IMAGE || quotedMsg.type === MessageTypes.STICKER)
                ) {
                    await message.reply(msgs_texto.geral.espera);
                    const serialized = chat.participants.map((admin: { id: { _serialized: string } }) => admin.id._serialized);
                    const media: MessageMedia = await mediaGrupo.downloadMedia();
                    await client.sendMessage(message.from, media, {
                        mentions: serialized,
                        sendMediaAsSticker: true,
                        stickerAuthor: `${process.env.NOME_AUTOR_FIGURINHAS}`,
                        stickerName: `${process.env.NOME_BOT}`,
                    });
                } else {
                    return message.reply(erroComandoMsg(command));
                }
            } else if (command === `${PREFIX}admins`) {
                const mentions = [];
                let admsResposta = msgs_texto.grupo.adms.resposta_titulo;
                for (const adm of dadosGrupoBot) {
                    if (adm === botNumber) continue;
                    mentions.push(adm);
                    admsResposta += criarTexto(msgs_texto.grupo.adms.resposta_itens, adm.replace(/@c.us/g, ''));
                }
                await client.sendMessage(from, admsResposta, { mentions });
            }
        } catch (err: any) {
            console.log(err);
        }
    }
}

export default Grupo;
