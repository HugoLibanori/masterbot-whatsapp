import { GroupMetadata, ParticipantAction } from "baileys";

import { Socket } from "./Socket";
import { BotController } from "../../controllers/BotController.js";
import { GrupoController } from "../../controllers/GrupoController.js";
import { Bot } from "../../interfaces/interfaces.js";
import { convertGroupMetadataToGrupo } from "../../lib/convert.js";
import { comandosInfo } from "../messages/textMessage.js";
import { consoleErro, corTexto, criarTexto } from "../../lib/utils.js";

const botController = new BotController();
const grupoController = new GrupoController();

export class Event {
  declare sock: Socket;
  declare groupInfo: GroupMetadata[];
  declare botInfo: Partial<Bot>;
  constructor(sock: Socket, groupInfo: GroupMetadata[], botInfo: Partial<Bot>) {
    this.sock = sock;
    this.groupInfo = groupInfo;
    this.botInfo = botInfo;
  }
  async updateDataStart(): Promise<boolean> {
    try {
      // INICIAR DADOS BOT
      await botController.startBot(this.sock, this.botInfo);
      // REGISTRAR TODOS OS GRUPOS
      await grupoController.registerGroupsInital(this.groupInfo);

      const gruposConvertidos = await Promise.all(
        this.groupInfo.map((g) => convertGroupMetadataToGrupo(g, this.sock)),
      );
      // ATUALIZAR DADOS DOS GRUPOS
      await grupoController.updateGroups(gruposConvertidos);
      //VERIFICAR LISTA NEGRA
      await grupoController.verifiedBlackList(this.sock, this.groupInfo, this.botInfo);
      // LOG GRUPOS CARREGADOS COM SUCESSO
      console.log("[GRUPOS]", corTexto(comandosInfo(this.botInfo).outros.grupos_carregados));

      //LOG SERVIDOR INICIADO COM SUCESSO
      console.log("[SERVIDOR]", corTexto(comandosInfo(this.botInfo).outros.servidor_iniciado));
    } catch (err: any) {
      consoleErro(err, "GROUPS.UPDATE");
    }
    return true;
  }

  async updateParticipants(event: {
    id: string;
    author: string;
    participants: string[];
    action: ParticipantAction;
  }) {
    try {
      const g_info = await grupoController.getGroup(event.id);
      const isBotUpdate = event.participants[0] == this.botInfo.number_bot;

      if (event.action === "add") {
        // SE O PARTICIPANTES ESTIVER NA LISTA NEGRA EXCLUI
        if (!(await grupoController.verificarListaNegraUsuario(this.sock, event, this.botInfo)))
          return;
        // ANTI-FAKE
        if (!(await grupoController.filterAntiFake(this.sock, event, this.botInfo))) return;
        // BEM-VINDO
        await grupoController.welcomeMessage(this.sock, event, this.botInfo);
        // CONTADOR
        if (g_info?.contador.status)
          await grupoController.verificarRegistrarContagemParticipante(
            event.id,
            event.participants[0],
          );
        await grupoController.addParticipant(event.participants[0], event.id);
      } else if (event.action === "remove") {
        if (event.participants[0] === this.botInfo.number_bot) {
          if (g_info?.contador.status) await grupoController.removeCountGroup(event.id);
          await grupoController.removeGroupBd(event.id);
          return;
        }
        await grupoController.removeParticipant(event.participants[0], event.id);
      } else if (event.action === "promote") {
        await grupoController.addAdmin(event.participants[0], event.id);
      } else if (event.action === "demote") {
        await grupoController.removeAdmin(event.participants[0], event.id);
      }
    } catch (err: any) {
      consoleErro(err, "GROUPS.UPDATE");
    }
  }

  async adicionadoEmGrupo(sock: Socket, dadosGrupo: GroupMetadata[], botInfo: Partial<Bot>) {
    try {
      const comandos_info = comandosInfo(botInfo);
      await grupoController.registerGroupsInital(dadosGrupo);
      await sock
        .sendText(
          dadosGrupo[0].id,
          criarTexto(comandos_info.outros.entrada_grupo, dadosGrupo[0].subject),
        )
        .catch(() => {
          return;
        });
    } catch (err: any) {
      consoleErro(err, "GROUPS.UPSERT");
    }
  }
}
