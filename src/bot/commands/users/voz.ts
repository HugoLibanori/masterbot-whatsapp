import { proto } from "baileys";
import { MessageContent, Command, Bot } from "../../../interfaces/interfaces.js";

import { Socket } from "../../socket/Socket.js";
import { CommandReturn } from "../../../interfaces/interfaces.js";
import { commandErrorMsg, criarTexto } from "../../../lib/utils.js";
import { typeMessages } from "../../messages/contentMessage.js";
import * as api from "../../../api/audios.js";

const command: Command = {
  name: "voz",
  description: "Cria audios com a voz do google.",
  category: "users",
  aliases: ["voz"], // não mude o index 0 do array pode dar erro no guia dos comandos.
  group: false,
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
    const { id_chat, textReceived, command, quotedMsg, contentQuotedMsg } = messageContent;
    const botInfo = dataBot;

    try {
      const idiomasSuportados = ["pt", "en", "ja", "es", "it", "ru", "ko", "sv"];
      let idioma, usuarioTexto;
      if (!args.length) {
        return await sock.replyText(id_chat, commandErrorMsg(command, botInfo), message);
      } else if (
        quotedMsg &&
        (contentQuotedMsg.type == typeMessages.TEXTEXT ||
          contentQuotedMsg.type == typeMessages.TEXT)
      ) {
        [idioma] = args;
        usuarioTexto = contentQuotedMsg.body || contentQuotedMsg.message?.message?.conversation;
      } else {
        [idioma, ...usuarioTexto] = args;
        usuarioTexto = usuarioTexto.join(" ");
      }
      if (!usuarioTexto)
        return await sock.replyText(id_chat, textMessage.utilidades.voz.msgs.texto_vazio, message);
      if (usuarioTexto.length > 200)
        return await sock.replyText(id_chat, textMessage.utilidades.voz.msgs.texto_longo, message);
      if (!idiomasSuportados.includes(idioma))
        return await sock.replyText(
          id_chat,
          textMessage.utilidades.voz.msgs.nao_suportado,
          message,
        );
      let { resultado: resultadoAudio } = await api.textoParaVoz(idioma, usuarioTexto);
      await sock.replyFileBuffer(
        typeMessages.AUDIO,
        id_chat,
        resultadoAudio!,
        "",
        message,
        "audio/mpeg",
      );
    } catch (err: any) {
      if (!err.erro) throw err;
      await sock.replyText(
        id_chat,
        criarTexto(textMessage.outros.erro_api, command, err.erro),
        message,
      );
    }
  },
};

export default command;
