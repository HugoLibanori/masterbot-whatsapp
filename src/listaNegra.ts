import { Client, GroupNotification, GroupChat, Contact } from 'whatsapp-web.js';
import db from './dataBase';
import msgs_texto from './msgs';
import { criarTexto } from './util';

export const verificacaoListaNegraGeral = async (client: Client): Promise<string> => {
    try {
        const botNumber = client.info.wid._serialized;
        const dataGrupo = (await client.getChats()).filter((data: { isGroup: boolean }) => {
            if (data.isGroup) return data;
            return false;
        });
        const dadosGrupoCast = dataGrupo as unknown;
        const dadosGrupo = dadosGrupoCast as GroupChat;
        const isGroup = dadosGrupo.isGroup;
        const dadosGrupoBot = isGroup
            ? dadosGrupo.participants
                  .filter((isAdmin: { isAdmin: boolean }) => isAdmin.isAdmin)
                  .map((admin: { id: { _serialized: string } }) => admin.id._serialized)
            : [];
        const isBotGroupAdmin = isGroup ? dadosGrupoBot.includes(botNumber) : false;
        for (const grupo of dataGrupo) {
            if (isBotGroupAdmin) {
                const groupId: string = grupo.id._serialized;
                const lista_negra = await db.obterListaNegra(groupId),
                    usuarios_listados: string[] = [];
                for (const participante of dadosGrupo.participants) {
                    const participanteCast = participante as never;
                    if (lista_negra.includes(participanteCast)) usuarios_listados.push(participante.id._serialized);
                }
                const nomeBot = process.env.NOME_BOT || '';
                const arrayMentions = [];

                for (const usuario of usuarios_listados) {
                    arrayMentions.push(usuario);
                    const arrayCast = arrayMentions as unknown;
                    const mentions = arrayCast as Contact[];
                    await dadosGrupo.removeParticipants([usuario]);
                    await client.sendMessage(
                        groupId,
                        criarTexto(
                            msgs_texto.geral.resposta_ban,
                            usuario.replace('@c.us', ''),
                            msgs_texto.grupo.listanegra.motivo,
                            nomeBot,
                        ),
                        { mentions },
                    );
                }
            }
        }
        return msgs_texto.inicio.lista_negra;
    } catch {
        throw new Error('Erro no verificacaoListaNegraGeral');
    }
};

export const verificarUsuarioListaNegra = async (client: Client, event: GroupNotification): Promise<boolean> => {
    const botNumber = client.info.wid._serialized;
    const getDataGrupo = await client.getChatById(event.chatId);
    const dadosGrupoCast = getDataGrupo as unknown;
    const dadosGrupo = dadosGrupoCast as GroupChat;
    const isGroup = dadosGrupo.isGroup;
    const dadosGrupoBot = isGroup
        ? dadosGrupo.participants
              .filter((isAdmin: { isAdmin: boolean }) => isAdmin.isAdmin)
              .map((admin: { id: { _serialized: string } }) => admin.id._serialized)
        : [];
    const isBotGroupAdmin = isGroup ? dadosGrupoBot.includes(botNumber) : false;
    const arrayMentions = [];
    if (isBotGroupAdmin) {
        const lista_negra = await db.obterListaNegra(event.chatId);
        if (lista_negra.includes(event.recipientIds.reduce(id => id))) {
            const nomeBot = process.env.NOME_BOT || '';
            arrayMentions.push(event.recipientIds.reduce(id => id));
            const arrayCast = arrayMentions as unknown;
            const mentions = arrayCast as Contact[];
            await dadosGrupo.removeParticipants([event.recipientIds.reduce(id => id)]);
            await client.sendMessage(
                event.chatId,
                criarTexto(
                    msgs_texto.geral.resposta_ban,
                    event.recipientIds.reduce(id => id).replace('@c.us', ''),
                    msgs_texto.grupo.listanegra.motivo,
                    nomeBot,
                ),
                { mentions },
            );
            return false;
        }
    }
    return true;
};
