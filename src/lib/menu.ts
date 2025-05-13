import { Bot } from "../interfaces/interfaces";

export const menuPrincipal = (botInfo: Partial<Bot>) => {
  const { name: nome_bot, name_admin: nome_adm, prefix: prefixo } = botInfo;
  return `
╒═══════════════╕
│  ⬡ CENTRAL DE COMANDOS    │
╘═══════════════╛
╒═══════════════╕

➤ *\`${prefixo}menu 1\`* - 🖼️ _Figurinhas_

➤ *\`${prefixo}menu 2\`* - ⚒️ _Utilidades_

➤ *\`${prefixo}menu 3\`* - 📥 _Downloads_

➤ *\`${prefixo}menu 4\`* - 👨‍👩‍👧‍👦 _Grupo_

➤ *\`${prefixo}menu 5\`* - 🕹️ _Diversão/Jogos_

╘═══════════════╛
⧖───────────────⧗
╰╼❥ ⌬ Dev: ${nome_adm?.trim()} | *©${nome_bot?.trim()}™*`;
};

export const menuFigurinhas = (botInfo: Partial<Bot>) => {
  const { name: nome_bot, name_admin: nome_adm, prefix: prefixo } = botInfo;
  return `
➤ ❔ Para saber como usar o comando: *\`${prefixo}s guia\`*

╒═══════════════╕
│    ⟪ 🖼️ MENU FIGURINHAS ⟫     │
╘═══════════════╛
╒═══════════════╕

➤ *\`${prefixo}s\`* - _Transforme uma IMAGEM/VIDEO em *sticker*_

➤ *\`${prefixo}s 1\`* - _Recorta um VIDEO/GIF_

➤ *\`${prefixo}s 2\`* - _Sticker circular (IMAGEM/VIDEO)_

➤ *\`${prefixo}snome pack, autor\`* - _Renomeia o sticker_

➤ *\`${prefixo}simg\`* - _Sticker → Foto_

➤ *\`${prefixo}ssf\`* - _Sticker sem fundo_

➤ *\`${prefixo}emojimix 💩+😀\`* - _2 Emojis → Sticker_

➤ *\`${prefixo}emojimg 😀\`* - _Emoji → Sticker_

➤ *\`${prefixo}tps texto\`* - _Texto → Sticker_

➤ *\`${prefixo}atps texto\`* - _Texto → Sticker animado_

➤ *\`${prefixo}smeme textoCima, textoBaixo\`* - _Imagem com texto em sticker_

➤ *\`${prefixo}nomepack pack\`* - _Define nome do pack_

➤ *\`${prefixo}nomeautor autor\`* - _Define autor do sticker_

╘═══════════════╛
⧖───────────────⧗
╰╼❥ ⌬ Dev: ${nome_adm?.trim()} | *© ${nome_bot?.trim()}™*`;
};

// export const menuInfoSuporte = (botInfo: Partial<Bot>) => {
//   const { name: nome_bot, name_admin: nome_adm, prefix: prefixo } = botInfo;
//   return `
// ➤ ❔ Para saber como usar o comando: *\`${prefixo}info guia\`*

// ╒═══════════════╕
// │  ⟪ ❓ MENU INFO/SUPORTE ⟫  │
// ╘═══════════════╛
// ╒═══════════════╕

// ➤ *\`${prefixo}info\`* - _Informações do bot e contato do dono_

// ➤ *\`${prefixo}reportar mensagem\`* - _Reporte um problema para o dono_

// ➤ *\`${prefixo}meusdados\`* - _Exibe seus dados de uso_

// ╘═══════════════╛
// ⧖───────────────⧗
// ╰╼❥ ⌬ Dev: ${nome_adm?.trim()} | *© ${nome_bot?.trim()}™*`;
// };

export const menuDownload = (botInfo: Partial<Bot>) => {
  const { name: nome_bot, name_admin: nome_adm, prefix: prefixo } = botInfo;
  return `
➤ ❔ Para saber como usar o comando: *\`${prefixo}play guia\`*

╒═══════════════╕
│   ⟪ 📥 MENU DOWNLOADS ⟫    │
╘═══════════════╛
╒═══════════════╕

➤ *\`${prefixo}play nome\`* - _Baixa uma música e envia_

➤ *\`${prefixo}yt nome\`* - _Baixa um vídeo do YouTube_

➤ *\`${prefixo}fb link\`* - _Baixa um vídeo do Facebook_

➤ *\`${prefixo}ig link\`* - _Baixa vídeo/foto do Instagram_

➤ *\`${prefixo}img tema\`* - _Baixa uma imagem com o tema_

╘═══════════════╛
⧖───────────────⧗
╰╼❥ ⌬ Dev: ${nome_adm?.trim()} | *© ${nome_bot?.trim()}™*`;
};

export const menuUtilidades = (botInfo: Partial<Bot>) => {
  const { name: nome_bot, name_admin: nome_adm, prefix: prefixo } = botInfo;
  return `
➤ ❔ Para saber como usar o comando: *\`${prefixo}voz guia\`*

╒═══════════════╕
│     ⟪ ⚒️ MENU UTILITÁRIOS ⟫    │
╘═══════════════╛
╒═══════════════╕

🔊 *AUDIO*

➤ *\`${prefixo}voz idioma texto\`* - _Texto → Áudio_

🖼️ *IMAGENS*

➤ *\`${prefixo}rbg\`* - _Remove fundo da imagem_

╘═══════════════╛
⧖───────────────⧗
╰╼❥ ⌬ Dev: ${nome_adm?.trim()} | *© ${nome_bot?.trim()}™*`;
};

export const menuGrupo = (admin: boolean, botInfo: Partial<Bot>) => {
  const { name: nome_bot, name_admin: nome_adm, prefix: prefixo } = botInfo;
  if (admin) {
    return `
➤ ❔ Para saber como usar o comando: *\`${prefixo}regras guia\`*

╒═══════════════╕
│            ⟪ 👨‍👩‍👧‍👦 GRUPO ⟫              │
╘═══════════════╛
╒═══════════════╕

╭━━━ 🛠️ *GERAL* ━━━╮

➤ *\`${prefixo}status\`* - _Vê os recursos ligados/desligados._

➤ *\`${prefixo}regras\`* - _Exibe a descrição do grupo com as regras._

➤ *\`${prefixo}adms\`* - _Lista todos administradores._

➤ *\`${prefixo}fotogrupo\`* - _Altera foto do grupo_

➤ *\`${prefixo}mt mensagem\`* - _Marca todos MEMBROS/ADMINS com uma mensagem._

➤ *\`${prefixo}mm mensagem\`* - _Marca os MEMBROS com uma mensagem._

➤ *\`${prefixo}hidetag\`* - _Marca os MEMBROS/ADMINS com a mensagem de IMAGEM/VIDEO/STICKER enviada ou respondida._

➤ *\`${prefixo}dono\`* - _Mostra dono do grupo._

➤ *\`${prefixo}fixar\`* - _Fixa uma mensagem do grupo._

➤ *\`${prefixo}desfixar\`* - _Desfixa uma mensagem fixada do grupo._
╰━━━━━━━━━━━━━╯

╭🎚️ *CONTROLE DE ATIVIDADE*╮

➤ *\`${prefixo}contador\`* - _Liga/desliga o contador de atividade (Mensagens)._

➤ *\`${prefixo}atividade @marcarmembro\`* - _Mostra a atividade do usuário no grupo._

➤ *\`${prefixo}imarcar 1-50\`* - _Marca todos os inativos com menos de 1 até 50 mensagens._

➤ *\`${prefixo}ibanir 1-50\`* - _Bane todos os inativos com  menos de 1 até 50 mensagens._

➤ *\`${prefixo}topativos 1-50\`* - _Marca os membros mais ativos em um ranking de 1-50 pessoas._
╰━━━━━━━━━━━━━╯

╭🚫 *BLOQUEIO DE COMANDOS*╮

➤ *\`${prefixo}bcmd [comando1 comando2 etc]\`* - _Bloqueia os comandos escolhidos no grupo._

➤ *\`${prefixo}dcmd [comando1 comando2 etc]\`* - _Desbloqueia os comandos escolhidos no grupo._
╰━━━━━━━━━━━━━╯

╭━━━ 🗒️ *LISTA NEGRA* ━━━╮

➤ *\`${prefixo}listanegra\`* - _Exibe a lista negra do grupo._

➤ *\`${prefixo}addlista +55 (21) 9xxxx-xxxx\`* - _Adiciona o número na lista negra do grupo._

➤ *\`${prefixo}remlista +55 (21) 9xxxx-xxxx\`* - _Remove o número na lista negra do grupo._
╰━━━━━━━━━━━━━╯

╭━━━ 🧰 *RECURSOS* ━━━╮

➤ *\`${prefixo}mutar\`* - _Ativa/desativa o uso de comandos._

➤ *\`${prefixo}autosticker\`** - _Ativa/desativa a criação automática de stickers._

➤ *\`${prefixo}alink\`* - _Ativa/desativa o anti-link._

➤ *\`${prefixo}aporno\`* - _Ativa/desativa o anti-porno._

➤ *\`${prefixo}bv\`* - _Ativa/desativa o bem-vindo._

➤ *\`${prefixo}afake\`* - _Ativa/desativa o anti-fake._

➤ *\`${prefixo}aflood\`* - _Ativa/desativa o anti-flood._
╰━━━━━━━━━━━━━╯

╭━⌨️ *ADMINISTRATIVO* ━╮

➤ *\`${prefixo}add +55 (21) 9xxxx-xxxx\`* - _Adiciona ao grupo._

➤ *\`${prefixo}ban @marcarmembro\`* - _Bane do grupo._

➤ *\`${prefixo}restrito\`* - _Abre/Restringe o grupo só para ADMS._

➤ *\`${prefixo}promover @marcarmembro\`* - _Promove a ADM._

➤ *\`${prefixo}rebaixar @marcaradmin\`* - _Rebaixa a MEMBRO._

➤ *\`${prefixo}link\`* - _Exibe o link do grupo._

➤ *\`${prefixo}rlink\`* - _Redefine o link do grupo._

➤ *\`${prefixo}apg\`* - _Apaga uma mensagem do grupo._

➤ *\`${prefixo}bantodos\`* - _Bane todos os membros._

➤ *\`${prefixo}advertir\`* - _Adverte um membro._

➤ *\`${prefixo}radvertencias\`* - _Reseta as advertências._
╰━━━━━━━━━━━━━╯

╘══════════════╛
⧖──────────────⧗
╰╼❥ ⌬ Dev: ${nome_adm?.trim()} | *© ${nome_bot?.trim()}™*`;
  } else {
    return `
➤ ❔ Para saber como usar o comando: *\`${prefixo}regras guia\`*

╒═══════════════╕
│     ⟪ 👨‍👩‍👧‍👦 GRUPO ⟫    │
╘═══════════════╛
╒═══════════════╕

╭━━━ 🛠️ *GERAL* ━━━╮

• *\`${prefixo}regras\`* - _Exibe a descrição do grupo com as regras._

• *\`${prefixo}adms\`* - _Lista todos administradores._

• *\`${prefixo}dono\`* - _Mostra dono do grupo._
╰━━━━━━━━━━━━━╯

╘══════════════╛
⧖──────────────⧗
╰╼❥ ⌬ Dev: ${nome_adm?.trim()} | *© ${nome_bot?.trim()}™*`;
  }
};

export const menuDiversao = (grupo: boolean, botInfo: Partial<Bot>) => {
  const { name: nome_bot, name_admin: nome_adm, prefix: prefixo } = botInfo;
  if (grupo) {
    return `
➤ ❔ Para saber como usar o comando: *\`${prefixo}simi guia\`*

╒═══════════════╕
│             ⟪ 🕹️ JOGOS ⟫               │
╘═══════════════╛
╒═══════════════╕

➤ *\`${prefixo}jogodavelha @adversário\`* - _Inicia um jogo da velha com um usuário do grupo._

╭━━━ 🧩 *DIVERSÃO* ━━━╮

➤ *\`${prefixo}simi frase\`* - _Recebe uma resposta do SimSimi._

➤ *\`${prefixo}viadometro\`* - _Mede o nível de viadagem de alguma pessoa._

➤ *\`${prefixo}casal\`* - _Seleciona aleatoriamente um casal._

➤ *\`${prefixo}gadometro\`* - _Mencione um membro ou responda ele para descobrir._

➤ *\`${prefixo}top5 tema\`* - _Ranking dos Top 5 com o tema que você escolher._

➤ *\`${prefixo}par @pessoa1 @pessoa2\`* - _Mede o nivel de compatibilidade entre 2 pessoas._

➤ *\`${prefixo}roletarussa\`* - _Expulsa um membro aleatório do grupo._
╰━━━━━━━━━━━━━╯

╘══════════════╛
⧖──────────────⧗
╰╼❥ ⌬ Dev: ${nome_adm?.trim()} | *© ${nome_bot?.trim()}™*`;
  } else {
    return `
➤ ❔ Para saber como usar o comando: *\`${prefixo}simi guia\`*

╒═══════════════╕
│             ⟪ 🕹️ JOGOS ⟫               │
╘═══════════════╛
╒═══════════════╕

╭━━━ 🧩 *DIVERSÃO* ━━━╮

➤ *\`${prefixo}simi\`* frase - _Recebe uma resposta do SimSimi._

╰━━━━━━━━━━━━━╯

╘══════════════╛
⧖──────────────⧗
╰╼❥ ⌬ Dev: ${nome_adm?.trim()} | *© ${nome_bot?.trim()}™*`;
  }
};

export const menuAdmin = (botInfo: Partial<Bot>) => {
  const { name: nome_bot, name_admin: nome_adm, prefix: prefixo } = botInfo;
  return `
╒═══════════════╕
│             ⟪ 👑 ADMIN ⟫               │
╘═══════════════╛
╒═══════════════╕

╭━ 🎨 *CUSTOMIZAÇÃO* ━╮

• *\`${prefixo}nomebot nome\`* - _Altera nome do bot e atualiza menus_

• *\`${prefixo}nomeadm nome\`* - _Altera nome do administrador e atualiza menus_

• *\`${prefixo}nomesticker nome\`* - _Altera nome do pacote de figurinhas_

• *\`${prefixo}prefixo simbolo\`* - _Altera o prefixo dos comandos_

• *\`${prefixo}fotobot\`* - _Altera foto do BOT_

╰━━━━━━━━━━━━━╯

╭━━━ 🛠️ *GERAL* ━━━╮

• *\`${prefixo}infobot\`* - _Informação completa do BOT._

• *\`${prefixo}bloquear @usuario\`*  - _Bloqueia o usuário mencionado._

• *\`${prefixo}desbloquear @usuario\`*  - _Desbloqueia o usuário mencionado._

• *\`${prefixo}listablock\`*  - _Lista todos os usuários bloqueados._

• *\`${prefixo}bcgrupos mensagem\`* - _Faz um anúncio com uma mensagem somente para os GRUPOS._
╰━━━━━━━━━━━━━╯

╭━━━ 👤 *USUÁRIOS* ━━━╮

• *\`${prefixo}verdados @usuario\`* - _Mostra os dados do usuario cadastrado no bot._

• *\`${prefixo}usuarios tipo\`* - _Mostra todos os usuários do tipo escolhido._

• *\`${prefixo}tipos\`* - _Mostra todos os tipos de usuário disponíveis._

• *\`${prefixo}novotipo tipo, titulo, comandos\`* - _Cria um novo tipo de usuário._

• *\`${prefixo}tipotitulo tipo, titulo\`* - _Altera o titulo de um tipo de usuário._

• *\`${prefixo}deltipo tipo\`* - _Deleta um tipo de usuário._

• *\`${prefixo}usuariotipo tipo @usuario\`* - _Muda o tipo de conta do usuário._

• *\`${prefixo}limpartipo tipo\`* - _Limpa todos os usuários desse tipo e transforma em usuarios comuns._

• *\`${prefixo}limparcomandos\`* - _Limpa os comandos de todos os usuários._
╰━━━━━━━━━━━━━╯

╭🚫 *BLOQUEIO DE COMANDOS*╮

• *\`${prefixo}bcmdglobal comando1 comando2\`* - _Bloqueia os comandos escolhidos globalmente._

• *\`${prefixo}dcmdglobal comando1 comando2\`* - _Desbloqueia os comandos escolhidos globalmente._
╰━━━━━━━━━━━━━╯

╭👤 *LIMITE DIÁRIO COMANDOS*╮

• *\`${prefixo}limitediario\`* - _Ativa/desativa o limite diario de comandos por dia de acordo com tipo de usuário._

• *\`${prefixo}tipocomandos tipo qtd-comandos\`* - _Muda o limite de comandos por dia de um tipo de usuário._

• *\`${prefixo}rtodos\`* - _Reseta os comandos diários de todos usuários._

• *\`${prefixo}r @usuario\`* - _Reseta os comandos diários de um usuário._
╰━━━━━━━━━━━━━╯

╭👤 *TAXA COMANDOS MINUTO*╮

• *\`${prefixo}taxacomandos qtd-comandos\`* - _Ativa/desativa a taxa de comandos por minuto._
╰━━━━━━━━━━━━━╯

╭━━━ 🎚️ *CONTROLE* ━━━╮

• *\`${prefixo}pvliberado\`* - _Ativa/desativa os comandos em mensagens privadas._

• *\`${prefixo}autostickerpv\`* - _Ativa/desativa a criação automática de stickers no privado._
╰━━━━━━━━━━━━━╯

╭━━━ 👨‍👩‍👧‍👦 *GRUPOS* ━━━╮

• *\`${prefixo}grupos\`* - _Mostra os grupos atuais._

• *\`${prefixo}linkgrupo numero\`* - _Mostra o link do grupo selecionado._

• *\`${prefixo}sair\`* - _Sai do grupo._

• *\`${prefixo}sairgrupos\`* - _Sai de todos os grupos._

• *\`${prefixo}entrargrupo link-grupo\`* - _BOT entra no grupo._

• *\`${prefixo}addgrupo link-grupo\`* - _Libera BOT para funcionamento no grupo._

• *\`${prefixo}removegrupo nome-grupo\`* - _Remove o BOT para funcionamento no grupo._

• *\`${prefixo}alterarexp link-grupo\`* - _Adiciona mais *30* dias a validade do bot._

• *\`${prefixo}oficialgrupo link(PV do bot)\`* - _Adiciona o grupo como oficial do bot._

• *\`${prefixo}statusverificados\`* - _Verifica os grupos permitidos para uso do BOT._

• *\`${prefixo}apis nome_api valor_apiKey\`* - _Adiciona apiKey de uma api._
╰━━━━━━━━━━━━━╯

╘══════════════╛
⧖──────────────⧗
╰╼❥ ⌬ Dev: ${nome_adm?.trim()} | *© ${nome_bot?.trim()}™*`;
};
