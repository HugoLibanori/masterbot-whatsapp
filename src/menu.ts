import dotenv from 'dotenv';
dotenv.config();

const nomeBot = process.env.NOME_BOT ?? 'Bot';
const nomeAdm = process.env.NOME_ADMINISTRADOR ?? 'Administrador';
const PREFIX = process.env.PREFIX || '!';

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
|- *${PREFIX}menu* 0 -> Informação
|- *${PREFIX}menu* 1 -> Figurinhas
|- *${PREFIX}menu* 2 -> Utilidades
|- *${PREFIX}menu* 3 -> Downloads
|- *${PREFIX}menu* 4 -> Grupo
|- *${PREFIX}menu* 5 -> Diversão
|
╰╼❥ ${nomeBot.trim()}® by *${nomeAdm.trim()}*`;
    },

    menuFigurinhas: () => {
        return `__| ☾ *🤖 ${nomeBot.trim()}®* ☽ 
|
|>- Guia : *${PREFIX}comando* guia
|
|>---- ☾ 🖼️ *FIGURINHAS* 🖼️☽
|
|- *${PREFIX}s* - Transfome uma IMAGEM em sticker.
|- *${PREFIX}s* 1 - Transfome uma IMAGEM em sticker circular.
|- *${PREFIX}sgif* - Transforme um VIDEO/GIF em sticker.
|- *${PREFIX}sgif* 1 - Transforme um VIDEO/GIF em sticker (Sem corte).
|- *${PREFIX}sgif* 2 - Transforme um VIDEO/GIF em sticker circular.
|- *${PREFIX}simg* - Transforme um STICKER em foto.
|- *${PREFIX}tps* - Transforme um TEXTO em sticker.
|- *${PREFIX}ssf* - Transforme uma IMAGEM em sticker sem fundo.
|- *${PREFIX}figurinhas* - Envia varias figurinhas para o grupo. obs: funciona só em grupos.
|- *${PREFIX}salvar* - Salva uma figurinha para ser enviada pelo comando *${PREFIX}figurinhas*.
|- *${PREFIX}figurinhas+18* - Envia varias figurinhas+18 para o usuário. obs: funciona só no privado.
|- *${PREFIX}salvar+18* - Salva uma figurinha+18 para ser enviada pelo comando *${PREFIX}figurinhas+18*.


|
╰╼❥ ${nomeBot.trim()}® by *${nomeAdm.trim()}*`;
    },

    menuInfoSuporte: () => {
        return `__| ☾ *🤖 ${nomeBot.trim()}®* ☽ 
|
|>- Guia : *${PREFIX}comando* guia
|
|>---- ☾ ❓ *INFO/SUPORTE* ❓☽
|
|- *${PREFIX}info* - Informações do bot e contato do dono.
|- *${PREFIX}reportar* [mensagem] - Reporte um problema para o dono.
|- *${PREFIX}meusdados* - Exibe seus dados de uso .
|
╰╼❥ ${nomeBot.trim()}® by *${nomeAdm.trim()}*`;
    },

    menuDownload: () => {
        return `__| ☾ *🤖 ${nomeBot.trim()}®* ☽ 
|
|>- Guia : *${PREFIX}comando* guia
|
|>---- ☾ 📥 *DOWNLOADS* 📥☽
|
|- *${PREFIX}play* [nome-musica] - Faz download de uma música e envia.
|- *${PREFIX}yt* [nome-video] - Faz download de um video do Youtube e envia.
|- *${PREFIX}fb* [link-post] - Faz download de um video do Facebook e envia.
|- *${PREFIX}ig* [link-post] - Faz download de um video/foto do Instagram e envia.
|- *${PREFIX}img* [tema-imagem] - Faz download de uma imagem e envia.
|
╰╼❥ ${nomeBot.trim()}® by *${nomeAdm.trim()}*`;
    },

    menuUtilidades: () => {
        return `__| ☾ *🤖 ${nomeBot.trim()}®* ☽
|
|>- Guia : *${PREFIX}comando* guia
|
|>---- ☾ ⚒️ *UTILITÁRIOS* ⚒️☽
|
|- *${PREFIX}voz* [idioma] [mensagem] - Transforma texto em audio.
|- *${PREFIX}pesquisa* [tema] - Faz uma rápida pesquisa na internet.
|- *${PREFIX}noticias* - Obtem noticias atuais.
|
╰╼❥ ${nomeBot.trim()}® by *${nomeAdm.trim()}*`;
    },

    menuGrupo: isGroupAdmin => {
        if (isGroupAdmin) {
            return `__| ☾ *🤖 ${nomeBot.trim()}®* ☽ 
|
|>- Guia : *${PREFIX}comando* guia
|
|>---- ☾ 👨‍👩‍👧‍👦 *GRUPO* 👨‍👩‍👧‍👦☽ 
|
|-- ☾ GERAL ☽
|
|- *${PREFIX}status* - Vê os recursos ligados/desligados.
|- *${PREFIX}regras* - Exibe a descrição do grupo com as regras.
|- *${PREFIX}adms* - Lista todos administradores.
|- *${PREFIX}fotogrupo* - Altera foto do grupo
|- *${PREFIX}mt* [mensagem] - Marca todos MEMBROS/ADMINS com uma mensagem.
|- *${PREFIX}mm* [mensagem] - Marca os MEMBROS com uma mensagem.
|- *${PREFIX}dono* - Mostra dono do grupo.
|
|-- ☾ CONTROLE DE ATIVIDADE ☽
|
|- *${PREFIX}contador* - Liga/desliga o contador de atividade (Mensagens).
|- *${PREFIX}atividade* @marcarmembro - Mostra a atividade do usuário no grupo. 
|- *${PREFIX}alterarcont* [quantidade] @membro - Altera a quantidade de mensagens de um membro.
|- *${PREFIX}imarcar* 1-50 - Marca todos os inativos com menos de 1 até 50 mensagens.
|- *${PREFIX}ibanir* 1-50 - Bane todos os inativos com  menos de 1 até 50 mensagens.
|- *${PREFIX}topativos* 1-50 - Marca os membros mais ativos em um ranking de 1-50 pessoas.
|
|-- ☾ BLOQUEIO DE COMANDOS ☽ 
|
|- *${PREFIX}bcmd* [comando1 comando2 etc] - Bloqueia os comandos escolhidos no grupo.
|- *${PREFIX}dcmd* [comando1 comando2 etc] - Desbloqueia os comandos escolhidos no grupo.
|
|-- ☾ LISTA NEGRA ☽ 
|
|- *${PREFIX}blista* +55 (21) 9xxxx-xxxx - Adiciona o número na lista negra do grupo.
|- *${PREFIX}dlista* +55 (21) 9xxxx-xxxx - Remove o número na lista negra do grupo.
|- *${PREFIX}listanegra* - Exibe a lista negra do grupo.
|
|-- ☾ RECURSOS ☽ 
|
|- *${PREFIX}mutar* - Ativa/desativa o uso de comandos.
|- *${PREFIX}autosticker* - Ativa/desativa a criação automática de stickers.
|- *${PREFIX}alink* - Ativa/desativa o anti-link.
|- *${PREFIX}bv* - Ativa/desativa o bem-vindo.
|- *${PREFIX}afake* - Ativa/desativa o anti-fake.
|
|-- ☾ ADMINISTRATIVO ☽
|
|- *${PREFIX}add* +55 (21) 9xxxx-xxxx - Adiciona ao grupo.
|- *${PREFIX}ban* @marcarmembro - Bane do grupo.
|- *${PREFIX}f* - Abre/fecha o grupo.
|- *${PREFIX}promover* @marcarmembro - Promove a ADM.
|- *${PREFIX}rebaixar* @marcaradmin - Rebaixa a MEMBRO.
|- *${PREFIX}link* - Exibe o link do grupo.
|- *${PREFIX}rlink* - Redefine o link do grupo.
|- *${PREFIX}apg* - Apaga mensagem.
|- *${PREFIX}bantodos* - Bane todos os membros.
|
|
╰╼❥ ${nomeBot.trim()}® by *${nomeAdm.trim()}*`;
        } else {
            return `__| ☾ *🤖 ${nomeBot.trim()}®* ☽ 
|
|>- Guia : *${PREFIX}comando* guia
|
|>---- ☾ 👨‍👩‍👧‍👦 *GRUPO* 👨‍👩‍👧‍👦☽
|
|-- ☾ GERAL ☽
|- *${PREFIX}regras* - Exibe a descrição do grupo com as regras.
|- *${PREFIX}adms* - Lista todos administradores.
|- *${PREFIX}dono* - Mostra dono do grupo.
|
╰╼❥ ${nomeBot.trim()}® by *${nomeAdm.trim()}*`;
        }
    },

    menuDiversao: isGroup => {
        if (isGroup) {
            return `__| ☾ *🤖 ${nomeBot.trim()}®* ❣ 
|
|>- Guia : *${PREFIX}comando* guia
|
|>---- ☾ 🧩 *DIVERSÃO/OUTROS* ☽
|
|- *${PREFIX}viadometro* - Mede o nível de viadagem de alguma pessoa.
|- *${PREFIX}gadometro* - Mencione um membro ou responda ele para descobrir.
|- *${PREFIX}bafometro* - Mede o nível de álcool de uma pessoa.
|
╰╼❥ ${nomeBot.trim()}® by *${nomeAdm.trim()}*`;
        } else {
            return `__| ☾ *🤖 ${nomeBot.trim()}®* ❣ 
|
|>- Guia : *${PREFIX}comando* guia
|
|>---- ☾ 🧩 *DIVERSÃO/OUTROS* ☽
|
|- *${PREFIX}viadometro* - Mede o nível de viadagem de alguma pessoa.
|- *${PREFIX}gadometro* - Mencione um membro ou responda ele para descobrir.
|- *${PREFIX}bafometro* - Mede o nível de álcool de uma pessoa.
|
╰╼❥ ${nomeBot.trim()}® by *${nomeAdm.trim()}*`;
        }
    },

    //     menuCreditos: () => {
    //         return `__| ☾ *🤖 ${nomeBot.trim()}®* ☽
    // |
    // |>- Guia : *${PREFIX}comando* guia
    // |
    // |>---- ☾ 💳 *CRÉDITOS* 💳☽
    // |
    // |- *${PREFIX}doar* - Ajude o BOT com uma pequena doação.
    // |- *${PREFIX}dev* - Contato com o desenvolvedor.
    // |
    // ╰╼❥ ${nomeBot.trim()}® by *${nomeAdm.trim()}*`;
    //     },

    menuAdmin: () => {
        return `__| ☾ *🤖 ${nomeBot.trim()}®* ☽ 
|
|>---- ☾ 👑 *ADMINISTRAÇÃO* 👑☽
|
|-- ☾ GERAL ☽
|
|- *${PREFIX}infocompleta* - Informação completa do BOT.
|- *${PREFIX}bloquear* @usuario  - Bloqueia o usuário mencionado.
|- *${PREFIX}desbloquear* @usuario  - Desbloqueia o usuário mencionado.
|- *${PREFIX}listablock*  - Lista todos os usuários bloqueados.
|- *${PREFIX}fotobot* - Altera foto do BOT
|- *${PREFIX}bctodos* [mensagem] - Faz um anúncio com uma mensagem para todos os CHATS.
|- *${PREFIX}bcgrupos* [mensagem] - Faz um anúncio com uma mensagem somente para os GRUPOS.
|- *${PREFIX}bccontatos* [mensagem] - Faz um anúncio com uma mensagem somente para os CONTATOS.
|
|-- ☾ BLOQUEIO DE COMANDOS ☽ 
|
|- *${PREFIX}bcmdglobal* [comando1 comando2 etc] - Bloqueia os comandos escolhidos globalmente.
|- *${PREFIX}dcmdglobal* [comando1 comando2 etc] - Desbloqueia os comandos escolhidos globalmente.
|
|-- ☾ BOT USUÁRIOS ☽
|
|- *${PREFIX}tipos* - Mostra todos os tipos de usuário disponíveis.
|- *${PREFIX}alterartipo* [tipo] @usuario - Muda o tipo de conta do usuário.
|- *${PREFIX}limpartipo* [tipo] @usuario - Limpa todos os usuários desse tipo e transforma em usuarios comuns.
|- *${PREFIX}usuarios* [tipo]  - Mostra todos os usuários do tipo escolhido.
|
|-- ☾ CONTROLE/LIMITE ☽
|
|- *${PREFIX}pvliberado* - Ativa/desativa os comandos em mensagens privadas.
|- *${PREFIX}autostickerpv* - Ativa/desativa a criação automática de stickers no privado.
|
|-- ☾ GRUPOS ☽
|
|- *${PREFIX}sair* - Sai do grupo.
|
╰╼❥ ${nomeBot.trim()}® by *${nomeAdm.trim()}*`;
    },
};

export default menu;
