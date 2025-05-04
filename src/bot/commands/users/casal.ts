import { proto } from "baileys";
import { MessageContent, Command, Bot } from "../../../interfaces/interfaces.js";

import { Socket } from "../../socket/Socket.js";
import { CommandReturn } from "../../../interfaces/interfaces.js";
import { criarTexto } from "../../../lib/utils.js";

const command: Command = {
  name: "casal",
  description: "Sorteia um casal do grupo.",
  category: "users",
  aliases: ["casal"], // não mude o index 0 do array pode dar erro no guia dos comandos.
  group: true,
  admin: false,
  owner: false,
  isBotAdmin: false,
  exec: async (
    sock: Socket,
    message: proto.IWebMessageInfo,
    messageContent: MessageContent,
    args: string[],
    dataBot: Partial<Bot>,
    textMessage,
  ): Promise<CommandReturn> => {
    const {
      id_chat,
      grupo: { participants },
    } = messageContent;

    try {
      let idParticipantesAtuais = participants;
      if (idParticipantesAtuais.length < 2)
        return await sock.replyText(id_chat, textMessage.diversao.casal.msgs.minimo, message);
      let indexAleatorio = Math.floor(Math.random() * idParticipantesAtuais.length);
      let pessoaEscolhida1 = idParticipantesAtuais[indexAleatorio];
      idParticipantesAtuais.splice(indexAleatorio, 1);
      indexAleatorio = Math.floor(Math.random() * idParticipantesAtuais.length);
      let pessoaEscolhida2 = idParticipantesAtuais[indexAleatorio];
      let respostaTexto = criarTexto(
        textMessage.diversao.casal.msgs.resposta,
        pessoaEscolhida1.replace("@s.whatsapp.net", ""),
        pessoaEscolhida2.replace("@s.whatsapp.net", ""),
      );
      await sock.sendTextWithMentions(id_chat, respostaTexto, [pessoaEscolhida1, pessoaEscolhida2]);
    } catch (err) {
      console.log(err);
    }
  },
};

export default command;
