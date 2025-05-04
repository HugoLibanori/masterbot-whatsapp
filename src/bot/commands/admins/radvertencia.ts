import { proto } from "baileys";
import { MessageContent, Command, Bot } from "../../../interfaces/interfaces.js";

import { Socket } from "../../socket/Socket.js";
import { CommandReturn } from "../../../interfaces/interfaces.js";
import { UserController } from "../../../controllers/UserController.js";
import { criarTexto } from "../../../lib/utils.js";

const userController = new UserController();

const command: Command = {
  name: "radvertencias",
  description: "Reseta as advertencias de um membro.",
  category: "admins",
  aliases: ["radvertencias", "rwarn"], // não mude o index 0 do array pode dar erro no guia dos comandos.
  group: true,
  admin: true,
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
      grupo: {
        dataBd: { admins },
      },
      numberBot,
      contentQuotedMsg,
    } = messageContent;

    if (contentQuotedMsg.sender === numberBot)
      return await sock.replyText(
        id_chat,
        criarTexto(textMessage.grupo.radvertencias.msgs.erro_Radvertencias),
        message,
      );

    if (!admins.includes(contentQuotedMsg.sender)) {
      await userController.resetWarn(contentQuotedMsg.sender);
      const warning = await userController.getUserWarning(contentQuotedMsg.sender);
      await sock.sendTextWithMentions(
        id_chat,
        criarTexto(
          textMessage.grupo.radvertencias.reset,
          contentQuotedMsg.sender.replace("@s.whatsapp.net", ""),
          warning!.toString(),
        ),
        [contentQuotedMsg.sender],
      );
    } else {
      await sock.replyText(id_chat, criarTexto(textMessage.grupo.radvertencias.admin), message);
    }
  },
};

export default command;
