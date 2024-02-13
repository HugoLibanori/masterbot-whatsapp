import db from '../src/dataBase';
import msgs_texto from './msgs';
import { Client, GroupChat, Chat } from 'whatsapp-web.js';

export const cadastrarGrupo = async (data: Client, tipo: 'msg' | 'add' | 'added' | 'inicio' = 'msg') => {
    try {
        const dataGrupos: Chat[] = await data.getChats();
        const grupos: Chat[] = [];
        const dataGrupo: Chat[] = dataGrupos.filter(grupo => {
            if (!grupo.isGroup) return false;
            grupos.push(grupo);
            return true;
        });
        for (const grupo of dataGrupo) {
            const dadosGrupo = grupo as GroupChat;
            if (tipo === 'msg') {
                const isGroup = dadosGrupo.isGroup;
                const groupId = grupo.id._serialized;
                const participants = dadosGrupo.participants;
                const participantes = participants;

                if (isGroup) {
                    const g_registrado = await db.verificarGrupo(groupId);
                    if (!g_registrado) {
                        const participantesIds: string[] = participantes.map(
                            (participante: { id: { _serialized: string } }) => participante.id._serialized,
                        );
                        await db.registrarGrupo(groupId, participantesIds);
                    }
                }
            } else if (tipo === 'add') {
                const groupId = grupo.id._serialized;
                const participants = dadosGrupo.participants;
                const participantes = participants;
                const g_registrado = await db.verificarGrupo(groupId);
                if (!g_registrado) {
                    const participantesIds: string[] = participantes.map(
                        (participante: { id: { _serialized: string } }) => participante.id._serialized,
                    );
                    await db.registrarGrupo(groupId, participantesIds);
                }
            } else if (tipo === 'added') {
                const groupId = grupo.id._serialized;
                const participants = dadosGrupo.participants;
                const participantes = participants;
                const g_registrado = await db.verificarGrupo(groupId);
                if (!g_registrado) {
                    const participantesIds: string[] = participantes.map(
                        (participante: { id: { _serialized: string } }) => participante.id._serialized,
                    );
                    await db.registrarGrupo(groupId, participantesIds);
                }
            } else if (tipo === 'inicio') {
                const participants = dadosGrupo.participants;
                const g_registrado = await db.verificarGrupo(dadosGrupo.id._serialized);
                if (!g_registrado) {
                    const participantesIds: string[] = [];
                    for (const participante of participants) {
                        participantesIds.push(participante.id._serialized);
                    }
                    await db.registrarGrupo(dadosGrupo.id._serialized, participantesIds);
                }
            }
        }
        return msgs_texto.inicio.cadastro_grupos;
    } catch (error) {
        console.log(error);
        throw new Error('Erro no cadastrarGrupo: ' + error);
    }
};
