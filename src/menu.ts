import dotenv from 'dotenv';
dotenv.config();

const nomeBot = process.env.NOME_BOT ?? 'Bot';
const nomeAdm = process.env.NOME_ADMINISTRADOR ?? 'Administrador';

interface MenuFunction {
    (): string;
}

interface GroupMenuFunction {
    (isGroupAdmin: boolean): string;
}

const menu: {
    menuPrincipal: MenuFunction;
    menuFigurinhas: MenuFunction;
    menuInfoSuporte: MenuFunction;
    menuDownload: MenuFunction;
    menuUtilidades: MenuFunction;
    menuGrupo: GroupMenuFunction;
    menuDiversao: GroupMenuFunction;
    menuAdmin: MenuFunction;
} = {
    menuPrincipal: () => {
        return `__| ☾ *🤖 ${nomeBot.trim() ?? 'Nome Bot'}®* ☽ 
|
|>---- ☾ 🤖 *MENU PRINCIPAL* 🤖☽
|
|- Digite um dos comandos abaixo:
|
|- *${process.env.PREFIX}menu* 0 -> Informação
|- *${process.env.PREFIX}menu* 1 -> Figurinhas
|- *${process.env.PREFIX}menu* 2 -> Utilidades
|- *${process.env.PREFIX}menu* 3 -> Downloads
|- *${process.env.PREFIX}menu* 4 -> Grupo
|- *${process.env.PREFIX}menu* 5 -> Diversão
|
╰╼❥ ${nomeBot.trim()}® by *${nomeAdm.trim()}*`;
    },

    menuFigurinhas: () => {
        return `__| ☾ *🤖 ${nomeBot.trim()}®* ☽ 
|
|>- Guia : *${process.env.PREFIX}comando* guia
|
|>---- ☾ 🖼️ *FIGURINHAS* 🖼️☽
|
|- *${process.env.PREFIX}s* - Transfome uma IMAGEM em sticker.
|- *${process.env.PREFIX}s* 1 - Transfome uma IMAGEM em sticker circular.
|- *${process.env.PREFIX}sgif* - Transforme um VIDEO/GIF em sticker.
|- *${process.env.PREFIX}sgif* 1 - Transforme um VIDEO/GIF em sticker (Sem corte).
|- *${process.env.PREFIX}sgif* 2 - Transforme um VIDEO/GIF em sticker circular.
|- *${process.env.PREFIX}simg* - Transforme um STICKER em foto.
|- *${process.env.PREFIX}tps* - Transforme um TEXTO em sticker.
|- *${process.env.PREFIX}atps* - Transforme um TEXTO em sticker animado.
|- *${process.env.PREFIX}ssf* - Transforme uma IMAGEM em sticker sem fundo.
|
╰╼❥ ${nomeBot.trim()}® by *${nomeAdm.trim()}*`;
    },

    menuInfoSuporte: () => {
        return `__| ☾ *🤖 ${nomeBot.trim()}®* ☽ 
|
|>- Guia : *${process.env.PREFIX}comando* guia
|
|>---- ☾ ❓ *INFO/SUPORTE* ❓☽
|
|- *${process.env.PREFIX}info* - Informações do bot e contato do dono.
|- *${process.env.PREFIX}reportar* [mensagem] - Reporte um problema para o dono.
|- *${process.env.PREFIX}meusdados* - Exibe seus dados de uso .
|
╰╼❥ ${nomeBot.trim()}® by *${nomeAdm.trim()}*`;
    },

    menuDownload: () => {
        return `__| ☾ *🤖 ${nomeBot.trim()}®* ☽ 
|
|>- Guia : *${process.env.PREFIX}comando* guia
|
|>---- ☾ 📥 *DOWNLOADS* 📥☽
|
|- *${process.env.PREFIX}play* [nome-musica] - Faz download de uma música e envia.
|- *${process.env.PREFIX}yt* [nome-video] - Faz download de um video do Youtube e envia.
|- *${process.env.PREFIX}fb* [link-post] - Faz download de um video do Facebook e envia.
|- *${process.env.PREFIX}ig* [link-post] - Faz download de um video/foto do Instagram e envia.
|- *${process.env.PREFIX}img* [tema-imagem] - Faz download de uma imagem e envia.
|
╰╼❥ ${nomeBot.trim()}® by *${nomeAdm.trim()}*`;
    },

    menuUtilidades: () => {
        return `__| ☾ *🤖 ${nomeBot.trim()}®* ☽
|
|>- Guia : *${process.env.PREFIX}comando* guia
|
|>---- ☾ ⚒️ *UTILITÁRIOS* ⚒️☽
|
|- *${process.env.PREFIX}voz* [idioma] [mensagem] - Transforma texto em audio.
|- *${process.env.PREFIX}qualmusica* - Responda um audio/video para identificar a música.
|- *${process.env.PREFIX}pesquisa* [tema] - Faz uma rápida pesquisa na internet.
|- *${process.env.PREFIX}clima* [cidade] - Mostra a temperatura atual.
|- *${process.env.PREFIX}noticias* - Obtem noticias atuais.
|
╰╼❥ ${nomeBot.trim()}® by *${nomeAdm.trim()}*`;
    },

    menuGrupo: isGroupAdmin => {
        if (isGroupAdmin) {
            return `__| ☾ *🤖 ${nomeBot.trim()}®* ☽ 
|
|>- Guia : *${process.env.PREFIX}comando* guia
|
|>---- ☾ 👨‍👩‍👧‍👦 *GRUPO* 👨‍👩‍👧‍👦☽ 
|
|-- ☾ GERAL ☽
|
|- *${process.env.PREFIX}status* - Vê os recursos ligados/desligados.
|- *${process.env.PREFIX}regras* - Exibe a descrição do grupo com as regras.
|- *${process.env.PREFIX}adms* - Lista todos administradores.
|- *${process.env.PREFIX}fotogrupo* - Altera foto do grupo
|- *${process.env.PREFIX}mt* [mensagem] - Marca todos MEMBROS/ADMINS com uma mensagem.
|- *${process.env.PREFIX}mm* [mensagem] - Marca os MEMBROS com uma mensagem.
|- *${process.env.PREFIX}dono* - Mostra dono do grupo.
|
|-- ☾ CONTROLE DE ATIVIDADE ☽
|
|- *${process.env.PREFIX}contador* - Liga/desliga o contador de atividade (Mensagens).
|- *${process.env.PREFIX}atividade* @marcarmembro - Mostra a atividade do usuário no grupo. 
|- *${process.env.PREFIX}alterarcont* [quantidade] @membro - Altera a quantidade de mensagens de um membro.
|- *${process.env.PREFIX}imarcar* 1-50 - Marca todos os inativos com menos de 1 até 50 mensagens.
|- *${process.env.PREFIX}ibanir* 1-50 - Bane todos os inativos com  menos de 1 até 50 mensagens.
|- *${process.env.PREFIX}topativos* 1-50 - Marca os membros mais ativos em um ranking de 1-50 pessoas.
|
|-- ☾ BLOQUEIO DE COMANDOS ☽ 
|
|- *${process.env.PREFIX}bcmd* [comando1 comando2 etc] - Bloqueia os comandos escolhidos no grupo.
|- *${process.env.PREFIX}dcmd* [comando1 comando2 etc] - Desbloqueia os comandos escolhidos no grupo.
|
|-- ☾ LISTA NEGRA ☽ 
|
|- *${process.env.PREFIX}blista* +55 (21) 9xxxx-xxxx - Adiciona o número na lista negra do grupo.
|- *${process.env.PREFIX}dlista* +55 (21) 9xxxx-xxxx - Remove o número na lista negra do grupo.
|- *${process.env.PREFIX}listanegra* - Exibe a lista negra do grupo.
|
|-- ☾ RECURSOS ☽ 
|
|- *${process.env.PREFIX}mutar* - Ativa/desativa o uso de comandos.
|- *${process.env.PREFIX}autosticker* - Ativa/desativa a criação automática de stickers.
|- *${process.env.PREFIX}alink* - Ativa/desativa o anti-link.
|- *${process.env.PREFIX}bv* - Ativa/desativa o bem-vindo.
|- *${process.env.PREFIX}afake* - Ativa/desativa o anti-fake.
|- *${process.env.PREFIX}aflood* - Ativa/desativa o anti-flood.
|
|-- ☾ ADMINISTRATIVO ☽
|
|- *${process.env.PREFIX}add* +55 (21) 9xxxx-xxxx - Adiciona ao grupo.
|- *${process.env.PREFIX}ban* @marcarmembro - Bane do grupo.
|- *${process.env.PREFIX}f* - Abre/fecha o grupo.
|- *${process.env.PREFIX}promover* @marcarmembro - Promove a ADM.
|- *${process.env.PREFIX}rebaixar* @marcaradmin - Rebaixa a MEMBRO.
|- *${process.env.PREFIX}link* - Exibe o link do grupo.
|- *${process.env.PREFIX}rlink* - Redefine o link do grupo.
|- *${process.env.PREFIX}apg* - Apaga mensagem do BOT.
|- *${process.env.PREFIX}bantodos* - Bane todos os membros.
|
|-- ☾ ETC.. ☽
|
|- *${process.env.PREFIX}roletarussa* - Expulsa um membro aleatório do grupo.
|
╰╼❥ ${nomeBot.trim()}® by *${nomeAdm.trim()}*`;
        } else {
            return `__| ☾ *🤖 ${nomeBot.trim()}®* ☽ 
|
|>- Guia : *${process.env.PREFIX}comando* guia
|
|>---- ☾ 👨‍👩‍👧‍👦 *GRUPO* 👨‍👩‍👧‍👦☽
|
|-- ☾ GERAL ☽
|- *${process.env.PREFIX}regras* - Exibe a descrição do grupo com as regras.
|- *${process.env.PREFIX}adms* - Lista todos administradores.
|- *${process.env.PREFIX}dono* - Mostra dono do grupo.
|
╰╼❥ ${nomeBot.trim()}® by *${nomeAdm.trim()}*`;
        }
    },

    menuDiversao: isGroup => {
        if (isGroup) {
            return `__| ☾ *🤖 ${nomeBot.trim()}®* ❣ 
|
|>- Guia : *${process.env.PREFIX}comando* guia
|
|>---- ☾ 🧩 *DIVERSÃO/OUTROS* ☽
|
|- *${process.env.PREFIX}caracoroa* - Decide no cara ou coroa.
|- *${process.env.PREFIX}ppt* [pedra, papel, tesoura] - Pedra, papel ou tesoura.
|- *${process.env.PREFIX}viadometro* - Mede o nível de viadagem de alguma pessoa.
|- *${process.env.PREFIX}casal* - Seleciona aleatoriamente um casal.
|- *${process.env.PREFIX}gadometro* - Mencione um membro ou responda ele para descobrir.
|- *${process.env.PREFIX}top5* - Mostra o top 5 de pessoas mais ativas no bot.
|
╰╼❥ ${nomeBot.trim()}® by *${nomeAdm.trim()}*`;
        } else {
            return `__| ☾ *🤖 ${nomeBot.trim()}®* ❣ 
|
|>- Guia : *${process.env.PREFIX}comando* guia
|
|>---- ☾ 🧩 *DIVERSÃO/OUTROS* ☽
|
|- *${process.env.PREFIX}viadometro* - Mede o nível de viadagem de alguma pessoa.
|- *${process.env.PREFIX}casal* - Seleciona aleatoriamente um casal.
|- *${process.env.PREFIX}gadometro* - Mencione um membro ou responda ele para descobrir.
|- *${process.env.PREFIX}chance* - Calcula a chance de algo acontecer.
|- *${process.env.PREFIX}bafometro* - Mede o nível de álcool de uma pessoa.
|
╰╼❥ ${nomeBot.trim()}® by *${nomeAdm.trim()}*`;
        }
    },

    //     menuCreditos: () => {
    //         return `__| ☾ *🤖 ${nomeBot.trim()}®* ☽
    // |
    // |>- Guia : *${process.env.PREFIX}comando* guia
    // |
    // |>---- ☾ 💳 *CRÉDITOS* 💳☽
    // |
    // |- *${process.env.PREFIX}doar* - Ajude o BOT com uma pequena doação.
    // |- *${process.env.PREFIX}dev* - Contato com o desenvolvedor.
    // |
    // ╰╼❥ ${nomeBot.trim()}® by *${nomeAdm.trim()}*`;
    //     },

    menuAdmin: () => {
        return `__| ☾ *🤖 ${nomeBot.trim()}®* ☽ 
|
|>---- ☾ 👑 *ADMINISTRAÇÃO* 👑☽
|
|- *${process.env.PREFIX}adicionar* +55 (21) 9xxxx-xxxx - Adiciona ao grupo.
|- *${process.env.PREFIX}remover* @marcarmembro - Remove do grupo.
|- *${process.env.PREFIX}promover* @marcarmembro - Promove a ADM.
|- *${process.env.PREFIX}rebaixar* @marcaradmin - Rebaixa a MEMBRO.
|
╰╼❥ ${nomeBot.trim()}® by *${nomeAdm.trim()}*`;
    },
};

export default menu;
