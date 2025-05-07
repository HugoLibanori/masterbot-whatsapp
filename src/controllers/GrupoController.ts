import { downloadMediaMessage, GroupMetadata, ParticipantAction, proto } from "baileys";
import moment from "moment-timezone";
import Sequelize from "sequelize";
import path from "path";

import Grupos from "../database/models/Grupo.js";
import GruposVerificados from "../database/models/GrupoVerificado.js";
import Contador from "../database/models/Contador.js";
import {
  Bot,
  ContadorInte,
  DataGrupoInitial,
  Grupo,
  GrupoVerificado,
  MessageContent,
} from "../interfaces/interfaces.js";
import { Socket } from "../bot/socket/Socket.js";
import { comandosInfo } from "../bot/messages/textMessage.js";
import {
  criarTexto,
  checkCommandExists,
  isPlataformas,
  verificarSeWebpEhAnimado,
  videoBufferToImageBuffer,
  webpBufferToImageSharp,
  obterNsfw,
} from "../lib/utils.js";
import { typeMessages } from "../bot/messages/contentMessage.js";
import { UserController } from "./UserController.js";

const userController = new UserController();

let jogoDaVelha: Record<string, any> = {};

export class GrupoController {
  constructor() {
    this.iniciarLimpezaFlood();
  }
  private floodControl = new Map<string, { count: number; expiresAt: number; punido?: boolean }>();
  private iniciarLimpezaFlood() {
    setInterval(() => {
      const agora = Date.now();
      for (const [chave, dados] of this.floodControl.entries()) {
        if (dados.expiresAt <= agora) {
          this.floodControl.delete(chave);
        }
      }
    }, 60 * 1000);
  }

  async registerGroupsInital(groupInfo: GroupMetadata[]) {
    if (groupInfo.length) {
      try {
        for (const grupo of groupInfo) {
          const group = await Grupos.findOne({ where: { id_grupo: grupo.id } });
          if (!group) {
            const { participants } = grupo;
            const participantes: string[] = [];
            participants.forEach((participant) => {
              participantes.push(participant.id);
            });

            const admins = participants
              .filter((participant) => participant.admin !== null)
              .map((participant) => participant.id ?? "");

            await Grupos.create({
              id_grupo: grupo.id,
              nome: grupo.subject,
              dono: grupo.owner ?? "",
              participantes,
              admins,
              restrito_msg: false,
              mutar: false,
              bemvindo: { status: false, msg: "" },
              antifake: { status: false, ddi_liberados: [] },
              antilink: {
                status: false,
                filtros: { instagram: false, youtube: false, facebook: false },
              },
              antiporno: false,
              antiflood: { status: false, max: 10, intervalo: 10, msgs: [] },
              autosticker: false,
              contador: { status: false, inicio: "" },
              block_cmds: [],
              lista_negra: [],
              descricao: grupo.desc ?? "",
            });
          }
        }
      } catch (error) {
        console.log(error);
      }
    }
  }

  async getGroup(id: string): Promise<Grupo | undefined> {
    const group = await Grupos.findOne({ where: { id_grupo: id } });
    if (!group) return;
    return group?.get({ plain: true });
  }

  async changeWelcome(id_grupo: string, status: boolean, msg = "") {
    await Grupos.update({ bemvindo: { status, msg } }, { where: { id_grupo } });
  }

  async addListBlack(id_grupo: string, id_usuario: string) {
    const grupo = await Grupos.findOne({ where: { id_grupo } });
    if (grupo) {
      const lista_negra = grupo.dataValues.lista_negra || [];
      if (!lista_negra.includes(id_usuario)) {
        lista_negra.push(id_usuario); // Adiciona o usuário à lista negra
        await Grupos.update({ lista_negra }, { where: { id_grupo } });
      }
    }
  }

  async removeListBlack(id_grupo: string, id_usuario: string) {
    const grupo = await Grupos.findOne({ where: { id_grupo } });
    if (grupo) {
      let lista_negra = grupo.dataValues.lista_negra || [];
      lista_negra = lista_negra.filter((u) => u !== id_usuario);
      await Grupos.update({ lista_negra }, { where: { id_grupo } });
    }
  }

  async updateGroups(dadosGrupo: DataGrupoInitial[]) {
    try {
      for (const grupo of dadosGrupo) {
        const dataGroup = await Grupos.findOne({ where: { id_grupo: grupo.id_grupo } });

        if (!dataGroup) {
          throw new Error("Grupo não encontrado");
        }

        const novosDados = {
          ...dataGroup.dataValues,
          ...grupo,
        };

        await Grupos.update(
          {
            nome: novosDados.nome,
            descricao: novosDados.descricao,
            participantes: novosDados.participantes,
            admins: novosDados.admins,
            dono: novosDados.dono,
            restrito_msg: novosDados.restrito_msg,
          },
          {
            where: { id_grupo: grupo.id_grupo },
          },
        );
      }
    } catch (error) {
      console.log(error);
    }
  }

  async updateDataGroupsInital(gruposInfo: GroupMetadata[], socket: Socket) {
    try {
      for (const grupo of gruposInfo) {
        const participantesGrupo = await socket.getMembersGroupMetadata(grupo);
        const adminsGrupo = await socket.getAdminsGroupMetadata(grupo);
        const dadosGrupo: DataGrupoInitial = {
          id_grupo: grupo.id,
          nome: grupo.subject,
          descricao: grupo.desc ?? "",
          participantes: participantesGrupo,
          admins: adminsGrupo,
          dono: grupo.owner ?? "",
          restrito_msg: grupo.announce ?? false,
        };
        await this.updateGroups([dadosGrupo]);
      }
    } catch (err: any) {
      err.message = `atualizarParticipantes - ${err.message}`;
      throw err;
    }
  }

  async obterListaNegra(id_grupo: string) {
    const grupo = await Grupos.findOne({ where: { id_grupo } });
    return grupo?.get({ plain: true })?.lista_negra || [];
  }

  async verifiedBlackList(socket: Socket, groupInfo: GroupMetadata[], botInfo: Partial<Bot>) {
    try {
      if (!botInfo.number_bot) return;
      const comandos_info = comandosInfo(botInfo);
      for (const grupo of groupInfo) {
        const grupoAdmins = await socket.getAdminsGroupMetadata(grupo),
          botAdmin = grupoAdmins.includes(botInfo.number_bot);
        if (botAdmin) {
          const participantesGrupo = await socket.getMembersGroupMetadata(grupo),
            lista_negra = await this.obterListaNegra(grupo.id),
            usuarios_listados = [];
          for (const participante of participantesGrupo) {
            if (lista_negra.includes(participante)) usuarios_listados.push(participante);
          }
          for (const usuario of usuarios_listados) {
            await socket.removerParticipant(grupo.id, usuario);
            await socket.sendTextWithMentions(
              grupo.id,
              criarTexto(
                comandos_info.outros.resposta_ban,
                usuario.replace("@s.whatsapp.net", ""),
                comandos_info.grupo.listanegra.msgs.motivo,
                botInfo.name!,
              ),
              [usuario],
            );
          }
        }
      }
    } catch (err: any) {
      err.message = `verifiedBlackList - ${err.message}`;
      throw err;
    }
  }

  async verificarListaNegraUsuario(
    sock: Socket,
    groupData: {
      id: string;
      author: string;
      participants: string[];
      action: ParticipantAction;
    },
    botInfo: Partial<Bot>,
  ) {
    try {
      const comandos_info = comandosInfo(botInfo);
      const dataGroup = await this.getGroup(groupData.id),
        grupoAdmins = dataGroup?.admins || [],
        botAdmin = grupoAdmins.includes(botInfo.number_bot!);
      if (botAdmin) {
        let lista_negra = await this.obterListaNegra(groupData.id);
        if (lista_negra.includes(groupData.participants[0].toString())) {
          await sock.removerParticipant(groupData.id, groupData.participants[0].toString());
          await sock.sendTextWithMentions(
            groupData.id,
            criarTexto(
              comandos_info.outros.resposta_ban,
              groupData.participants[0].toString().replace("@s.whatsapp.net", ""),
              comandos_info.grupo.listanegra.msgs.motivo,
              botInfo.number_bot!,
            ),
            [groupData.participants[0].toString()],
          );
          return false;
        }
      }
      return true;
    } catch (err: any) {
      err.message = `verificarListaNegraUsuario - ${err.message}`;
      console.log(err, "LISTA NEGRA");
      return true;
    }
  }

  async addParticipant(id_usuario: string, id_grupo: string) {
    const grupo = await Grupos.findOne({ where: { id_grupo } });
    if (grupo) {
      const participantes = grupo.dataValues.participantes || [];
      if (!participantes.includes(id_usuario)) {
        participantes.push(id_usuario);
        await Grupos.update({ participantes }, { where: { id_grupo } });
      }
    }
  }

  async removeParticipant(id_usuario: string, id_grupo: string) {
    const grupo = await Grupos.findOne({ where: { id_grupo } });
    if (grupo) {
      const participantes = grupo.dataValues.participantes || [];
      if (participantes.includes(id_usuario)) {
        participantes.splice(participantes.indexOf(id_usuario), 1);
        await Grupos.update({ participantes }, { where: { id_grupo } });
      }
    }
  }

  async addAdmin(id_usuario: string, id_grupo: string) {
    const grupo = await Grupos.findOne({ where: { id_grupo } });
    if (grupo) {
      const admins = grupo.dataValues.admins || [];
      if (!admins.includes(id_usuario)) {
        admins.push(id_usuario);
        await Grupos.update({ admins }, { where: { id_grupo } });
      }
    }
  }

  async removeAdmin(id_usuario: string, id_grupo: string) {
    const grupo = await Grupos.findOne({ where: { id_grupo } });
    if (grupo) {
      const admins = grupo.dataValues.admins || [];
      if (admins.includes(id_usuario)) {
        admins.splice(admins.indexOf(id_usuario), 1);
        await Grupos.update({ admins }, { where: { id_grupo } });
      }
    }
  }

  async removeGroupBd(id_grupo: string) {
    await Grupos.destroy({ where: { id_grupo } });
  }

  async changeAntiLink(
    id_grupo: string,
    status: boolean,
    filtros: {
      instagram: boolean;
      youtube: boolean;
      facebook: boolean;
    },
  ) {
    const grupo: Grupo | null = await Grupos.findOne({ where: { id_grupo } });
    if (!grupo) return;

    const antilinkAtualizado = {
      ...grupo.antilink,
      status,
      filtros,
    };

    await Grupos.update({ antilink: antilinkAtualizado }, { where: { id_grupo } });
  }

  async changeAntiPorno(id_grupo: string, status: boolean) {
    const grupo: Grupo | null = await Grupos.findOne({ where: { id_grupo } });
    if (!grupo) return;
    await Grupos.update({ antiporno: status }, { where: { id_grupo } });
  }

  async changeAntiFake(id_grupo: string, status: boolean, ddi_liberados: string[] = ["55"]) {
    const antifakeAtualizado = { status, ddi_liberados };

    await Grupos.update({ antifake: antifakeAtualizado }, { where: { id_grupo } });
  }

  async changeMute(id_grupo: string, status: boolean) {
    await Grupos.update({ mutar: status }, { where: { id_grupo } });
  }

  async blockCommands(
    id_grupo: string,
    comandos: string[],
    dataBot: Partial<Bot>,
  ): Promise<string> {
    const grupo = await this.getGroup(id_grupo);
    if (!grupo || !dataBot.prefix) return "";

    const existingCommands = grupo.block_cmds || [];
    const newCommands: string[] = [];
    const textCommands = comandosInfo(dataBot);
    let respText = textCommands.grupo.bcmd.msgs.resposta_titulo;

    for (const comando of comandos) {
      if (!comando.startsWith(dataBot.prefix)) {
        respText += criarTexto(
          textCommands.grupo.bcmd.msgs.resposta_variavel.enviado_erro,
          comando,
        );
        continue;
      }
      const exists = checkCommandExists(dataBot, comando);

      if (!exists) {
        respText += criarTexto(textCommands.grupo.bcmd.msgs.resposta_variavel.nao_existe, comando);
      } else {
        if (existingCommands.includes(comando)) {
          respText += criarTexto(
            textCommands.grupo.bcmd.msgs.resposta_variavel.ja_bloqueado,
            comando,
          );
        } else if (comando.includes("menu") || typeof exists === "string") {
          respText += criarTexto(textCommands.grupo.bcmd.msgs.resposta_variavel.erro, comando);
        } else {
          respText += criarTexto(
            textCommands.grupo.bcmd.msgs.resposta_variavel.bloqueado_sucesso,
            comando,
          );
          newCommands.push(comando);
        }
      }
    }

    const novos = [...new Set([...existingCommands, ...newCommands])];
    await Grupos.update({ block_cmds: novos }, { where: { id_grupo } });

    return respText;
  }

  async unblockCommands(
    id_grupo: string,
    comandos: string[],
    dataBot: Partial<Bot>,
  ): Promise<string> {
    const grupo = await this.getGroup(id_grupo);
    if (!grupo || !dataBot.prefix) return "";

    const existingCommands = grupo.block_cmds || [];
    const updatedCommands = [...existingCommands];
    const textCommands = comandosInfo(dataBot);
    let respText = textCommands.grupo.bcmd.msgs.resposta_titulo;

    for (const comando of comandos) {
      if (!comando.startsWith(dataBot.prefix)) {
        respText += criarTexto(
          textCommands.grupo.bcmd.msgs.resposta_variavel.enviado_erro,
          comando,
        );
        continue;
      }

      if (!existingCommands.includes(comando)) {
        respText += criarTexto(
          textCommands.grupo.dcmd.msgs.resposta_variavel.ja_desbloqueado,
          comando,
        );
      } else {
        // Remove da lista
        const index = updatedCommands.indexOf(comando);
        if (index !== -1) updatedCommands.splice(index, 1);

        respText += criarTexto(
          textCommands.grupo.dcmd.msgs.resposta_variavel.desbloqueado_sucesso,
          comando,
        );
      }
    }

    await Grupos.update({ block_cmds: updatedCommands }, { where: { id_grupo } });

    return respText;
  }

  async changeAutoSticker(id_grupo: string, status: boolean) {
    await Grupos.update({ autosticker: status }, { where: { id_grupo } });
  }

  async changeContador(id_grupo: string, status: boolean) {
    const data_atual = status ? moment(moment.now()).format("DD/MM HH:mm:ss") : "";
    const grupo = await Grupos.findOne({ where: { id_grupo } });

    if (!grupo) return;

    const contadorAtualizado = {
      ...grupo.contador,
      status,
      inicio: data_atual,
    };

    await Grupos.update({ contador: contadorAtualizado }, { where: { id_grupo } });
  }

  async removeCountGroup(id_grupo: string) {
    await Contador.destroy({
      where: {
        id_grupo,
      },
    });
  }

  async recordGroupCount(id_grupo: string, usuariosGrupo: string[]) {
    for (const usuario of usuariosGrupo) {
      await this.recordParticipantsCount(id_grupo, usuario);
    }
  }

  async recordParticipantsCount(id_grupo: string, id_usuario: string) {
    const contadorExistente = await Contador.findOne({
      where: {
        id_grupo,
        id_usuario,
      },
    });

    if (!contadorExistente) {
      await Contador.create({
        id_grupo,
        id_usuario,
        msg: 0,
        imagem: 0,
        audio: 0,
        sticker: 0,
        video: 0,
        outro: 0,
        texto: 0,
      });
    }
  }

  async getUserActivity(id_grupo: string, id_usuario: string) {
    const activity = await Contador.findOne({
      where: {
        id_grupo,
        id_usuario,
      },
    });

    return activity?.get({ plain: true });
  }

  async getCount(id_grupo: string, id_usuario: string) {
    const dataValues = await Contador.findOne({
      where: {
        id_grupo,
        id_usuario,
      },
    });
    return dataValues?.get({ plain: true });
  }

  async getParticipantActivity(id_grupo: string, id_usuario: string) {
    return await this.getCount(id_grupo, id_usuario);
  }

  async checkRegisterCountParticipant(id_grupo: string, id_usuario: string) {
    const contador = await this.getParticipantActivity(id_grupo, id_usuario);
    if (!contador) await this.recordParticipantsCount(id_grupo, id_usuario);
  }

  async addCount(id_grupo: string, id_usuario: string, dados: ContadorInte) {
    const contador = await Contador.findOne({
      where: {
        id_grupo,
        id_usuario,
      },
    });

    if (contador) {
      await Contador.increment(dados, {
        where: {
          id_grupo,
          id_usuario,
        },
      });
    } else {
      await Contador.create({
        id_grupo,
        id_usuario,
        ...dados,
      });
    }
  }

  async addParticipantCount(id_grupo: string, id_usuario: string, tipoMensagem: string) {
    const dadosIncrementados: ContadorInte = {
      msg: 1,
      imagem: 0,
      audio: 0,
      sticker: 0,
      video: 0,
      outro: 0,
      texto: 0,
    };
    switch (tipoMensagem) {
      case typeMessages.TEXT:
      case typeMessages.TEXTEXT:
        dadosIncrementados.texto = 1;
        break;
      case typeMessages.IMAGE:
        dadosIncrementados.imagem = 1;
        break;
      case typeMessages.VIDEO:
        dadosIncrementados.video = 1;
        break;
      case typeMessages.STICKER:
        dadosIncrementados.sticker = 1;
        break;
      case typeMessages.AUDIO:
        dadosIncrementados.audio = 1;
        break;
      case typeMessages.DOCUMENT:
        dadosIncrementados.outro = 1;
        break;
    }
    await this.addCount(id_grupo, id_usuario, dadosIncrementados);
  }

  async getCountsLessThan(id_grupo: string, num: number) {
    return await Contador.findAll({
      where: {
        id_grupo,
        msg: {
          [Sequelize.Op.lt]: num,
        },
      },
      order: [["msg", "DESC"]],
    });
  }

  async getInactiveParticipants(id_grupo: string, qtdMensagem: number) {
    const inativos = await this.getCountsLessThan(id_grupo, qtdMensagem);
    const grupoInfo = await this.getGroup(id_grupo);
    const inativosNoGrupo: Contador[] = [];
    inativos.forEach((inativo) => {
      if (grupoInfo?.participantes.includes(inativo.id_usuario)) inativosNoGrupo.push(inativo);
    });
    return inativosNoGrupo;
  }

  async getHighestCounts(id_grupo: string) {
    return await Contador.findAll({
      where: {
        id_grupo,
      },
      order: [["msg", "DESC"]],
    });
  }

  async getActiveParticipants(id_grupo: string, qtd: number) {
    const ativos = await this.getHighestCounts(id_grupo);
    const grupoInfo = await this.getGroup(id_grupo);
    const ativosNoGrupo: Contador[] = [];
    ativos.forEach((ativo) => {
      if (grupoInfo?.participantes.includes(ativo.id_usuario)) ativosNoGrupo.push(ativo);
    });
    return ativosNoGrupo.length >= qtd ? ativosNoGrupo.slice(0, qtd) : ativosNoGrupo;
  }

  async getAllGroups() {
    return await Grupos.findAll();
  }

  async registerGroupVerified(dadosGrupo: GrupoVerificado) {
    await GruposVerificados.create({ ...dadosGrupo, expiracao: dadosGrupo.expiracao ?? "" });
  }

  async removeGroupVerified(nome: string) {
    const removido = await GruposVerificados.destroy({ where: { nome } });
    return removido;
  }

  async getGroupExpiration(id_grupo: string) {
    const data = await GruposVerificados.findOne({ where: { id_grupo } });
    return data?.get({ plain: true });
  }

  async groupVerified(id_grupo: string) {
    const data = await GruposVerificados.findOne({ where: { id_grupo } });
    return data?.get({ plain: true });
  }

  async updateExpirationGroup(dadosGrupo: GrupoVerificado) {
    const expiracao = String(dadosGrupo.expiracao);

    await GruposVerificados.update(
      {
        expiracao: expiracao,
      },
      {
        where: { id_grupo: dadosGrupo.id_grupo },
      },
    );
  }

  async getAllVerifiedGroups() {
    return await GruposVerificados.findAll();
  }

  async iniciarJogo(
    grupoId: string,
    jogador1: string,
    jogador2: string,
    c: Socket,
    prefixo: string,
  ) {
    jogoDaVelha[grupoId] = {
      tabuleiro: ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"],
      jogadores: [jogador1, jogador2],
      atual: jogador1,
      simboloAtual: "❌",
      jogoAtivo: false,
      adversario: jogador2,
      aceito: false,
    };

    await c.sendTextWithMentions(
      grupoId,
      `🎮 Jogo da Velha iniciado entre @${jogador1} e @${jogador2}!\n\nAguardando o jogador @${jogador2} aceitar o convite.\nPara aceitar envie:\n\`${prefixo}jogar\``,
      [jogador1 + "@s.whatsapp.net", jogador2 + "@s.whatsapp.net"],
    );
  }

  async exibirTabuleiro(tabuleiro: string[]) {
    return `${tabuleiro[0]} | ${tabuleiro[1]} | ${tabuleiro[2]}\n${tabuleiro[3]} | ${tabuleiro[4]} | ${tabuleiro[5]}\n${tabuleiro[6]} | ${tabuleiro[7]} | ${tabuleiro[8]}`;
  }

  async jogoDaVelha(c: Socket, mensagemBaileys: MessageContent, botInfo: Partial<Bot>) {
    const { prefix } = botInfo;
    const comando = `${prefix}jogodavelha`;
    const mensagemGrupo = mensagemBaileys.isGroup;
    const comandos_info = comandosInfo(botInfo);

    if (comando === mensagemBaileys.command && mensagemBaileys.textReceived === `guia`) {
      await c.sendText(
        mensagemBaileys.id_chat,
        "❔ USO DO COMANDO ❔\n\n" + comandos_info.diversao.jogodavelha.guia,
      );
      return false;
    }

    if (mensagemBaileys.command === comando && mensagemGrupo) {
      const jogador1 = mensagemBaileys.sender?.replace("@s.whatsapp.net", "");
      const jogador2 = mensagemBaileys.grupo?.mentionedJid[0]?.replace("@s.whatsapp.net", "");

      if (!jogador2) {
        await c.sendText(mensagemBaileys.id_chat, "Mencione o jogador com quem deseja jogar.");
        return false;
      }

      await this.iniciarJogo(mensagemBaileys.id_chat, jogador1, jogador2, c, prefix!);
      return false;
    } else if (comando === mensagemBaileys.command && !mensagemGrupo) {
      await c.sendText(mensagemBaileys.id_chat, "⛔ Este comando só pode ser usado em grupos.");
      return false;
    }

    if (
      jogoDaVelha[mensagemBaileys.id_chat]?.adversario + "@s.whatsapp.net" ===
        mensagemBaileys.sender &&
      mensagemBaileys.command === `${prefix}jogar`
    ) {
      jogoDaVelha[mensagemBaileys.id_chat].jogoAtivo = true;
      jogoDaVelha[mensagemBaileys.id_chat].aceito = true;
      await c.sendTextWithMentions(
        mensagemBaileys.id_chat,
        `⛔ O jogador @${jogoDaVelha[mensagemBaileys.id_chat]?.adversario} aceitou o convite.\n\n${await this.exibirTabuleiro(
          jogoDaVelha[mensagemBaileys.id_chat]?.tabuleiro,
        )}\n\nPara jogar envie um número de 1 a 9, somente o número.\nEx: Se você enviar o numero 5 o bot vai trocar o simbolo 5️⃣ por ❌ ou ⭕.`,
        [jogoDaVelha[mensagemBaileys.id_chat]?.adversario + "@s.whatsapp.net"],
      );
      return false;
    }
    if (jogoDaVelha[mensagemBaileys.id_chat] && /^[1-9]$/.test(mensagemBaileys.textFull!)) {
      if (!jogoDaVelha[mensagemBaileys.id_chat]?.aceito) {
        await c.sendText(mensagemBaileys.id_chat, "⛔ O adversário ainda não aceitou a partida.");
        return false;
      }
      await this.fazerJogada(
        mensagemBaileys.id_chat,
        mensagemBaileys.sender?.replace("@s.whatsapp.net", ""),
        mensagemBaileys.textFull!,
        c,
      );
      return false;
    }
    return true;
  }

  async fazerJogada(grupoId: string, jogador: string, posicao: string, c: Socket) {
    const jogo = jogoDaVelha[grupoId];

    if (!jogo || !jogo.jogoAtivo) return false;
    if (jogo.jogadores.indexOf(jogador) === -1) return false;

    if (jogo.atual !== jogador) {
      await c.sendTextWithMentions(grupoId, `⛔ Não é sua vez, @${jogador}!`, [
        jogador + "@s.whatsapp.net",
      ]);
      return false;
    }

    const indice = parseInt(posicao) - 1;

    if (jogo.tabuleiro[indice] === "❌" || jogo.tabuleiro[indice] === "⭕") {
      await c.sendText(grupoId, "⚠️ Posição já ocupada! Escolha outro número.");
      return false;
    }

    jogo.tabuleiro[indice] = jogo.simboloAtual;

    if (await this.verificarVencedor(jogo.tabuleiro, jogo.simboloAtual)) {
      await c.sendTextWithMentions(
        grupoId,
        `🏆 @${jogador} venceu!\n\n${await this.exibirTabuleiro(jogo.tabuleiro)}`,
        [jogador + "@s.whatsapp.net"],
      );
      jogo.jogoAtivo = false;
      return false;
    }

    if (jogo.tabuleiro.every((pos: string) => pos === "❌" || pos === "⭕")) {
      await c.sendText(grupoId, `🤝 Empate!\n\n${await this.exibirTabuleiro(jogo.tabuleiro)}`);
      jogo.jogoAtivo = false;
      return false;
    }

    jogo.atual = jogo.jogadores[0] === jogo.atual ? jogo.jogadores[1] : jogo.jogadores[0];
    jogo.simboloAtual = jogo.simboloAtual === "❌" ? "⭕" : "❌";

    await c.sendTextWithMentions(
      grupoId,
      `${await this.exibirTabuleiro(jogo.tabuleiro)}\n\nAgora é a vez de @${jogo.atual} jogar!`,
      [jogo.atual + "@s.whatsapp.net"],
    );
    return false;
  }

  async verificarVencedor(tabuleiro: string[], simbolo: string) {
    const combinacoesVencedoras = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    return combinacoesVencedoras.some((combinacao) =>
      combinacao.every((indice) => tabuleiro[indice] === simbolo),
    );
  }

  async obterGrupoEmComum(id_grupo: string, remetente: string): Promise<boolean | undefined> {
    let grupo = await this.getGroup(id_grupo);
    return grupo?.participantes.includes(remetente);
  }

  async obterContagem(id_grupo: string, id_usuario: string) {
    const data = await Contador.findOne({
      where: {
        id_grupo,
        id_usuario,
      },
    });
    return data?.get({ plain: true });
  }

  async registrarContador(id_grupo: string, id_usuario: string) {
    const contadorExistente = await Contador.findOne({
      where: {
        id_grupo,
        id_usuario,
      },
    });

    if (!contadorExistente) {
      await Contador.create({
        id_grupo,
        id_usuario,
        msg: 0,
        imagem: 0,
        audio: 0,
        sticker: 0,
        video: 0,
        outro: 0,
        texto: 0,
      });
    }
  }

  async verificarRegistrarContagemParticipante(id_grupo: string, id_usuario: string) {
    let contador = await this.obterContagem(id_grupo, id_usuario);
    if (!contador) await this.registrarContador(id_grupo, id_usuario);
  }

  async verificarComandosBloqueadosGrupo(
    comando: string,
    grupoInfo: Partial<Bot>,
  ): Promise<boolean | undefined> {
    return grupoInfo.block_cmds?.includes(comando);
  }

  async filterAntiLink(
    sock: Socket,
    messageContent: MessageContent,
    botInfo: Partial<Bot>,
    message: proto.IWebMessageInfo,
  ) {
    try {
      const comandos_info = comandosInfo(botInfo);
      const { textFull, sender, id_chat, isGroup, grupo, quotedMsg } = messageContent;
      const usuarioTexto = textFull;
      const { id_group, isBotAdmin, dataBd } = { ...grupo };
      const { admins, antilink } = { ...dataBd };
      if (!isGroup) return true;
      if (!antilink.status) return true;

      if (!isBotAdmin) {
        await this.changeAntiLink(id_group, false, {
          instagram: false,
          youtube: false,
          facebook: false,
        });
      } else {
        if (usuarioTexto) {
          const textoComUrl = usuarioTexto.match(
            new RegExp(
              /(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([-.][a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?/gim,
            ),
          );
          const isRede = await isPlataformas(usuarioTexto, dataBd);
          if (textoComUrl && !admins.includes(sender) && !isRede) {
            await sock.sendTextWithMentions(
              id_chat,
              criarTexto(
                comandos_info.grupo.alink.msgs.detectou,
                sender.replace("@s.whatsapp.net", ""),
              ),
              [sender],
            );
            await sock.deleteMessage(message, quotedMsg);
            await userController.changeWarning(sender, 1);
            const advertencia = await userController.getUserWarning(sender);
            await sock.sendTextWithMentions(
              id_chat,
              criarTexto(
                comandos_info.grupo.alink.msgs.advertido,
                sender.replace("@s.whatsapp.net", ""),
                advertencia ? advertencia.toString() : "0",
              ),
              [sender],
            );
            if (advertencia === 3) {
              await sock.removerParticipant(id_chat, sender);
              await sock.sendTextWithMentions(
                id_chat,
                criarTexto(comandos_info.grupo.alink.msgs.motivo),
                [sender],
              );
              await userController.resetWarn(sender);
            }
            return false;
          }
        }
      }
      return true;
    } catch (err: any) {
      err.message = `antiLink - ${err.message}`;
      console.log(err, "ANTI-LINK");
      return true;
    }
  }

  async filterAntiFake(
    sock: Socket,
    evento: {
      id: string;
      author: string;
      participants: string[];
      action: ParticipantAction;
    },
    botInfo: Partial<Bot>,
  ) {
    const grupoInfo = await this.getGroup(evento.id);
    if (!grupoInfo) return true;
    try {
      if (grupoInfo.antifake.status) {
        const comandos_info = comandosInfo(botInfo);
        let participante = evento.participants[0];
        let grupoAdmins = grupoInfo.admins;
        let botAdmin = grupoAdmins.includes(botInfo.number_bot!);

        if (!botAdmin) {
          await this.changeAntiFake(evento.id, false);
        } else {
          for (let ddi of grupoInfo.antifake.ddi_liberados) {
            if (participante.startsWith(ddi)) return true;
          }
          await sock.sendTextWithMentions(
            evento.id,
            criarTexto(
              comandos_info.outros.resposta_ban,
              participante.replace("@s.whatsapp.net", ""),
              comandos_info.grupo.afake.msgs.motivo,
              botInfo.number_bot!.replace("@s.whatsapp.net", ""),
            ),
            [participante, botInfo.number_bot!],
          );
          await sock.removerParticipant(evento.id, participante);
          return false;
        }
      }
      return true;
    } catch (err: any) {
      err.message = `antiFake - ${err.message}`;
      console.log(err, "ANTI-FAKE");
      return true;
    }
  }

  async welcomeMessage(
    sock: Socket,
    evento: {
      id: string;
      author: string;
      participants: string[];
      action: ParticipantAction;
    },
    botInfo: Partial<Bot>,
  ) {
    const grupoInfo = await this.getGroup(evento.id);
    if (!grupoInfo) return;
    try {
      const comandos_info = comandosInfo(botInfo);
      if (grupoInfo.bemvindo.status) {
        let msg_customizada = grupoInfo.bemvindo.msg != "" ? grupoInfo.bemvindo.msg + "\n\n" : "";
        let mensagem_bemvindo = criarTexto(
          comandos_info.grupo.bv.msgs.mensagem,
          evento.participants[0].replace("@s.whatsapp.net", ""),
          grupoInfo.nome,
          msg_customizada,
        );

        await sock
          .getImagePerfil(evento.participants[0])
          .then(async (foto) => {
            await sock.sendTextWithImageMentions(
              evento.id,
              mensagem_bemvindo,
              [evento.participants[0]],
              foto!,
            );
          })
          .catch(async () => {
            const caminhoFoto = path.resolve("src", "bot", "midia", "usuariosemfoto.jpg");
            await sock.sendTextWithImageMentions(
              evento.id,
              mensagem_bemvindo,
              [evento.participants[0]],
              caminhoFoto,
            );
          });
      }
    } catch (err: any) {
      err.message = `bemVindo - ${err.message}`;
      console.log(err, "BEM VINDO");
    }
  }

  async getParticipants(id_grupo: string) {
    let grupo = await Grupos.findOne({ where: { id_grupo } });
    return grupo?.get({ plain: true })?.participantes || [];
  }

  async filterAntiPorno(
    sock: Socket,
    mensagemBaileys: MessageContent,
    botInfo: Partial<Bot>,
    message: proto.IWebMessageInfo,
  ) {
    try {
      const comandos_info = comandosInfo(botInfo);
      const { sender, isGroup, grupo, type } = mensagemBaileys;
      const { id_group, isBotAdmin, isAdmin } = { ...grupo };
      const grupoInfo = await this.getGroup(id_group);

      if (!isGroup) return true;
      if (!grupoInfo?.antiporno) return true;

      if (!isBotAdmin) {
        await this.changeAntiPorno(id_group, false);
      } else {
        if (
          !isAdmin &&
          (type === typeMessages.IMAGE ||
            type === typeMessages.STICKER ||
            type === typeMessages.VIDEO)
        ) {
          let bufferMidia = await downloadMediaMessage(message, "buffer", {});
          let animado;
          if (type === typeMessages.STICKER) {
            animado = await verificarSeWebpEhAnimado(bufferMidia);
          }
          if (type === typeMessages.VIDEO) {
            bufferMidia = await videoBufferToImageBuffer(bufferMidia);
          } else if (type === typeMessages.STICKER && animado === "animado") {
            bufferMidia = await webpBufferToImageSharp(bufferMidia);
          }
          if (!botInfo.apis?.google?.api_key)
            return await sock.replyText(id_group, comandos_info.admin.apis.msgs.sem_api, message);

          try {
            const resp = await obterNsfw(bufferMidia, botInfo, sock);
            const participantes = await this.getParticipants(id_group);
            const usuarioExiste = participantes.includes(sender);

            if (resp && usuarioExiste) {
              await sock.deleteMessage(message);
              await sock.removerParticipant(id_group, sender);

              await sock.sendTextWithMentions(
                id_group,
                criarTexto(
                  comandos_info.outros.resposta_ban,
                  sender.replace("@s.whatsapp.net", ""),
                  comandos_info.grupo.aporno.msgs.motivo,
                  botInfo.number_bot!,
                ),
                [sender],
              );
            } else if (resp && !usuarioExiste) {
              await sock.deleteMessage(message);
            }
            return true;
          } catch (err: any) {
            console.error(`Erro ao escrever o arquivo ou obter NSFW: ${err.message}`);
            return true;
          }
        }
      }

      return true;
    } catch (err: any) {
      err.message = `antiPorno - ${err.message}`;
      console.log(err, "ANTI-PORNO");
      return true;
    }
  }

  async changeAntiFlood(id_grupo: string, status: boolean, max: number, intervalo: number) {
    const grupo = await Grupos.findOne({ where: { id_grupo } });

    const antifloodAtualizado = {
      ...grupo?.antiflood,
      status,
      max,
      intervalo,
      msgs: [],
    };

    await Grupos.update({ antiflood: antifloodAtualizado }, { where: { id_grupo } });
  }

  async filtroAntiFlood(sock: Socket, mensagemBaileys: MessageContent, botInfo: Partial<Bot>) {
    try {
      const comandos_info = comandosInfo(botInfo);
      const { id_chat, sender: remetente, isGroup: mensagem_grupo, grupo } = mensagemBaileys;
      const { id_group, isBotAdmin: bot_admin, dataBd } = grupo;

      if (!mensagem_grupo || !dataBd?.antiflood?.status) return true;

      if (!bot_admin) {
        await this.changeAntiFlood(id_group, false, 0, 0);
        return true;
      }

      const chave = `${id_group}_${remetente}`;
      const now = Date.now();
      const intervalo = dataBd.antiflood.intervalo * 1000;
      const max = dataBd.antiflood.max;

      let dados = this.floodControl.get(chave);

      const advertirUsuario = async () => {
        if (!dataBd.admins.includes(remetente)) {
          await userController.changeWarning(remetente, 1);
          const advertencia = await userController.getUserWarning(remetente);

          await sock.sendTextWithMentions(
            id_chat,
            criarTexto(
              comandos_info.grupo.aflood.msgs.advertido,
              remetente.replace("@s.whatsapp.net", ""),
              advertencia.toString(),
            ),
            [remetente],
          );

          if (advertencia >= 3) {
            await sock.removerParticipant(id_group, remetente);
            await sock.sendTextWithMentions(
              id_chat,
              criarTexto(
                comandos_info.outros.resposta_ban,
                remetente.replace("@s.whatsapp.net", ""),
                comandos_info.grupo.aflood.msgs.motivo,
                botInfo.number_bot!.replace("@s.whatsapp.net", ""),
              ),
              [remetente, botInfo.number_bot!],
            );
            this.floodControl.delete(chave);
            await userController.resetWarn(remetente);
          }
        }
      };

      if (!dados || now > dados.expiresAt) {
        this.floodControl.set(chave, { count: 0, expiresAt: now + intervalo });
      } else {
        if (dados.punido) {
          await advertirUsuario();
          return false;
        }

        dados.count++;
        if (dados.count >= max) {
          dados.punido = true;
          this.floodControl.set(chave, dados);
          await advertirUsuario();
          return false;
        } else {
          this.floodControl.set(chave, dados);
        }
      }

      return true;
    } catch (err: any) {
      err.message = `antiFlood - ${err.message}`;
      console.log(err, "ANTI-FLOOD");
      return true;
    }
  }
}
