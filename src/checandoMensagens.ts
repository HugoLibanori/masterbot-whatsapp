import { Client } from 'whatsapp-web.js';
import db from './dataBase';
import { isAdminGroup, consoleErro, criarTexto } from './util';
import comandos from '../comandos/comandos';
import botInfo from './bot';
import { cadastrarGrupo } from './cadastrarGrupo';
import msgs_texto from './msgs';
import block from './bloqueioComandos';

const lista_comandos = comandos;

export class ChecandoMensagens {
    async start(client: Client, message: any) {
        try {
            const { body, from, caption, quotedMsg, type } = message;
            const { notifyName, t, author } = message._data;
            const command: string = quotedMsg ? caption : body;
            const dadosGrupo = await message.getChat();
            const isGroup = dadosGrupo.isGroup;
            const dadosAdmin = isGroup ? await dadosGrupo?.groupMetadata?.participants : '';
            const grupoInfo = isGroup ? await db.obterGrupo(from) : null;
            const args: string[] = command.split(' ');
            const comando = args[0].toLowerCase().trim();
            const formattedTitle: string = (await client.getChatById(from)).name;
            const isGroupAdmins: boolean = isGroup ? isAdminGroup(author, dadosAdmin) : false;
            const msgGuia: boolean = args.length === 2 ? args[1].toLowerCase() === 'guia' : false;
            const ownerNumber = process.env.NUMERO_DONO?.trim() || 'DONO NÃO CONFIGURADO';
            const isOwner = isGroup ? ownerNumber === author.replace(/@c.us/g, '') : ownerNumber === from.replace(/@c.us/g, '');
            const autor = isGroup ? author : from;
            const blockNumberArray = await client.getBlockedContacts();
            const blockNumber = blockNumberArray.map((user: { id: { _serialized: string } }) => user.id._serialized);
            const isBlocked = blockNumber.includes(autor);
            // COMANDOS
            const comandoExiste =
                lista_comandos.figurinhas.includes(comando) ||
                lista_comandos.grupo.includes(comando) ||
                lista_comandos.info.includes(comando) ||
                lista_comandos.download.includes(comando) ||
                lista_comandos.admin.includes(comando) ||
                lista_comandos.diversao.includes(comando) ||
                lista_comandos.utilidades.includes(comando);

            //SE O PV DO BOT NÃO ESTIVER LIBERADO
            if (!isGroup && !isOwner && !botInfo.botInfo().pvliberado) return false;

            //SE O GRUPO NÃO FOR CADASTRADO
            if (isGroup && !grupoInfo) await cadastrarGrupo(client, 'msg');

            //SE NÃO FOR MENSAGEM DE GRUPO E FOR  BLOQUEADO RETORNE
            if (!isGroup && isBlocked) return false;

            //SE O CONTADOR TIVER ATIVADO E FOR UMA MENSAGEM DE GRUPO, VERIFICA SE O USUARIO EXISTE NO CONTADOR , REGISTRA ELE E ADICIONA A CONTAGEM
            if (isGroup && (await db.obterGrupo(from)).contador.status) {
                await db.existeUsuarioContador(from, author);
                await db.addContagem(from, author, type);
            }

            //SE O USUARIO NÃO FOR REGISTRADO, FAÇA O REGISTRO
            const registrado = await db.verificarRegistro(autor);
            if (!registrado) {
                if (isOwner) {
                    await db.verificarDonoAtual(autor);
                    await db.registrarDono(autor, notifyName);
                } else {
                    await db.registrarUsuario(autor, notifyName);
                }
            } else {
                if (isOwner) await db.verificarDonoAtual(autor);
            }

            if (comandoExiste) {
                //ATUALIZE NOME DO USUÁRIO
                await db.atualizarNome(autor, notifyName);

                //SE FOR MENSAGEM DE GRUPO E USUARIO FOR BLOQUEADO RETORNE
                if (isGroup && isBlocked) return false;

                //SE O GRUPO ESTIVER COM O RECURSO 'MUTADO' LIGADO E USUARIO NÃO FOR ADMINISTRADOR
                if (isGroup && !isGroupAdmins && grupoInfo?.mutar) return false;

                //LIMITACAO DE COMANDO POR MINUTO
                if (botInfo.botInfo().limitecomandos.status) {
                    const usuario = await db.obterUsuario(autor);
                    const limiteComando: any = await botInfo.botLimitarComando(autor, usuario.tipo, isGroupAdmins);
                    if (limiteComando.comando_bloqueado) {
                        if (limiteComando.msg != undefined) await message.reply(limiteComando.msg);
                        return false;
                    }
                }

                //BLOQUEIO GLOBAL DE COMANDOS
                if ((await block.verificarBloqueioGlobal(comando)) && !isOwner) {
                    await message.reply(criarTexto(msgs_texto.admin.bcmdglobal.resposta_cmd_bloqueado, comando));
                    return false;
                }
                //SE O RECURSO DE LIMITADOR DIARIO DE COMANDOS ESTIVER ATIVADO E O COMANDO NÃO ESTIVER NA LISTA DE EXCEÇÔES/INFO/GRUPO/ADMIN
                if (botInfo.botInfo().limite_diario.status) {
                    if (
                        !lista_comandos.excecoes_contagem.includes(command) &&
                        !lista_comandos.admin.includes(command) &&
                        !lista_comandos.grupo.includes(command) &&
                        !lista_comandos.info.includes(command) &&
                        !msgGuia
                    ) {
                        await botInfo.botVerificarExpiracaoLimite();
                        const ultrapassou = await db.ultrapassouLimite(autor);
                        if (!ultrapassou) {
                            await db.addContagemDiaria(autor);
                        } else {
                            await message.reply(criarTexto(msgs_texto.admin.limitediario.resposta_excedeu_limite, notifyName, ownerNumber));
                            return false;
                        }
                    } else {
                        await db.addContagemTotal(autor);
                        await botInfo.botVerificarExpiracaoLimite();
                    }
                } else {
                    await db.addContagemTotal(autor);
                }
                //ADICIONA A CONTAGEM DE COMANDOS EXECUTADOS PELO BOT
                botInfo.botInfoUpdate();
            } else {
                //SE NÃO FOR UM COMANDO EXISTENTE
                //SE FOR UMA MENSAGEM PRIVADA E O LIMITADOR DE MENSAGENS ESTIVER ATIVO
                if (!isGroup && botInfo.botInfo().limitarmensagens.status) {
                    const u = await db.obterUsuario(autor);
                    const tipo_usuario_pv = u ? u.tipo : 'bronze';
                    const limitarMensagens: any = await botInfo.botLimitarMensagensPv(author, tipo_usuario_pv);
                    if (limitarMensagens.bloquear_usuario) {
                        await client.sendMessage(autor, limitarMensagens.msg);
                        const contato = await client.getContactById(author);
                        await contato.block();
                        return false;
                    }
                }
            }
            return true;
        } catch (err: any) {
            consoleErro(err, 'CHECAGEM COMANDOS');
        }
    }
}
