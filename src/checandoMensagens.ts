import { Client } from 'whatsapp-web.js';
import db from './dataBase';
import { isAdminGroup, consoleErro } from './util';
import comandos from '../comandos/comandos';
import botInfo from './bot';
import { cadastrarGrupo } from './cadastrarGrupo';

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
            const ownerNumber = process.env.NUMERO_DONO?.trim();
            const isOwner = isGroup ? ownerNumber === author.replace(/@c.us/g, '') : ownerNumber === from.replace(/@c.us/g, '');
            const autor = isGroup ? author : from;
            const blockNumber = await client.getBlockedContacts();
            const isBlocked = blockNumber.includes(autor);
            // COMANDOS
            const comandoExiste =
                lista_comandos.figurinhas.includes(comando) ||
                lista_comandos.grupo.includes(comando) ||
                lista_comandos.info.includes(comando) ||
                lista_comandos.download.includes(comando);

            //SE O PV DO BOT NÃO ESTIVER LIBERADO
            if (!isGroup && !isOwner && !botInfo.botInfo().pvliberado) return false;

            //SE O GRUPO NÃO FOR CADASTRADO
            if (isGroup && !grupoInfo) await cadastrarGrupo(client, 'msg');

            //SE NÃO FOR MENSAGEM DE GRUPO E FOR  BLOQUEADO RETORNE
            if (!isGroup && isBlocked) return false;

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
            }
            return true;
        } catch (err: any) {
            consoleErro(err.message, 'CHAMADA COMANDO');
        }
    }
}
