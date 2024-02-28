import { Client } from 'whatsapp-web.js';
import { consoleErro, criarTexto, erroComandoMsg } from '../src/util';
import msgs_texto from '../src/msgs';

export default class Diversao {
    async diversao(client: Client, message: any) {
        try {
            const { body, from, caption, quotedMsg, hasQuotedMsg } = message;
            const { mentionedJidList, author, quotedParticipant } = message._data;
            const command: string = quotedMsg ? caption : body;
            const dadosGrupo = await message.getChat();
            const isGroup = dadosGrupo.isGroup;
            const args: string[] = command.split(' ');
            const comando = args[0].toLowerCase().trim();
            const ownerNumber = process.env.NUMERO_DONO?.trim();
            const PREFIX = process.env.PREFIX || '!';

            if (comando === `${PREFIX}viadometro`) {
                if (!isGroup) return await message.reply(msgs_texto.permissao.grupo);
                if (!hasQuotedMsg && mentionedJidList.length === 0) return await message.reply(erroComandoMsg(command));
                if (mentionedJidList.length > 1) return await message.reply(msgs_texto.diversao.viadometro.apenas_um);
                const respostas = msgs_texto.diversao.viadometro.respostas;
                let indexAleatorio = Math.floor(Math.random() * respostas.length),
                    alvo = null;
                if (mentionedJidList.length === 1) alvo = mentionedJidList[0].replace(/@c.us/g, '');
                else alvo = quotedParticipant.replace(/@c.us/g, '');
                if (ownerNumber === alvo) indexAleatorio = 0;
                const respostaTexto = criarTexto(msgs_texto.diversao.viadometro.resposta, respostas[indexAleatorio]);
                await message.reply(respostaTexto);
            } else if (comando === `${PREFIX}gadometro`) {
                if (!isGroup) return await message.reply(msgs_texto.permissao.grupo);
                if (!hasQuotedMsg && mentionedJidList.length === 0) return await message.reply(erroComandoMsg(command));
                if (mentionedJidList.length > 1) return await message.reply(msgs_texto.diversao.gadometro.apenas_um);
                const respostas = msgs_texto.diversao.gadometro.respostas;
                let indexAleatorio = Math.floor(Math.random() * respostas.length),
                    alvo = null;
                if (mentionedJidList.length === 1) alvo = mentionedJidList[0].replace(/@c.us/g, '');
                else alvo = quotedParticipant.replace(/@c.us/g, '');
                if (ownerNumber === alvo) indexAleatorio = 0;
                const respostaTexto = criarTexto(msgs_texto.diversao.gadometro.resposta, respostas[indexAleatorio]);
                await message.reply(respostaTexto);
            } else if (comando === `${PREFIX}bafometro`) {
                if (!isGroup) return await message.reply(msgs_texto.permissao.grupo);
                if (!hasQuotedMsg && mentionedJidList.length === 0) return await message.reply(erroComandoMsg(command));
                if (mentionedJidList.length > 1) return await message.reply(msgs_texto.diversao.bafometro.apenas_um);
                const respostas = msgs_texto.diversao.bafometro.respostas;
                let indexAleatorio = Math.floor(Math.random() * respostas.length),
                    alvo = null;
                if (mentionedJidList.length === 1) alvo = mentionedJidList[0].replace(/@c.us/g, '');
                else alvo = quotedParticipant.replace(/@c.us/g, '');
                if (ownerNumber === alvo) indexAleatorio = 0;
                const respostaTexto = criarTexto(msgs_texto.diversao.bafometro.resposta, respostas[indexAleatorio]);
                await message.reply(respostaTexto);
            }
        } catch (err: any) {
            consoleErro(err.message, 'DIVERSÃO');
        }
    }
}
