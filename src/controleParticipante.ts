import { Client, GroupChat, Chat } from 'whatsapp-web.js';
import db from './dataBase';
import msgs_texto from './msgs';

const controleParticipante = {
    participanteExiste: async (idGroup: string, particpante: string): Promise<boolean> => {
        const participanteExiste = await db.participanteExiste(idGroup, particpante);
        return participanteExiste;
    },

    atualizarParticipantes: async (client: Client): Promise<string> => {
        try {
            const grupos: Chat[] = await client.getChats();
            const participantesGrupo: string[] = [];
            for (const grupo of grupos) {
                if (grupo.isGroup) {
                    const groupId = grupo.id._serialized;
                    const participantes = grupo as GroupChat;
                    const arrayParticipantes = participantes.participants;
                    const participante = arrayParticipantes.map(particpante => particpante.id._serialized);
                    participantesGrupo.push(...participante);
                    await db.atualizarParticipantes(groupId, participantesGrupo);
                }
            }
            return msgs_texto.inicio.participantes_atualizados;
        } catch (err) {
            console.log(err);
            throw new Error('Erro no atualizarParticipantes');
        }
    },

    adicionarParticipante: async (groupId: string, participante: string): Promise<void> => {
        const participanteExiste = await db.participanteExiste(groupId, participante);
        if (!participanteExiste) await db.adicionarParticipante(groupId, participante);
    },

    removerParticipante: async (groupId: string, participante: string): Promise<void> => {
        await db.removerParticipante(groupId, participante);
    },
};

export const { atualizarParticipantes, participanteExiste, adicionarParticipante, removerParticipante } = controleParticipante;
