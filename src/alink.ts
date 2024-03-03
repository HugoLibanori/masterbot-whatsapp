import { Client } from 'whatsapp-web.js';
import { consoleErro } from './util';
import db from './dataBase';
import { criarTexto, isAdminGroup } from '../src/util';
import msgs_texto from '../src/msgs';

export default class AntiLink {
    async antiLink(client: Client, message: any) {
        try {
            const { body, from, author } = message;
            const dadosGrupo = await message.getChat();
            const isGroup = dadosGrupo.isGroup;

            if (isGroup) {
                const al_info = await db.obterGrupo(from);

                if (al_info.antilink.status) {
                    const botNumber = client.info.wid._serialized;
                    const dadosGrupoBot = isGroup
                        ? dadosGrupo.participants
                              .filter((isAdmin: { isAdmin: boolean }) => isAdmin.isAdmin)
                              .map((admin: { id: { _serialized: string } }) => admin.id._serialized)
                        : [];
                    const isBotGroupAdmin = isGroup ? dadosGrupoBot.includes(botNumber) : false;
                    const dadosAdmin = isGroup ? await dadosGrupo.groupMetadata.participants : '';
                    const isGroupAdmins: boolean = isGroup ? isAdminGroup(author, dadosAdmin) : false;

                    if (!isBotGroupAdmin) {
                        await db.alterarAntiLink(from, false);
                    } else {
                        const mensagem = body || '';

                        // LINKS AO TODO
                        const isUrl = new RegExp(
                            /(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?/gim,
                        );
                        const links_gerais = mensagem.match(isUrl) ? mensagem.match(isUrl)!.length : 0;
                        if (links_gerais === 0) return true;
                        // FILTROS
                        let links_permitidos_qtd = 0;

                        if (al_info.antilink.filtros.youtube) {
                            const isYoutube = new RegExp(
                                /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/[^\/\n\s]+\/|(?:youtu\.be\/))([^\s]+)/gi,
                            );
                            const links_youtube_qtd = mensagem.match(isYoutube) ? mensagem.match(isYoutube)!.length : 0;
                            links_permitidos_qtd += links_youtube_qtd;
                        }

                        if (al_info.antilink.filtros.whatsapp) {
                            const isWhatsapp = new RegExp(/(?:https?:\/\/(?:chat\.whatsapp\.com|wa\.me)|chat\.whatsapp\.com|wa\.me)\//gi);
                            const links_whatsapp_qtd = mensagem.match(isWhatsapp) ? mensagem.match(isWhatsapp)!.length : 0;
                            links_permitidos_qtd += links_whatsapp_qtd;
                        }

                        if (al_info.antilink.filtros.instagram) {
                            const isInstagram = new RegExp(/(?:^|)(https?:\/\/www\.instagram\.com\/\w+\/[^\s]+)(?=\s|$)/gi);
                            const links_instagram_qtd = mensagem.match(isInstagram) ? mensagem.match(isInstagram)!.length : 0;
                            links_permitidos_qtd += links_instagram_qtd;
                        }

                        if (al_info.antilink.filtros.facebook) {
                            const isFacebook = new RegExp(
                                /(?:^|)(https?:\/\/www\.(mbasic.facebook|m\.facebook|facebook|fb)\.(com|me)\/\w+\/[^\s]+)(?=\s|$)/gi,
                            );
                            const links_facebook_qtd = mensagem.match(isFacebook) ? mensagem.match(isFacebook)!.length : 0;
                            links_permitidos_qtd += links_facebook_qtd;
                        }
                        const nomeBot = process.env.NOME_BOT || 'BOT';
                        const mentions: any[] = [];
                        mentions.push(author);

                        //VERIFICAÇÃO DOS LINKS E BANIMENTO
                        if (links_permitidos_qtd !== links_gerais && !isGroupAdmins) {
                            await dadosGrupo.removeParticipants([author]);
                            await client.sendMessage(
                                from,
                                criarTexto(
                                    msgs_texto.geral.resposta_ban,
                                    author.replace('@c.us', ''),
                                    msgs_texto.grupo.antilink.motivo,
                                    nomeBot,
                                ),
                                { mentions },
                            );
                            await message.delete(true);
                            return false;
                        }
                    }
                }
            }
            return true;
        } catch (err: any) {
            consoleErro(err.message, 'ANTI-LINK');
            return false;
        }
    }
}
