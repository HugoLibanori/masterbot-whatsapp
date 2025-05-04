import { GroupMetadata } from "baileys";
import { Grupo } from "../interfaces/interfaces.js";
import { Socket } from "../bot/socket/Socket.js";

export async function convertGroupMetadataToGrupo(
  grupo: GroupMetadata,
  socket: Socket,
): Promise<Grupo> {
  const participantesGrupo = await socket.getMembersGroupMetadata(grupo);
  const adminsGrupo = await socket.getAdminsGroupMetadata(grupo);

  return {
    id_grupo: grupo.id,
    nome: grupo.subject,
    descricao: grupo.desc ?? "",
    participantes: participantesGrupo,
    admins: adminsGrupo,
    dono: grupo.owner ?? "",
    restrito_msg: grupo.announce ?? false,
    mutar: false,
    bemvindo: { status: false, msg: "" },
    antifake: { status: false, ddi_liberados: [] },
    antilink: {
      status: false,
      filtros: {
        instagram: false,
        youtube: false,
        facebook: false,
      },
    },
    antiporno: false,
    antiflood: {
      status: false,
      max: 0,
      intervalo: 0,
      msgs: [],
    },
    autosticker: false,
    contador: {
      status: false,
      inicio: "",
    },
    block_cmds: [],
    lista_negra: [],
  };
}
