require(`dotenv`).config();

interface Comandos {
    [key: string]: {
        [key: string]: string;
    };
}

const cabecalho = `❔ USO DO COMANDO ❔\n\n`;
const PREFIX = process.env.PREFIX || '!';

const guias: Comandos = {
    info: {
        menu: cabecalho + `Ex: *${PREFIX}menu* - Exibe o menu de comandos gerais.`,
        ajuda: cabecalho + `Ex: *${PREFIX}ajuda* - Exibe o menu de comandos gerais.`,
        info: cabecalho + `Ex: *${PREFIX}info* - Exibe as informações do bot, dono, etc.`,
        meusdados: cabecalho + `Ex: *${PREFIX}meusdados* - Exibe seus dados gerais como comandos, mensagens, tipo de usuário, etc.`,
        reportar: cabecalho + `Ex: *${PREFIX}reportar* mensagem - Reporta uma mensagem para a administração do Bot.`,
    },
    figurinhas: {
        s:
            cabecalho +
            `Ex: Envie/responda uma *imagem* com *${PREFIX}s* - Transforma a imagem em sticker.\n\n` +
            `Ex: Envie/responda uma *imagem* com *${PREFIX}s* 1 - Transforma a imagem em sticker circular.\n\n` +
            `*Obs*: Este comando funciona apenas com *IMAGENS*.`,
        sgif:
            cabecalho +
            `Ex: Envie/responda um gif/video com *${PREFIX}sgif* - Transforma o gif/video em sticker animado.\n\n` +
            // `Ex: Envie/responda um gif/video com *${PREFIX}sgif* 1 - Transforma o gif/video em sticker animado recortado.\n\n` +
            // `Ex: Envie/responda um gif/video com *${PREFIX}sgif* 2 - Transforma o gif/video em sticker animado com formato circular.\n\n` +
            `*Obs*: Este comando funciona apenas com *GIFS/VIDEOS*.`,
        ssf:
            cabecalho +
            `Ex: Envie/responda uma *imagem* com *${PREFIX}ssf* - Retira o fundo da imagem e transforma em sticker.\n\n` +
            `*Obs*: Este comando funciona apenas com *IMAGENS*.`,
        tps: cabecalho + `Ex: *${PREFIX}tps* texto - Transforma o texto que você digitou em sticker.`,
        // atps: cabecalho + `Ex: *${PREFIX}atps* texto - Transforma o texto que você digitou em sticker animado.`,
        simg:
            cabecalho +
            `Ex: Responda um sticker com *${PREFIX}simg* - Transforma o sticker em imagem.\n\n` +
            `*Obs*: Este comando funciona apenas com *STICKERS*.`,
        figurinhas: cabecalho + `Ex: Envia varias figuinhas para o usuário.`,
        salvar: cabecalho + `responda uma figurinha para ser salva.`,
        'figurinhas+18': cabecalho + `Ex: Envia varias figuinhas+18 para o usuário no seu privado.`,
        'salvar+18': cabecalho + `responda uma figurinha+18 para ser salva, apenas o dono do bot pode usar.`,
    },
    downloads: {
        play: cabecalho + `Ex: *${PREFIX}play* musica - Faz download de uma música do Youtube e envia como audio.`,
        yt: cabecalho + `Ex: *${PREFIX}yt* titulo - Faz download de um video do Youtube com o titulo digitado e envia.`,
        fb: cabecalho + `Ex: *${PREFIX}fb* link - Faz download de um video do Facebook pelo link digitado e envia.`,
        ig: cabecalho + `Ex: *${PREFIX}ig* link - Faz download de um video/foto do Instagram pelo link digitado e envia.`,
        img:
            cabecalho +
            `Ex: *${PREFIX}img* tema - Envia 1 imagem com o tema que você digitar.\n\n` +
            `Ex: *${PREFIX}img* 5 tema - Envia 5 imagens com o tema que você digitar.`,
    },
    utilidade: {
        tabela: cabecalho + `Ex: *${PREFIX}tabela* - Exibe a tabela de letras para criação de nicks.`,
        audio:
            cabecalho +
            `Responda um aúdio com um desses comandos :\n\n` +
            `Ex: *${PREFIX}audio* grave - Torna audio mais grave e lento\n\n` +
            `Ex: *${PREFIX}audio* agudo - Torna o audio mais agudo e rapido\n\n` +
            `Ex: *${PREFIX}audio* estourar - Deixa o audio estourado\n\n` +
            `Ex: *${PREFIX}audio* volume  - Aumenta o volume em 4 vezes\n\n` +
            `Ex: *${PREFIX}audio* x2 - Acelera o audio em 2 vezes\n\n` +
            `Ex: *${PREFIX}audio* reverso - Reverte o audio\n\n` +
            `*Obs*: Este comando funciona apenas com *AUDIOS*.`,
        traduz:
            cabecalho +
            `Ex: *${PREFIX}traduz* pt texto - Traduz o texto que foi digitado para *Português*.\n\n` +
            `Ex: *${PREFIX}traduz* en texto - Traduz o texto que foi digitado para *Inglês*.\n\n` +
            `Ex: Responda um *texto* com *${PREFIX}traduz* pt - Traduz o resto respondido para *Português*.\n\n` +
            `Ex: Responda um *texto* com *${PREFIX}traduz* en - Traduz o resto respondido para *Inglês*.\n\n` +
            `Idiomas suportados : \n` +
            `- 🇧🇷 Português (pt)\n` +
            `- 🇺🇸 Inglês (en)\n` +
            `- 🇯🇵 Japonês (ja)\n` +
            `- 🇮🇹 Italiano (it)\n` +
            `- 🇪🇸 Espanhol (es)\n` +
            `- 🇷🇺 Russo (ru)\n` +
            `- 🇰🇷 Coreano (ko)\n`,
        voz:
            cabecalho +
            `Ex: *${PREFIX}voz* pt texto - Manda um audio falando o texto digitado com a voz do Google em Português-Brasil.\n\n` +
            `Ex: Responda um texto com *${PREFIX}voz* pt - Manda um audio falando o texto respondido com a voz do Google em Português-Brasil.\n\n` +
            `Idiomas suportados : \n` +
            `- 🇧🇷 Português (pt)\n` +
            `- 🇺🇸 Inglês (en)\n` +
            `- 🇯🇵 Japonês (jp)\n` +
            `- 🇮🇹 Italiano (it)\n` +
            `- 🇪🇸 Espanhol (es)\n` +
            `- 🇷🇺 Russo (ru)\n` +
            `- 🇰🇷 Coreano (ko)\n` +
            `- 🇸🇪 Sueco (sv)\n`,
        noticias: cabecalho + `Ex: *${PREFIX}noticias* - Exibe as notícias atuais.`,
        letra: cabecalho + `Ex: *${PREFIX}letra* nome-musica - Exibe a letra da música que você digitou.`,
        rastreio: cabecalho + `Ex: *${PREFIX}rastreio* PBXXXXXXXXXXX - Exibe o rastreio da encomenda dos correios que você digitou.`,
        calc:
            cabecalho +
            `Ex: *${PREFIX}calc* 8x8 - Exibe o resultado do cálculo.\n\n` +
            `Ex: *${PREFIX}calc* 1mm em 1km - Exibe o resultado do conversão de medidas.`,
        pesquisa: cabecalho + `Ex: *${PREFIX}pesquisa* tema - Faz uma pesquisa com o tema que você digitar.`,
        moeda:
            cabecalho +
            `Ex: *${PREFIX}moeda* real 20 - Converte 20 reais para outras moedas\n\n` +
            `Ex: *${PREFIX}moeda* dolar 20 - Converte 20 dólares para outras moedas.\n\n` +
            `Ex: *${PREFIX}moeda* euro 20 - Converte 20 euros para outras moedas.`,
        clima: cabecalho + `Ex: *${PREFIX}clima* Rio de Janeiro - Mostra o clima atual e dos próximos dias para o Rio de Janeiro.`,
        ddd:
            cabecalho +
            `Ex: *${PREFIX}ddd* 21 - Exibe qual estado e região do DDD 21.\n\n` +
            `Ex: Responda com *${PREFIX}ddd* - Exibe qual estado e região do membro respondido.`,
        anime:
            cabecalho +
            `Ex: Envie/responda uma imagem com *${PREFIX}anime* - Procura o anime pela imagem.\n\n` +
            `*Obs*: Este comando funciona apenas com *IMAGENS* e deve ser uma *CENA VÁLIDA DE ANIME*, *NÃO* podendo ser imagens com *baixa qualidade*, *wallpappers*, *imagens editadas/recortadas*.`,
        animelanc: cabecalho + `Ex: *${PREFIX}animelanc* - Mostra os ultimos lançamentos de anime do site AnimesHouse.`,
        qualmusica:
            cabecalho +
            `Ex: Envie/responda um audio/video com *${PREFIX}qualmusica* - Procura a música tocada no audio/video.\n\n` +
            `*Obs*: Este comando funciona apenas com *AUDIO/VIDEO*.`,
    },
    grupo: {
        regras: cabecalho + `Ex: *${PREFIX}regras* - Exibe a descrição/regras do grupo`,
        status: cabecalho + `Ex: *${PREFIX}status* - Exibe as configurações atuais do grupo`,
        blista: cabecalho + `Ex: *${PREFIX}blista* +55219xxxx-xxxx - Adiciona o número digitado a lista negra do grupo.`,
        dlista: cabecalho + `Ex: *${PREFIX}dlista* +55219xxxx-xxxx - Remove o número digitado da lista negra do grupo.`,
        listanegra: cabecalho + `Ex: *${PREFIX}listanegra* - Exibe a lista negra do grupo.`,
        destravar: cabecalho + `Ex: *${PREFIX}destravar* - Envia várias destravas no grupo.`,
        bv:
            cabecalho +
            `Ex: *${PREFIX}bv*  - Liga/desliga a mensagem de bem-vindo para novos membros.\n\n` +
            `Ex: *${PREFIX}bv* [mensagem]  - Liga a mensagem de bem-vindo com uma mensagem da sua escolha.`,
        aflood:
            cabecalho +
            `Ex: *${PREFIX}aflood*  - Liga/desliga o anti-flood.\n\n` +
            `Ex: *${PREFIX}aflood* 5 15  - Maxímo de mensagens fica 5 mensagens a cada 15 segundos.`,
        afake:
            cabecalho +
            `Ex: *${PREFIX}afake* - Liga/desliga o anti-fake em grupos.\n` +
            `Ex: *${PREFIX}afake* DDI - Configura o anti-fake para que todos números com o DDI exterior seja banido, exceto o que você escolheu.\n` +
            `Ex: *${PREFIX}afake* DDI1 DDI2 DDI3 - Configura o anti-fake para que todos números com DDI exterior sejam banidos, excetos o que você escolheu.\n\n` +
            `*Obs*: A ativação do anti-fake bane pessoas com DDI do exterior (que não sejam 55 - Brasil).`,
        alink:
            cabecalho +
            `Ex: *${PREFIX}alink* - Liga/desliga o antilink e bane quem postar qualquer tipo de link.\n\n` +
            `Ex: *${PREFIX}alink* instagram facebook youtube whatsapp - Liga o antilink e bane quem postar link que não seja do Instagram, Facebook, Youtube ou WhatsApp.`,
        atrava:
            cabecalho +
            `Ex: *${PREFIX}atrava* - Liga/desliga o anti-trava para no máximo 1500 caracteres por mensagem.\n\n` +
            `Ex : *${PREFIX}atrava* 500 - Configura o anti-trava para no máximo 500 caracteres por mensagem.`,
        aporno:
            cabecalho +
            `Ex: *${PREFIX}aporno* - Liga/desliga o anti-pornô em imagens.\n\n` +
            `*Obs*: A ativação do anti-pornô pode tornar o anti-flood mais lento pois há uma checagem em cada imagem.`,
        mutar: cabecalho + `Ex: *${PREFIX}mutar* - Liga/desliga a execução de comandos dos membros.`,
        autosticker: cabecalho + `Ex: *${PREFIX}autosticker* - Liga/desliga a criação automatica de stickers sem precisar de comandos.`,
        add:
            cabecalho +
            `Ex: *${PREFIX}add* 5521xxxxxxxxx - Digite o numero com o código do país para adicionar a pessoa.\n\n` +
            `Ex: *${PREFIX}add* 5521xxxxxxxxx, 5521xxxxxxxxx - Digite os numeros com o código do país (adiciona mais de uma pessoa no grupo).`,
        ban:
            cabecalho +
            `Ex: *${PREFIX}ban* @membro - Para banir um membro marcando ele.\n\n` +
            `Ex: Responder alguém com *${PREFIX}ban* - Bane a pessoa que você respondeu.`,
        rlink: cabecalho + `Ex: *${PREFIX}rlink* - Redefine o link do grupo.`,
        contador: cabecalho + `Ex: *${PREFIX}contador* - Liga/desliga a contagem de mensagens no grupo.`,
        atividade:
            cabecalho +
            `Ex: *${PREFIX}atividade* @membro - Mostra a atividade do membro mencionado.\n\n` +
            `Ex: Responder com *${PREFIX}atividade* - Mostra a atividade do membro que você respondeu.\n\n` +
            `*Obs*: Este comando só funciona com o *${PREFIX}contador* ativado.`,
        alterarcont:
            cabecalho +
            `Ex: *${PREFIX}alterarcont* @membro 50 - Altera a quantidade de mensagens de um membro mencionado para 50 mensagens.\n\n` +
            `Ex: Responder com *${PREFIX}alterarcont* 20 - Altera a quantidade de mensagens do membro que você respondeu para 20 mensagens.\n\n` +
            `*Obs*: Este comando só funciona com o *${PREFIX}contador* ativado.`,
        imarcar:
            cabecalho +
            `Ex: *${PREFIX}imarcar* 5 - Marca todos os membros com menos de 5 mensagens.\n\n` +
            `*Obs*: Este comando só funciona com o *${PREFIX}contador* ativado.`,
        ibanir:
            cabecalho +
            `Ex: *${PREFIX}ibanir* 10 - Bane todos os membros com menos de 10 mensagens.\n\n` +
            `*Obs*: Este comando só funciona com o *${PREFIX}contador* ativado.`,
        topativos:
            cabecalho +
            `Ex: *${PREFIX}topativos* 10 - Marca os 10 membros com mais mensagens do grupo.\n\n` +
            `*Obs*: Este comando só funciona com o *${PREFIX}contador* ativado.`,
        enquete:
            cabecalho +
            `Ex: *${PREFIX}enquete* tema,opcao1,opcao2,opcao3 - Cria uma enquete com um tema e as opções de voto.\n\n` +
            `*Obs*: Digite *${PREFIX}enquete* novamente para encerrar uma enquete aberta e exibir os resultados finais dela.`,
        votarenquete:
            cabecalho +
            `Ex: *${PREFIX}votarenquete* 1 - Vota na opção 1 da enquete.\n\n` +
            `*Obs*: Este comando só funciona com uma enquete em aberto.`,
        verenquete: cabecalho + `Ex: *${PREFIX}verenquete* - Mostra se há alguma enquete em aberto.`,
        votacao: cabecalho + `Ex: *${PREFIX}votacao* - Mostra se há alguma votação de ban em aberto.`,
        fotogrupo: cabecalho + `Ex: Envie/responda uma *imagem* com *${PREFIX}fotogrupo* - Altera a foto do grupo.\n\n`,
        votar: cabecalho + `Ex: *${PREFIX}votar* - Vota no membro que está em votação.`,
        vb:
            cabecalho +
            `Ex: *${PREFIX}vb* @membro 10 - Abre uma votação de ban em um membro com limite de 10 votos.\n\n` +
            `*Obs*: Digite *${PREFIX}vb* novamente para encerrar uma votação aberta.`,
        bcmd:
            cabecalho +
            `Ex: *${PREFIX}bcmd* ${PREFIX}s ${PREFIX}sgif ${PREFIX}play - Bloqueia no grupo os comandos ${PREFIX}s, ${PREFIX}sgif e ${PREFIX}play (você pode escolher os comandos a sua necessidade).\n\n` +
            `Ex: *${PREFIX}bcmd* figurinhas - Bloqueia todos os comandos da categoria FIGURINHAS.\n\n` +
            `Ex: *${PREFIX}bcmd* utilidades - Bloqueia todos os comandos da categoria UTILIDADES.\n\n` +
            `Ex: *${PREFIX}bcmd* downloads - Bloqueia todos os comandos da categoria DOWNLOADS.\n\n` +
            `Ex: *${PREFIX}bcmd* diversão - Bloqueia todos os comandos da categoria DIVERSÃO.\n\n` +
            `*Obs* : Você não pode bloquear comandos de administrador.`,
        dcmd:
            cabecalho +
            `Ex: *${PREFIX}dcmd* ${PREFIX}s ${PREFIX}sgif ${PREFIX}play - Desbloqueia no grupo os comandos ${PREFIX}s, ${PREFIX}sgif e ${PREFIX}play.\n\n` +
            `Ex: *${PREFIX}dcmd* todos - Desbloqueia todos os comandos.\n\n` +
            `Ex: *${PREFIX}dcmd* figurinhas - Desbloqueia todos os comandos da categoria FIGURINHAS.\n\n` +
            `Ex: *${PREFIX}dcmd* utilidades - Desbloqueia todos os comandos da categoria UTILIDADES.\n\n` +
            `Ex: *${PREFIX}dcmd* downloads - Desbloqueia todos os comandos da categoria DOWNLOADS.\n\n` +
            `Ex: *${PREFIX}dcmd* diversão - Desbloqueia todos os comandos da categoria DIVERSÃO.\n\n` +
            `*Obs* : Verifique os comandos que estão bloqueados com *${PREFIX}status*.`,
        link: cabecalho + `Ex: *${PREFIX}link* - Exibe o link do grupo.`,
        adms: cabecalho + `Ex: *${PREFIX}adms* - Exibe e marca os administradores do grupo.`,
        dono: cabecalho + `Ex: *${PREFIX}dono* - Exibe e marca o dono do grupo.`,
        mt:
            cabecalho +
            `Ex: *${PREFIX}mt* - Marca todos os *MEMBROS/ADMIN* do grupo.\n\n` +
            `Ex: *${PREFIX}mt* mensagem - Marca todos os *MEMBROS/ADMIN* do grupo com uma mensagem.`,
        mm:
            cabecalho +
            `Ex: *${PREFIX}mm* - Marca todos os *MEMBROS* do grupo.\n\n` +
            `Ex: *${PREFIX}mm* mensagem - Marca todos os *MEMBROS* do grupo com uma mensagem.`,
        bantodos:
            cabecalho +
            `Ex: *${PREFIX}bantodos* - Bane todos os membros do grupo.\n\n` +
            `*Obs* : Apenas o dono do grupo pode usar este comando.`,
        promover:
            cabecalho +
            `Ex: *${PREFIX}promover* @membro - Promove o membro mencionado a *ADMINISTRADOR*.\n\n` +
            `Ex: Responder com *${PREFIX}promover* - Promove o usuário respondido a *ADMINISTRADOR*.`,
        rebaixar:
            cabecalho +
            `Ex: *${PREFIX}rebaixar* @admin - Rebaixa o administrador mencionado a *MEMBRO*.\n\n` +
            `Ex: Responder com *${PREFIX}rebaixar* - Rebaixa o administrador respondido a *MEMBRO*.`,
        apg:
            cabecalho +
            `Ex: Responder com *${PREFIX}apg* - Apaga a mensagem que foi respondida com esse comando.\n\n` +
            `*Obs* : Esse comando só pode ser usado por administradores.`,
        f: cabecalho + `Ex: *${PREFIX}f* - Abre/Fecha o grupo.`,
        hidetag: cabecalho + `Responda uma imgem ou figurinha que marca todos os membros do grupo.`,
    },
    diversao: {
        detector: cabecalho + `Ex: Responder com *${PREFIX}detector* - Exibe o resultado da máquina da verdade.`,
        viadometro:
            cabecalho +
            `Ex: *${PREFIX}viadometro* @membro - Mede o nível de viadagem do membro mencionado.\n\n` +
            `Ex: Responder com *${PREFIX}viadometro* - Mede o nível de viadagem do membro respondido.`,
        bafometro:
            cabecalho +
            `Ex: *${PREFIX}bafometro* @membro - Mede o nível de alcool do membro mencionado.\n\n` +
            `Ex: Responder com *${PREFIX}bafometro* - Mede o nível de alcool do membro respondido.`,
        caracoroa: cabecalho + `Ex: *${PREFIX}caracoroa* - Decisão no cara ou coroa, exibe o lado da moeda que cair.`,
        chance: cabecalho + `Ex: *${PREFIX}chance de ficar rico* - Calcula sua chance de um tema aleatório a sua escolha.`,
        ppt:
            cabecalho +
            `Ex: *${PREFIX}ppt* pedra - Escolhe pedra, para jogar pedra, papel ou tesoura.\n\n` +
            `Ex: *${PREFIX}ppt* papel - Escolhe papel, para jogar pedra, papel ou tesoura.\n\n` +
            `Ex: *${PREFIX}ppt* tesoura - Escolhe tesoura, para jogar pedra, papel ou tesoura.`,
        top5: cabecalho + `Ex: *${PREFIX}top5* tema - Exibe uma ranking de 5 membros aleatórios com o tema que você escolher.`,
        mascote: cabecalho + `Ex: *${PREFIX}mascote* - Exibe o mascote do BOT.`,
        roletarussa:
            cabecalho +
            `Ex: *${PREFIX}roletarussa* - Bane um membro aleatório do grupo.\n\n` +
            `*Obs*: Comando apenas para administradores, pode banir qualquer um exceto o dono do grupo e o BOT.`,
        casal: cabecalho + `Ex: *${PREFIX}casal* - Escolhe 2 pessoas aleatórias do grupo para formar um casal.`,
        par: cabecalho + `Ex: *${PREFIX}par* @membro1 @membro2 - Mede o nível de compatibilidade dos 2 membros mencionados.`,
        fch: cabecalho + `Ex: *${PREFIX}fch* - Exibe uma frase aleatória montada com as cartas do jogo Cartas contra a Humanidade.`,
    },
    admin: {
        admin: cabecalho + `Ex: *${PREFIX}admin* - Exibe o menu de administração do Bot.`,
        grupos: cabecalho + `Ex: *${PREFIX}grupos* - Mostra os grupos atuais que o bot está e suas informações.`,
        fotobot: cabecalho + `Ex: Envie/responda uma *imagem* com *${PREFIX}fotobot* - Altera a foto do BOT.\n\n`,
        infocompleta: cabecalho + `Ex: *${PREFIX}infocompleta* - Exibe as informações completas do bot, inclusive as configurações atuais.`,
        entrargrupo: cabecalho + `Ex: *${PREFIX}entrargrupo* link - Entra em um grupo por link de convite.`,
        sair: cabecalho + `Ex: *${PREFIX}sair* - Faz o bot sair do grupo.`,
        listablock: cabecalho + `Ex: *${PREFIX}listablock* - Exibe a lista de usuários bloqueados pelo bot.`,
        limpartudo: cabecalho + `Ex: *${PREFIX}limpartudo* - Limpa todos os chats (Grupos e Contatos).`,
        bcmdglobal:
            cabecalho +
            `Ex: *${PREFIX}bcmdglobal* ${PREFIX}s ${PREFIX}sgif ${PREFIX}play - Bloqueia  os comandos ${PREFIX}s, ${PREFIX}sgif e ${PREFIX}play (você pode escolher os comandos a sua necessidade).\n\n` +
            `Ex: *${PREFIX}bcmdglobal* figurinhas - Bloqueia todos os comandos da categoria FIGURINHAS.\n\n` +
            `Ex: *${PREFIX}bcmdglobal* utilidades - Bloqueia todos os comandos da categoria UTILIDADES.\n\n` +
            `Ex: *${PREFIX}bcmdglobal* downloads - Bloqueia todos os comandos da categoria DOWNLOADS.\n\n` +
            `Ex: *${PREFIX}bcmdglobal* diversão - Bloqueia todos os comandos da categoria DIVERSÃO.\n\n` +
            `*Obs* : Você não pode bloquear comandos de administrador.`,
        dcmdglobal:
            cabecalho +
            `Ex: *${PREFIX}dcmdglobal* ${PREFIX}s ${PREFIX}sgif ${PREFIX}play - Desbloqueia  os comandos ${PREFIX}s, ${PREFIX}sgif e ${PREFIX}play.\n\n` +
            `Ex: *${PREFIX}dcmdglobal* todos - Desbloqueia todos os comandos.\n\n` +
            `Ex: *${PREFIX}dcmdglobal* figurinhas - Desbloqueia todos os comandos da categoria FIGURINHAS.\n\n` +
            `Ex: *${PREFIX}dcmdglobal* utilidades - Desbloqueia todos os comandos da categoria UTILIDADES.\n\n` +
            `Ex: *${PREFIX}dcmdglobal* downloads - Desbloqueia todos os comandos da categoria DOWNLOADS.\n\n` +
            `Ex: *${PREFIX}dcmdglobal* diversão - Desbloqueia todos os comandos da categoria DIVERSÃO.\n\n` +
            `*Obs* : Verifique os comandos que estão bloqueados com ${PREFIX}infocompleta.`,
        autostickerpv:
            cabecalho + `Ex: *${PREFIX}autostickerpv* - Liga/desliga a criação automatica de stickers sem precisar de comandos no privado.`,
        pvliberado: cabecalho + `Ex: *${PREFIX}pvliberado* - Liga/desliga os comandos em MENSAGENS PRIVADAS.`,
        antitravapv:
            cabecalho +
            `Ex: *${PREFIX}antitravapv* - Liga/desliga o anti-trava no privado para no máximo 1500 caracteres por mensagem.\n\n` +
            `Ex : *${PREFIX}antitravapv* 500 - Configura o anti-trava no privado para no máximo 500 caracteres por mensagem.`,
        limpar: cabecalho + `Ex: *${PREFIX}limpar* - Limpa todos os chats de contatos.`,
        rconfig: cabecalho + `Ex: *${PREFIX}rconfig* - Reseta a configuração de todos os grupos.`,
        sairgrupos: cabecalho + `Ex: *${PREFIX}sairgrupos* - Sai de todos os grupos.`,
        bloquear:
            cabecalho +
            `Ex: *${PREFIX}bloquear* @membro - Para o bot bloquear o membro mencionado.\n\n` +
            `Ex: *${PREFIX}bloquear* +55 (xx) xxxxx-xxxx - Para o bot bloquear o número digitado.\n\n` +
            `Ex: Responder alguém com *${PREFIX}bloquear* - Para o bot bloquear o membro que você respondeu.`,
        desbloquear:
            cabecalho +
            `Ex: *${PREFIX}desbloquear* @membro - Para o bot desbloquear o membro mencionado.\n\n` +
            `Ex: *${PREFIX}desbloquear* +55 (xx) xxxxx-xxxx - Para o bot desbloquear o número digitado.\n\n` +
            `Ex: Responder alguém com *${PREFIX}desbloquear* - Para o bot desbloquear o membro que você respondeu.`,
        usuarios:
            cabecalho +
            `Ex: *${PREFIX}usuarios* bronze - Mostra todos os usuários do tipo *BRONZE*.\n\n` +
            `*Obs*: Use o *${PREFIX}tipos* para ver os tipos disponíveis de usuários.`,
        limitediario: cabecalho + `Ex: *${PREFIX}limitediario* - Ativa/desativa o limite diario de comandos.`,
        taxalimite:
            cabecalho +
            `Ex: *${PREFIX}taxalimite* 5 60 - Ativa a taxa limite de comandos para 5 comandos a cada minuto por usuário, caso o usuário ultrapasse ele fica 60 segundos impossibilitado de fazer comandos.\n\n` +
            `*Obs*: Digite *${PREFIX}taxalimite* novamente para desativar a taxa limite de comandos.`,
        limitarmsgs:
            cabecalho +
            `Ex: *${PREFIX}limitarmsgs* 10 10 - Ativa o limite de mensagens privadas em 10 mensagens a cada 10 segundos, se o usuário ultrapassar ele será bloqueado.\n\n` +
            `*Obs*: Digite *${PREFIX}limitarmsgs* novamente para desativar o limite de mensagens privadas.`,
        tipos: cabecalho + `Ex: *${PREFIX}tipos* - Exibe os tipos de usuários disponíveis e quantos comandos estão configurados por dia.`,
        limpartipo:
            cabecalho +
            `Ex: *${PREFIX}limpartipo* ouro - Transforma todos os usuários do tipo *OURO* em *BRONZE*.\n\n` +
            `*Obs*: Use o *${PREFIX}tipos* para ver os tipos disponíveis de usuários.`,
        mudarlimite:
            cabecalho +
            `Ex: *${PREFIX}mudarlimite* bronze 50 - Altera o limite diário de comandos do usuário *BRONZE* para 50/dia.\n\n` +
            `*Obs*: O comando de *${PREFIX}limitediario* deve estar ativado.\n` +
            `*Obs²*: Verifique os tipos disponíveis de usuários em *${PREFIX}tipos*.\n` +
            `*Obs³*: Para ficar sem limite de comandos digite -1 no campo de limite.`,
        alterartipo:
            cabecalho +
            `Ex: *${PREFIX}alterartipo* ouro @usuario - Altera o tipo do usuário mencionado para *OURO*.\n\n` +
            `Ex: Responder com *${PREFIX}alterartipo* bronze - Altera o tipo do usuário respondido para *BRONZE*.\n\n` +
            `Ex: *${PREFIX}alterartipo* prata  55219xxxxxxxx - Altera o tipo do usuário do número para *PRATA*.\n\n` +
            `*Obs*: Use o *${PREFIX}tipos* para ver os tipos disponíveis de usuários.`,
        rtodos:
            cabecalho +
            `Ex: *${PREFIX}rtodos* - Reseta os comandos diários de todos os usuários.\n\n` +
            `*Obs*: O comando de *${PREFIX}limitediario* deve estar ativado.`,
        r:
            cabecalho +
            `Ex: *${PREFIX}r* @usuario - Reseta os comandos diários de um usuário mencionado.\n\n` +
            `Ex: Responder com *${PREFIX}r* - Reseta os comandos diários do usuário respondido.\n\n` +
            `Ex: *${PREFIX}r* 55219xxxxxxxx - Reseta os comandos diários do usuário com esse número.\n\n` +
            `*Obs*: O comando de *${PREFIX}limitediario* deve estar ativado.`,
        verdados:
            cabecalho +
            `Ex: *${PREFIX}verdados* @usuario - Mostra os dados gerais do usuário mencionado.\n\n` +
            `Ex: Responder com *${PREFIX}verdados* - Mostra os dados gerais do usuário respondido.\n\n` +
            `Ex: *${PREFIX}verdados* 55219xxxxxxxx - Mostra os dados gerais do usuário com esse número.`,
        bctodos: cabecalho + `Ex: *${PREFIX}bctodos* mensagem - Envia uma mensagem para todos os *GRUPOS E CONTATOS*.`,
        bcgrupos: cabecalho + `Ex: *${PREFIX}bcgrupos* mensagem - Envia uma mensagem para todos os *GRUPOS*.`,
        bccontatos: cabecalho + `Ex: *${PREFIX}bccontatos* mensagem - Envia uma mensagem para todos os *CONTATOS*.`,
        print: cabecalho + `Ex: *${PREFIX}print* - Tira uma print do WhatsApp Web do BOT e envia.`,
        estado:
            cabecalho +
            `Ex: *${PREFIX}estado* online - Muda o status do bot para ONLINE.\n\n` +
            `Ex: *${PREFIX}estado* offline - Muda o status do bot para OFFLINE.\n\n` +
            `Ex: *${PREFIX}estado* manutencao - Muda o status do bot para MANUTENCÃO.`,
        desligar: cabecalho + `Ex: *${PREFIX}desligar* - Desliga o BOT.`,
        ping: cabecalho + `Ex: *${PREFIX}ping* - Exibe as informações do sistema do BOT e o tempo de resposta dele.`,
    },
};

export const guiaComandoMsg = (tipo: string, comando: string): string | undefined => {
    comando = comando.replace(`${PREFIX}`, ``);
    const msgGuia = guias[tipo]?.[comando];
    return msgGuia;
};

export default guias;
