import { Client } from 'whatsapp-web.js';
import { removerNegritoComando, criarTexto } from '../src/util';
import db from '../src/dataBase';
import menu from '../src/menu';
import msgs_texto from '../src/msgs';
import { botInfo } from '../src/bot';

class Info {
    async info(client: Client, message: any, abrirMenu: boolean) {
        try {
            const { body, from } = message;
            const { author, notifyName } = message._data;
            let command: string = body.split(' ')[0];
            const args: string[] = body.split(' ');
            command = removerNegritoComando(command).toLowerCase();
            const dadosGrupo = await message.getChat(from);
            const isGroup = dadosGrupo.isGroup;
            const dadosAdmin = isGroup ? await dadosGrupo.groupMetadata.participants : [];
            const isGroupAdmins: boolean = dadosAdmin.map((isAdmin: { id: { isAdmin: boolean } }) => {
                return isAdmin.id.isAdmin;
            });
            if (abrirMenu) command = `${process.env.PREFIX}menu`;

            if (command === `${process.env.PREFIX}menu`) {
                const dadosUsuario = isGroup ? await db.obterUsuario(author) : await db.obterUsuario(from);
                const tipoUsuario = dadosUsuario.tipo;
                const maxComandosDia = dadosUsuario.max_comandos_dia || 'Sem limite';
                const tipoUsuarioTexto = msgs_texto.tipos[tipoUsuario as keyof typeof msgs_texto.tipos];
                let dadosResposta = '';
                const nomeUsuario = notifyName;

                if (botInfo.botInfo().limite_diario.status) {
                    dadosResposta = criarTexto(
                        msgs_texto.info.ajuda.resposta_limite_diario,
                        nomeUsuario,
                        dadosUsuario.comandos_dia.toString(),
                        maxComandosDia.toString(),
                        tipoUsuarioTexto,
                    );
                } else {
                    dadosResposta = criarTexto(msgs_texto.info.ajuda.resposta_comum, nomeUsuario, tipoUsuarioTexto);
                }
                dadosResposta += `═════════════════\n`;

                if (args.length === 1) {
                    const menuResposta = menu.menuPrincipal();
                    await client.sendMessage(from, dadosResposta + menuResposta);
                } else {
                    const usuarioOpcao = args[1];
                    let menuResposta = menu.menuPrincipal();

                    switch (usuarioOpcao) {
                        case '0':
                            menuResposta = menu.menuInfoSuporte();
                            break;
                        case '1':
                            menuResposta = menu.menuFigurinhas();
                            break;
                        case '2':
                            menuResposta = menu.menuUtilidades();
                            break;
                        case '3':
                            menuResposta = menu.menuDownload();
                            break;
                        case '4':
                            if (isGroup) {
                                menuResposta = menu.menuGrupo(isGroupAdmins);
                            } else {
                                return await message.reply(msgs_texto.permissao.grupo);
                            }
                            break;
                        case '5':
                            menuResposta = menu.menuDiversao(isGroup);
                            break;
                    }

                    await client.sendMessage(from, dadosResposta + menuResposta);
                }
            }
        } catch (err: any) {
            console.log(err);
        }
    }
}

export default Info;
