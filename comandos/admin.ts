import { Client, GroupChat, MessageMedia, GroupNotificationTypes } from 'whatsapp-web.js';
import { isAdminGroup, consoleErro, timestampParaData } from '../src/util';
import db from '../src/dataBase';
import msgs_texto from '../src/msgs';
import menu from '../src/menu';
import botInfo from '../src/bot';
import fs from 'fs';
import path from 'path';
import { criarTexto, erroComandoMsg } from '../src/util';
import block from '../src/bloqueioComandos';
import { cadastrarGrupo } from '../src/cadastrarGrupo';

interface Usuario {
    id_usuario: string;
    nome: string;
    comandos_total: number;
    comandos_dia: number | string;
    max_comandos_dia: number | null;
    tipo: string;
}

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
            const ownerNumber = process.env.NUMERO_DONO?.trim() || 'DONO NÃO REGISTRADO';
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
                const expiracaoLimiteDiario = timestampParaData(infoBot.limite_diario.expiracao * 1000);
                const botInicializacaoData = timestampParaData(infoBot.iniciado);
                const nomeCriador = process.env.NOME_ADMINISTRADOR || 'BOT';
                const nomeBot = process.env.NOME_BOT || 'BOT';
                let resposta = criarTexto(msgs_texto.admin.infocompleta.resposta_superior, nomeCriador, nomeBot, botInicializacaoData);
                // AUTO-STICKER
                resposta += infoBot.autosticker
                    ? msgs_texto.admin.infocompleta.resposta_variavel.autosticker.on
                    : msgs_texto.admin.infocompleta.resposta_variavel.autosticker.off;
                // PV LIBERADO
                resposta += infoBot.pvliberado
                    ? msgs_texto.admin.infocompleta.resposta_variavel.pvliberado.on
                    : msgs_texto.admin.infocompleta.resposta_variavel.pvliberado.off;
                // LIMITE COMANDOS DIARIO
                resposta += infoBot.limite_diario.status
                    ? criarTexto(msgs_texto.admin.infocompleta.resposta_variavel.limite_diario.on, expiracaoLimiteDiario)
                    : msgs_texto.admin.infocompleta.resposta_variavel.limite_diario.off;
                // LIMITE COMANDOS POR MINUTO
                resposta += infoBot.limitecomandos.status
                    ? criarTexto(
                          msgs_texto.admin.infocompleta.resposta_variavel.taxa_comandos.on,
                          infoBot.limitecomandos.cmds_minuto_max,
                          infoBot.limitecomandos.tempo_bloqueio,
                      )
                    : msgs_texto.admin.infocompleta.resposta_variavel.taxa_comandos.off;
                // LIMITE MENSAGENS PV
                resposta += infoBot.limitarmensagens.status
                    ? criarTexto(
                          msgs_texto.admin.infocompleta.resposta_variavel.limitarmsgs.on,
                          infoBot.limitarmensagens.max,
                          infoBot.limitarmensagens.intervalo,
                      )
                    : msgs_texto.admin.infocompleta.resposta_variavel.limitarmsgs.off;
                // BLOQUEIO DE COMANDOS
                resposta +=
                    infoBot.bloqueio_cmds.length != 0
                        ? criarTexto(msgs_texto.admin.infocompleta.resposta_variavel.bloqueiocmds.on, infoBot.bloqueio_cmds.toString())
                        : msgs_texto.admin.infocompleta.resposta_variavel.bloqueiocmds.off;
                resposta += criarTexto(
                    msgs_texto.admin.infocompleta.resposta_inferior,
                    blockNumber.length.toString(),
                    infoBot.cmds_executados,
                    ownerNumber,
                );
                if (fotoBot) {
                    const mediaFotoBot = await MessageMedia.fromUrl(fotoBot);
                    await client.sendMessage(from, mediaFotoBot, { caption: resposta });
                } else {
                    await client.sendMessage(from, resposta);
                }
            } else if (comando === `${PREFIX}autostickerpv`) {
                const novoEstado: boolean = !botInfo.botInfo().autosticker;
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
                    const alterou = await db.alterarTipoUsuario(usuario_tipo, args[1].toLocaleLowerCase());
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
            } else if (comando === `${PREFIX}listablock`) {
                if (blockNumber.length === 0) return await message.reply('Nenhum usuário bloqueado.');
                let resposta = criarTexto(msgs_texto.admin.listablock.resposta_titulo, blockNumber.length.toString());
                const mentions: string[] = [];
                for (const user of blockNumber) {
                    resposta += criarTexto(msgs_texto.admin.listablock.resposta_itens, user.replace('@c.us', ''));
                    mentions.push(user);
                }
                await client.sendMessage(from, resposta, { mentions });
            } else if (comando === `${PREFIX}mtodos`) {
                if (args.length === 1) return await message.reply(erroComandoMsg(command));
                const mensagem = body.slice(8).trim();
                const chats = await client.getChats();
                await message.reply(criarTexto(msgs_texto.admin.bctodos.espera, chats.length.toString(), chats.length.toString()));
                for (const chat of chats) {
                    if (chat.isGroup) {
                        const anunciar = await client.getChatById(chat.id._serialized);
                        const castAnuciar = anunciar as any;
                        if (!chat.isReadOnly && !castAnuciar.groupMetadata.announce)
                            await new Promise(resolve => {
                                setTimeout(async () => {
                                    resolve(
                                        await client.sendMessage(
                                            chat.id._serialized,
                                            criarTexto(msgs_texto.admin.bctodos.anuncio, mensagem),
                                        ),
                                    );
                                }, 1000);
                            });
                    } else {
                        if (!blockNumber.includes(chat.id._serialized)) {
                            await new Promise(resolve => {
                                setTimeout(async () => {
                                    resolve(
                                        await client.sendMessage(
                                            chat.id._serialized,
                                            criarTexto(msgs_texto.admin.bctodos.anuncio, mensagem),
                                        ),
                                    );
                                }, 1000);
                            });
                        }
                    }
                }
                await message.reply(msgs_texto.admin.bctodos.bc_sucesso);
            } else if (comando === `${PREFIX}mcontatos`) {
                if (args.length === 1) return message.reply(erroComandoMsg(command));
                const mensagem = body.slice(11).trim();
                const chats = await client.getChats();
                const qtdChatContatos = chats.filter((chat: { isGroup: boolean }) => !chat.isGroup);
                await message.reply(
                    criarTexto(msgs_texto.admin.bccontatos.espera, qtdChatContatos.length.toString(), qtdChatContatos.length.toString()),
                );
                for (const chat of chats) {
                    if (!chat.isGroup && !blockNumber.includes(chat.id._serialized)) {
                        await new Promise(resolve => {
                            setTimeout(async () => {
                                resolve(
                                    await client.sendMessage(
                                        chat.id._serialized,
                                        criarTexto(msgs_texto.admin.bccontatos.anuncio, mensagem),
                                    ),
                                );
                            }, 1000);
                        });
                    }
                }
                await message.reply(msgs_texto.admin.bccontatos.bc_sucesso);
            } else if (comando === `${PREFIX}mgrupos`) {
                if (args.length === 1) return message.reply(erroComandoMsg(command));
                const mensagem = body.slice(9).trim();
                const chats = await client.getChats();
                const qtdChatContatos = chats.filter((chat: { isGroup: boolean }) => chat.isGroup);
                const resposta =
                    qtdChatContatos.length === 1
                        ? criarTexto(
                              msgs_texto.admin.bcgrupos.espera_um,
                              qtdChatContatos.length.toString(),
                              qtdChatContatos.length.toString(),
                          )
                        : criarTexto(
                              msgs_texto.admin.bcgrupos.espera,
                              qtdChatContatos.length.toString(),
                              qtdChatContatos.length.toString(),
                          );
                await message.reply(resposta);
                for (const chat of chats) {
                    if (chat.isGroup) {
                        const anunciar = await client.getChatById(chat.id._serialized);
                        const castAnuciar = anunciar as any;
                        if (!chat.isReadOnly && !castAnuciar.groupMetadata.announce)
                            await new Promise(resolve => {
                                setTimeout(async () => {
                                    resolve(
                                        await client.sendMessage(
                                            chat.id._serialized,
                                            criarTexto(msgs_texto.admin.bcgrupos.anuncio, mensagem),
                                        ),
                                    );
                                }, 1000);
                            });
                    }
                }
                await message.reply(msgs_texto.admin.bcgrupos.bc_sucesso);
            } else if (comando === `${PREFIX}limitediario`) {
                const novoEstado = !botInfo.botInfo().limite_diario.status;
                if (novoEstado) {
                    botInfo.botAlterarLimiteDiario(true);
                    await message.reply(msgs_texto.admin.limitediario.ativado);
                } else {
                    botInfo.botAlterarLimiteDiario(false);
                    await message.reply(msgs_texto.admin.limitediario.desativado);
                }
            } else if (comando === `${PREFIX}taxalimite`) {
                const novoEstado = !botInfo.botInfo().limitecomandos.status;
                if (novoEstado) {
                    if (args.length !== 3) return await message.reply(erroComandoMsg(command));
                    const qtd_max_minuto = Number(args[1].trim()),
                        tempo_bloqueio = Number(args[2].trim());
                    if (isNaN(qtd_max_minuto) || qtd_max_minuto < 3)
                        return await message.reply(msgs_texto.admin.limitecomandos.qtd_invalida);
                    if (isNaN(tempo_bloqueio) || tempo_bloqueio < 10)
                        return await message.reply(msgs_texto.admin.limitecomandos.tempo_invalido);
                    botInfo.botAlterarLimitador(true, qtd_max_minuto, tempo_bloqueio);
                    await message.reply(msgs_texto.admin.limitecomandos.ativado);
                } else {
                    botInfo.botAlterarLimitador(false);
                    await message.reply(msgs_texto.admin.limitecomandos.desativado);
                }
            } else if (comando === `${PREFIX}limitarmsgs`) {
                const novoEstado = !botInfo.botInfo().limitarmensagens.status;
                if (novoEstado) {
                    if (args.length !== 3) return await message.reply(erroComandoMsg(command));
                    const max_msg = Number(args[1].trim()),
                        msgs_intervalo = Number(args[2].trim());
                    if (isNaN(max_msg) || max_msg < 3) return await message.reply(msgs_texto.admin.limitarmsgs.qtd_invalida);
                    if (isNaN(msgs_intervalo) || msgs_intervalo < 10)
                        return await message.reply(msgs_texto.admin.limitarmsgs.tempo_invalido);
                    botInfo.botAlterarLimitarMensagensPv(true, max_msg, msgs_intervalo);
                    await message.reply(msgs_texto.admin.limitarmsgs.ativado);
                } else {
                    botInfo.botAlterarLimitarMensagensPv(false);
                    await message.reply(msgs_texto.admin.limitarmsgs.desativado);
                }
            } else if (comando === `${PREFIX}mudarlimite`) {
                if (!botInfo.botInfo().limite_diario.status) return await message.reply(msgs_texto.admin.mudarlimite.erro_limite_diario);
                if (args.length === 1) return await message.reply(erroComandoMsg(command));
                const tipo = args[1].toLowerCase(),
                    qtd = Number(args[2].trim());
                if (qtd !== -1) if (isNaN(qtd) || qtd < 5) return await message.reply(msgs_texto.admin.mudarlimite.invalido);
                const alterou = await botInfo.botQtdLimiteDiario(tipo, qtd);
                if (!alterou) return await message.reply(msgs_texto.admin.mudarlimite.tipo_invalido);
                await message.reply(
                    criarTexto(msgs_texto.admin.mudarlimite.sucesso, tipo.toUpperCase(), qtd === -1 ? '∞' : qtd.toString()),
                );
            } else if (comando === `${PREFIX}usuarios`) {
                if (args.length === 1) return await message.reply(erroComandoMsg(command));
                const tipo = args[1].toLowerCase();
                const usuarios = await db.obterUsuariosTipo(tipo);
                if (usuarios.length == 0) return await message.reply(msgs_texto.admin.usuarios.nao_encontrado);
                let respostaItens = '';
                const mentions: Array<string> = [];
                for (const usuario of usuarios)
                    mentions.push(usuario.id_usuario),
                        (respostaItens += criarTexto(
                            msgs_texto.admin.usuarios.resposta_item,
                            usuario.nome || 'Zé Ruéla',
                            usuario.id_usuario.replace('@c.us', ''),
                            usuario.comandos_total.toString(),
                        ));
                const resposta = criarTexto(
                    msgs_texto.admin.usuarios.resposta_titulo,
                    tipo.toUpperCase(),
                    usuarios.length.toString(),
                    respostaItens,
                );
                await client.sendMessage(from, resposta, { mentions });
            } else if (comando === `${PREFIX}limparTipo`) {
                if (args.length === 1) return await message.reply(erroComandoMsg(command));
                const tipo = args[1].toLowerCase();
                const limpou = await db.limparTipo(tipo);
                if (!limpou) return await message.reply(msgs_texto.admin.limpartipo.erro);
                await message.reply(criarTexto(msgs_texto.admin.limpartipo.sucesso, tipo.toUpperCase()));
            } else if (comando === `${PREFIX}verdados`) {
                let idUsuario = '';
                let dadosUsuario: Usuario;
                if (hasQuotedMsg) idUsuario = quotedParticipant;
                else if (mentionedIds.length === 1) idUsuario = mentionedIds;
                else if (args.length >= 1) idUsuario = args.slice(1).join('').replace(/\W+/g, '') + '@c.us';
                else return await message.reply(erroComandoMsg(command));
                const usuarioRegistrado = await db.verificarRegistro(idUsuario);
                if (usuarioRegistrado) dadosUsuario = await db.obterUsuario(idUsuario);
                else return await message.reply(msgs_texto.admin.verdados.nao_registrado);
                const maxComandosDia = dadosUsuario.max_comandos_dia || 'Sem limite';
                const tipoUsuario = msgs_texto.tipos[dadosUsuario.tipo as keyof typeof msgs_texto.tipos];
                const nomeUsuario = dadosUsuario.nome || 'Ainda não obtido';
                let resposta = criarTexto(
                    msgs_texto.admin.verdados.resposta_superior,
                    nomeUsuario,
                    tipoUsuario,
                    dadosUsuario.id_usuario.replace('@c.us', ''),
                );
                if (botInfo.botInfo().limite_diario.status)
                    resposta += criarTexto(
                        msgs_texto.admin.verdados.resposta_variavel.limite_diario.on,
                        dadosUsuario.comandos_dia.toString(),
                        maxComandosDia.toString(),
                        maxComandosDia.toString(),
                    );
                resposta += criarTexto(msgs_texto.admin.verdados.resposta_inferior, dadosUsuario.comandos_total.toString());
                await message.reply(resposta);
            } else if (comando === `${PREFIX}grupos`) {
                const grupos = await client.getChats();
                const hasGrupo = grupos.filter((hasGroup: { isGroup: boolean }) => hasGroup.isGroup);
                const qtdChatContatos = grupos.filter((chat: { isGroup: boolean }) => chat.isGroup);
                let resposta = criarTexto(msgs_texto.admin.grupos.resposta_titulo, qtdChatContatos.length.toString());
                for (const grupo of hasGrupo) {
                    const adminsGrupo = await client.getChatById(grupo.id._serialized);
                    const nameGroup = (await client.getChatById(grupo.id._serialized)).name;
                    const castAdmin = adminsGrupo as GroupChat;
                    const participantesgrupo = castAdmin.participants;
                    const dadosGrupoBot = castAdmin.isGroup
                        ? participantesgrupo
                              .filter((isAdmin: { isAdmin: boolean }) => isAdmin.isAdmin)
                              .map((admin: { id: { _serialized: string } }) => admin.id._serialized)
                        : [];
                    const botAdmin = dadosGrupoBot.includes(botNumber);
                    let linkGrupo = 'Não Disponível';
                    if (botAdmin) linkGrupo = 'https://chat.whatsapp.com/' + (await castAdmin.getInviteCode());
                    resposta += criarTexto(
                        msgs_texto.admin.grupos.resposta_itens,
                        nameGroup,
                        participantesgrupo.length.toString(),
                        botAdmin ? 'Sim' : 'Não',
                        linkGrupo,
                    );
                }
                await message.reply(resposta);
            } else if (comando === `${PREFIX}entrargrupo`) {
                if (args.length < 2) return await message.reply(erroComandoMsg(command));
                const linkGrupoAll = args[1].trim();
                const linkGrupo = linkGrupoAll.replace('https://chat.whatsapp.com/', '');
                const grupos = await client.getChats();
                const totalGrupos = grupos.filter((hasGroup: { isGroup: boolean }) => hasGroup.isGroup);
                try {
                    const conviteInfo: any = await client.getInviteInfo(linkGrupo).catch(erro => {
                        console.log('ERRO:', erro);
                    });

                    const participantesIds: string[] = conviteInfo.participants.map(
                        (participante: { id: { _serialized: string } }) => participante.id._serialized,
                    );

                    await db.registrarGrupo(conviteInfo.id._serialized, participantesIds);

                    if (!conviteInfo) return await message.reply(msgs_texto.admin.entrar_grupo.link_invalido);
                    if (totalGrupos.length > 10) return await message.reply(msgs_texto.admin.entrar_grupo.maximo_grupos);
                    if (conviteInfo) {
                        await client
                            .acceptInvite(linkGrupo)
                            .then(async () => {
                                await message.reply(msgs_texto.admin.entrar_grupo.entrar_sucesso);
                                await client.sendMessage(
                                    conviteInfo.id._serialized,
                                    `✅ Saudações "*${conviteInfo.subject}*", para ver meus comandos por favor digite ${PREFIX}menu.`,
                                );
                            })
                            .catch(async erro => {
                                if (erro.toString().includes('Evaluation failed:')) {
                                    await message.reply('O grupo está restrito ou você saiu recentemente dele.');
                                }
                            });
                    } else {
                        await message.reply(msgs_texto.admin.entrar_grupo.link_invalido);
                    }
                } catch (erro: any) {
                    if (erro.toString().includes('Evaluation failed:')) {
                        await message.reply('O grupo está restrito ou você saiu recentemente dele.');
                    }
                }
            } else if (comando === `${PREFIX}rtodos`) {
                if (!botInfo.botInfo().limite_diario.status) return await message.reply(msgs_texto.admin.rtodos.erro_limite_diario);
                await db.resetarComandosDia();
                await message.reply(msgs_texto.admin.rtodos.sucesso);
            } else if (comando === `${PREFIX}r`) {
                if (!botInfo.botInfo().limite_diario.status) return await message.reply(msgs_texto.admin.r.erro_limite_diario);
                if (quotedMsg) {
                    const r_registrado = await db.verificarRegistro(quotedMsg);
                    if (r_registrado) {
                        await db.resetarComandosDiaUsuario(quotedMsg);
                        await message.reply(msgs_texto.admin.r.sucesso);
                    } else {
                        return await message.reply(msgs_texto.admin.r.nao_registrado);
                    }
                } else if (mentionedIds.length === 1) {
                    const r_registrado = await db.verificarRegistro(mentionedIds);
                    if (r_registrado) {
                        await db.resetarComandosDiaUsuario(mentionedIds);
                        await message.reply(msgs_texto.admin.r.sucesso);
                    } else {
                        return await message.reply(msgs_texto.admin.r.nao_registrado);
                    }
                } else if (args.length >= 1) {
                    let r_numero_usuario = '';
                    for (let i = 1; i < args.length; i++) {
                        r_numero_usuario += args[i];
                    }
                    r_numero_usuario = r_numero_usuario.replace(/\W+/g, '');
                    const r_registrado = await db.verificarRegistro(r_numero_usuario + '@c.us');
                    if (r_registrado) {
                        await db.resetarComandosDiaUsuario(r_numero_usuario + '@c.us');
                        await message.reply(msgs_texto.admin.r.sucesso);
                    } else {
                        return await message.reply(msgs_texto.admin.r.nao_registrado);
                    }
                } else {
                    return await message.reply(erroComandoMsg(command));
                }
            }
        } catch (err: any) {
            consoleErro(err, 'ADMINISTRAÇÂO');
        }
    }
}
