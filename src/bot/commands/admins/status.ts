import { proto } from "baileys";
import { MessageContent, Command, Bot } from "../../../interfaces/interfaces.js";

import { Socket } from "../../socket/Socket.js";
import { criarTexto } from "../../../lib/utils.js";
import { GrupoController } from "../../../controllers/GrupoController.js";

const grupos = new GrupoController();

const command: Command = {
  name: "status",
  description: "Mostra o status do grupo.",
  category: "admins",
  aliases: ["status", "stt"], // não mude o index 0 do array pode dar erro no guia dos comandos.
  group: true,
  admin: true,
  exec: async (
    sock: Socket,
    message: proto.IWebMessageInfo,
    messageContent: MessageContent,
    args: string[],
    dataBot: Partial<Bot>,
    textMessage,
  ) => {
    const { grupo, id_chat } = messageContent;
    const { dataBd, id_group } = { ...grupo };

    let expiracao = await grupos.getGroupExpiration(id_group);
    let resposta = textMessage.grupo.status.msgs.resposta_titulo;

    // Expiração
    resposta += criarTexto(
      textMessage.grupo.status.msgs.resposta_variavel.expiracao,
      expiracao?.expiracao ? expiracao?.expiracao : "Sem Limite",
    );
    //Bem-vindo
    resposta += dataBd.bemvindo?.status
      ? textMessage.grupo.status.msgs.resposta_variavel.bemvindo.on
      : textMessage.grupo.status.msgs.resposta_variavel.bemvindo.off;
    //Mutar
    resposta += dataBd.mutar
      ? textMessage.grupo.status.msgs.resposta_variavel.mutar.on
      : textMessage.grupo.status.msgs.resposta_variavel.mutar.off;
    //Auto-Sticker
    resposta += dataBd.autosticker
      ? textMessage.grupo.status.msgs.resposta_variavel.autosticker.on
      : textMessage.grupo.status.msgs.resposta_variavel.autosticker.off;
    //Anti-Link
    let al_filtros = "";
    if (dataBd.antilink?.filtros?.instagram)
      al_filtros += textMessage.grupo.status.msgs.resposta_variavel.antilink.filtros.instagram;
    if (dataBd.antilink?.filtros?.facebook)
      al_filtros += textMessage.grupo.status.msgs.resposta_variavel.antilink.filtros.facebook;
    if (dataBd.antilink?.filtros?.youtube)
      al_filtros += textMessage.grupo.status.msgs.resposta_variavel.antilink.filtros.youtube;

    resposta += dataBd.antilink?.status
      ? criarTexto(textMessage.grupo.status.msgs.resposta_variavel.antilink.on, al_filtros)
      : textMessage.grupo.status.msgs.resposta_variavel.antilink.off;
    //Anti-Porno
    resposta += dataBd.antiporno
      ? textMessage.grupo.status.msgs.resposta_variavel.antiporno.on
      : textMessage.grupo.status.msgs.resposta_variavel.antiporno.off;
    //Anti-fake
    resposta += dataBd.antifake?.status
      ? criarTexto(
          textMessage.grupo.status.msgs.resposta_variavel.antifake.on,
          String(dataBd.antifake?.ddi_liberados),
        )
      : textMessage.grupo.status.msgs.resposta_variavel.antifake.off;
    //Anti-flood
    resposta += dataBd.antiflood?.status
      ? criarTexto(
          textMessage.grupo.status.msgs.resposta_variavel.antiflood.on,
          String(dataBd.antiflood.max),
          String(dataBd.antiflood.intervalo),
        )
      : textMessage.grupo.status.msgs.resposta_variavel.antiflood.off;
    //Contador
    resposta += dataBd.contador?.status
      ? criarTexto(
          textMessage.grupo.status.msgs.resposta_variavel.contador.on,
          dataBd.contador?.inicio ?? "",
        )
      : textMessage.grupo.status.msgs.resposta_variavel.contador.off;
    //Bloqueio de CMDS
    const comandosBloqueados: string[] = [];
    for (const comandoBloqueado of dataBd.block_cmds ?? "") {
      comandosBloqueados.push(comandoBloqueado);
    }

    const comandosFormatados = comandosBloqueados.map((cmd) => `- *${cmd}*`).join("\n");
    resposta +=
      dataBd.block_cmds.length != 0
        ? criarTexto(
            textMessage.grupo.status.msgs.resposta_variavel.bloqueiocmds.on,
            comandosFormatados,
          )
        : textMessage.grupo.status.msgs.resposta_variavel.bloqueiocmds.off;
    //Lista Negra
    resposta += criarTexto(
      textMessage.grupo.status.msgs.resposta_variavel.listanegra,
      String(dataBd.lista_negra?.length),
    );
    await sock.sendText(id_chat!, resposta);
  },
};

export default command;
