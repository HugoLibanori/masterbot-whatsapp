import { proto } from "baileys";
import { MessageContent, Command, Bot } from "../../../interfaces/interfaces.js";

import { Socket } from "../../socket/Socket.js";
import { CommandReturn } from "../../../interfaces/interfaces.js";
import { UserController } from "../../../controllers/UserController.js";
import { criarTexto } from "../../../lib/utils.js";

const userController = new UserController();

const command: Command = {
  name: "advertencia",
  description: "Adverti um membro.",
  category: "admins",
  aliases: ["advertir", "warn"], // não mude o index 0 do array pode dar erro no guia dos comandos.
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
      contentQuotedMsg,
      numberBot,
    } = messageContent;

    if (contentQuotedMsg.sender === numberBot)
      return await sock.replyText(
        id_chat,
        criarTexto(textMessage.grupo.advertir.msgs.erro_advertir),
        message,
      );

    if (!admins.includes(contentQuotedMsg.sender)) {
      await userController.changeWarning(contentQuotedMsg.sender, 1);
      const warning = await userController.getUserWarning(contentQuotedMsg.sender);
      if (!warning) return;
      await sock.sendTextWithMentions(
        id_chat,
        criarTexto(
          textMessage.grupo.alink.msgs.advertido,
          contentQuotedMsg.sender.replace("@s.whatsapp.net", ""),
          warning.toString(),
        ),
        [contentQuotedMsg.sender],
      );
    } else {
      await sock.replyText(id_chat, criarTexto(textMessage.grupo.advertir.admin), message);
    }
  },
};

export default command;
