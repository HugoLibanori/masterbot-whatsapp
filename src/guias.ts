require(`dotenv`).config();

interface Comandos {
    [key: string]: {
        [key: string]: string;
    };
}

const cabecalho = `❔ USO DO COMANDO ❔\n\n`;

const guias: Comandos = {
    info: {
        menu: cabecalho + `Ex: *${process.env.PREFIX}menu* - Exibe o menu de comandos gerais.`,
        ajuda: cabecalho + `Ex: *${process.env.PREFIX}ajuda* - Exibe o menu de comandos gerais.`,
        info: cabecalho + `Ex: *${process.env.PREFIX}info* - Exibe as informações do bot, dono, etc.`,
        meusdados:
            cabecalho + `Ex: *${process.env.PREFIX}meusdados* - Exibe seus dados gerais como comandos, mensagens, tipo de usuário, etc.`,
        reportar: cabecalho + `Ex: *${process.env.PREFIX}reportar* mensagem - Reporta uma mensagem para a administração do Bot.`,
    },
    figurinhas: {
        s:
            cabecalho +
            `Ex: Envie/responda uma *imagem* com *${process.env.PREFIX}s* - Transforma a imagem em sticker.\n\n` +
            `Ex: Envie/responda uma *imagem* com *${process.env.PREFIX}s* 1 - Transforma a imagem em sticker circular.\n\n` +
            `*Obs*: Este comando funciona apenas com *IMAGENS*.`,
        sgif:
            cabecalho +
            `Ex: Envie/responda um gif/video com *${process.env.PREFIX}sgif* - Transforma o gif/video em sticker animado.\n\n` +
            // `Ex: Envie/responda um gif/video com *${process.env.PREFIX}sgif* 1 - Transforma o gif/video em sticker animado recortado.\n\n` +
            // `Ex: Envie/responda um gif/video com *${process.env.PREFIX}sgif* 2 - Transforma o gif/video em sticker animado com formato circular.\n\n` +
            `*Obs*: Este comando funciona apenas com *GIFS/VIDEOS*.`,
        ssf:
            cabecalho +
            `Ex: Envie/responda uma *imagem* com *${process.env.PREFIX}ssf* - Retira o fundo da imagem e transforma em sticker.\n\n` +
            `*Obs*: Este comando funciona apenas com *IMAGENS*.`,
        tps: cabecalho + `Ex: *${process.env.PREFIX}tps* texto - Transforma o texto que você digitou em sticker.`,
        // atps: cabecalho + `Ex: *${process.env.PREFIX}atps* texto - Transforma o texto que você digitou em sticker animado.`,
        simg:
            cabecalho +
            `Ex: Responda um sticker com *${process.env.PREFIX}simg* - Transforma o sticker em imagem.\n\n` +
            `*Obs*: Este comando funciona apenas com *STICKERS*.`,
        figurinhas: cabecalho + `Ex: Envia varias figuinhas para o usuário.`,
        salvar: cabecalho + `responda uma figurinha para ser salva.`,
    },
    downloads: {
        play: cabecalho + `Ex: *${process.env.PREFIX}play* musica - Faz download de uma música do Youtube e envia como audio.`,
        yt: cabecalho + `Ex: *${process.env.PREFIX}yt* titulo - Faz download de um video do Youtube com o titulo digitado e envia.`,
        fb: cabecalho + `Ex: *${process.env.PREFIX}fb* link - Faz download de um video do Facebook pelo link digitado e envia.`,
        ig: cabecalho + `Ex: *${process.env.PREFIX}ig* link - Faz download de um video/foto do Instagram pelo link digitado e envia.`,
        img:
            cabecalho +
            `Ex: *${process.env.PREFIX}img* tema - Envia 1 imagem com o tema que você digitar.\n\n` +
            `Ex: *${process.env.PREFIX}img* 5 tema - Envia 5 imagens com o tema que você digitar.`,
    },
    utilidade: {
        tabela: cabecalho + `Ex: *${process.env.PREFIX}tabela* - Exibe a tabela de letras para criação de nicks.`,
        audio:
            cabecalho +
            `Responda um aúdio com um desses comandos :\n\n` +
            `Ex: *${process.env.PREFIX}audio* grave - Torna audio mais grave e lento\n\n` +
            `Ex: *${process.env.PREFIX}audio* agudo - Torna o audio mais agudo e rapido\n\n` +
            `Ex: *${process.env.PREFIX}audio* estourar - Deixa o audio estourado\n\n` +
            `Ex: *${process.env.PREFIX}audio* volume  - Aumenta o volume em 4 vezes\n\n` +
            `Ex: *${process.env.PREFIX}audio* x2 - Acelera o audio em 2 vezes\n\n` +
            `Ex: *${process.env.PREFIX}audio* reverso - Reverte o audio\n\n` +
            `*Obs*: Este comando funciona apenas com *AUDIOS*.`,
        traduz:
            cabecalho +
            `Ex: *${process.env.PREFIX}traduz* pt texto - Traduz o texto que foi digitado para *Português*.\n\n` +
            `Ex: *${process.env.PREFIX}traduz* en texto - Traduz o texto que foi digitado para *Inglês*.\n\n` +
            `Ex: Responda um *texto* com *${process.env.PREFIX}traduz* pt - Traduz o resto respondido para *Português*.\n\n` +
            `Ex: Responda um *texto* com *${process.env.PREFIX}traduz* en - Traduz o resto respondido para *Inglês*.\n\n` +
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
            `Ex: *${process.env.PREFIX}voz* pt texto - Manda um audio falando o texto digitado com a voz do Google em Português-Brasil.\n\n` +
            `Ex: Responda um texto com *${process.env.PREFIX}voz* pt - Manda um audio falando o texto respondido com a voz do Google em Português-Brasil.\n\n` +
            `Idiomas suportados : \n` +
            `- 🇧🇷 Português (pt)\n` +
            `- 🇺🇸 Inglês (en)\n` +
            `- 🇯🇵 Japonês (jp)\n` +
            `- 🇮🇹 Italiano (it)\n` +
            `- 🇪🇸 Espanhol (es)\n` +
            `- 🇷🇺 Russo (ru)\n` +
            `- 🇰🇷 Coreano (ko)\n` +
            `- 🇸🇪 Sueco (sv)\n`,
        noticias: cabecalho + `Ex: *${process.env.PREFIX}noticias* - Exibe as notícias atuais.`,
        letra: cabecalho + `Ex: *${process.env.PREFIX}letra* nome-musica - Exibe a letra da música que você digitou.`,
        rastreio:
            cabecalho + `Ex: *${process.env.PREFIX}rastreio* PBXXXXXXXXXXX - Exibe o rastreio da encomenda dos correios que você digitou.`,
        calc:
            cabecalho +
            `Ex: *${process.env.PREFIX}calc* 8x8 - Exibe o resultado do cálculo.\n\n` +
            `Ex: *${process.env.PREFIX}calc* 1mm em 1km - Exibe o resultado do conversão de medidas.`,
        pesquisa: cabecalho + `Ex: *${process.env.PREFIX}pesquisa* tema - Faz uma pesquisa com o tema que você digitar.`,
        moeda:
            cabecalho +
            `Ex: *${process.env.PREFIX}moeda* real 20 - Converte 20 reais para outras moedas\n\n` +
            `Ex: *${process.env.PREFIX}moeda* dolar 20 - Converte 20 dólares para outras moedas.\n\n` +
            `Ex: *${process.env.PREFIX}moeda* euro 20 - Converte 20 euros para outras moedas.`,
        clima:
            cabecalho + `Ex: *${process.env.PREFIX}clima* Rio de Janeiro - Mostra o clima atual e dos próximos dias para o Rio de Janeiro.`,
        ddd:
            cabecalho +
            `Ex: *${process.env.PREFIX}ddd* 21 - Exibe qual estado e região do DDD 21.\n\n` +
            `Ex: Responda com *${process.env.PREFIX}ddd* - Exibe qual estado e região do membro respondido.`,
        anime:
            cabecalho +
            `Ex: Envie/responda uma imagem com *${process.env.PREFIX}anime* - Procura o anime pela imagem.\n\n` +
            `*Obs*: Este comando funciona apenas com *IMAGENS* e deve ser uma *CENA VÁLIDA DE ANIME*, *NÃO* podendo ser imagens com *baixa qualidade*, *wallpappers*, *imagens editadas/recortadas*.`,
        animelanc: cabecalho + `Ex: *${process.env.PREFIX}animelanc* - Mostra os ultimos lançamentos de anime do site AnimesHouse.`,
        qualmusica:
            cabecalho +
            `Ex: Envie/responda um audio/video com *${process.env.PREFIX}qualmusica* - Procura a música tocada no audio/video.\n\n` +
            `*Obs*: Este comando funciona apenas com *AUDIO/VIDEO*.`,
    },
    grupo: {
        regras: cabecalho + `Ex: *${process.env.PREFIX}regras* - Exibe a descrição/regras do grupo`,
        status: cabecalho + `Ex: *${process.env.PREFIX}status* - Exibe as configurações atuais do grupo`,
        blista: cabecalho + `Ex: *${process.env.PREFIX}blista* +55219xxxx-xxxx - Adiciona o número digitado a lista negra do grupo.`,
        dlista: cabecalho + `Ex: *${process.env.PREFIX}dlista* +55219xxxx-xxxx - Remove o número digitado da lista negra do grupo.`,
        listanegra: cabecalho + `Ex: *${process.env.PREFIX}listanegra* - Exibe a lista negra do grupo.`,
        destravar: cabecalho + `Ex: *${process.env.PREFIX}destravar* - Envia várias destravas no grupo.`,
        bv:
            cabecalho +
            `Ex: *${process.env.PREFIX}bv*  - Liga/desliga a mensagem de bem-vindo para novos membros.\n\n` +
            `Ex: *${process.env.PREFIX}bv* [mensagem]  - Liga a mensagem de bem-vindo com uma mensagem da sua escolha.`,
        aflood:
            cabecalho +
            `Ex: *${process.env.PREFIX}aflood*  - Liga/desliga o anti-flood.\n\n` +
            `Ex: *${process.env.PREFIX}aflood* 5 15  - Maxímo de mensagens fica 5 mensagens a cada 15 segundos.`,
        afake:
            cabecalho +
            `Ex: *${process.env.PREFIX}afake* - Liga/desliga o anti-fake em grupos.\n` +
            `Ex: *${process.env.PREFIX}afake* DDI - Configura o anti-fake para que todos números com o DDI exterior seja banido, exceto o que você escolheu.\n` +
            `Ex: *${process.env.PREFIX}afake* DDI1 DDI2 DDI3 - Configura o anti-fake para que todos números com DDI exterior sejam banidos, excetos o que você escolheu.\n\n` +
            `*Obs*: A ativação do anti-fake bane pessoas com DDI do exterior (que não sejam 55 - Brasil).`,
        alink:
            cabecalho +
            `Ex: *${process.env.PREFIX}alink* - Liga/desliga o antilink e bane quem postar qualquer tipo de link.\n\n` +
            `Ex: *${process.env.PREFIX}alink* instagram facebook youtube whatsapp - Liga o antilink e bane quem postar link que não seja do Instagram, Facebook, Youtube ou WhatsApp.`,
        atrava:
            cabecalho +
            `Ex: *${process.env.PREFIX}atrava* - Liga/desliga o anti-trava para no máximo 1500 caracteres por mensagem.\n\n` +
            `Ex : *${process.env.PREFIX}atrava* 500 - Configura o anti-trava para no máximo 500 caracteres por mensagem.`,
        aporno:
            cabecalho +
            `Ex: *${process.env.PREFIX}aporno* - Liga/desliga o anti-pornô em imagens.\n\n` +
            `*Obs*: A ativação do anti-pornô pode tornar o anti-flood mais lento pois há uma checagem em cada imagem.`,
        mutar: cabecalho + `Ex: *${process.env.PREFIX}mutar* - Liga/desliga a execução de comandos dos membros.`,
        autosticker:
            cabecalho + `Ex: *${process.env.PREFIX}autosticker* - Liga/desliga a criação automatica de stickers sem precisar de comandos.`,
        add:
            cabecalho +
            `Ex: *${process.env.PREFIX}add* 5521xxxxxxxxx - Digite o numero com o código do país para adicionar a pessoa.\n\n` +
            `Ex: *${process.env.PREFIX}add* 5521xxxxxxxxx, 5521xxxxxxxxx - Digite os numeros com o código do país (adiciona mais de uma pessoa no grupo).`,
        ban:
            cabecalho +
            `Ex: *${process.env.PREFIX}ban* @membro - Para banir um membro marcando ele.\n\n` +
            `Ex: Responder alguém com *${process.env.PREFIX}ban* - Bane a pessoa que você respondeu.`,
        rlink: cabecalho + `Ex: *${process.env.PREFIX}rlink* - Redefine o link do grupo.`,
        contador: cabecalho + `Ex: *${process.env.PREFIX}contador* - Liga/desliga a contagem de mensagens no grupo.`,
        atividade:
            cabecalho +
            `Ex: *${process.env.PREFIX}atividade* @membro - Mostra a atividade do membro mencionado.\n\n` +
            `Ex: Responder com *${process.env.PREFIX}atividade* - Mostra a atividade do membro que você respondeu.\n\n` +
            `*Obs*: Este comando só funciona com o *${process.env.PREFIX}contador* ativado.`,
        alterarcont:
            cabecalho +
            `Ex: *${process.env.PREFIX}alterarcont* @membro 50 - Altera a quantidade de mensagens de um membro mencionado para 50 mensagens.\n\n` +
            `Ex: Responder com *${process.env.PREFIX}alterarcont* 20 - Altera a quantidade de mensagens do membro que você respondeu para 20 mensagens.\n\n` +
            `*Obs*: Este comando só funciona com o *${process.env.PREFIX}contador* ativado.`,
        imarcar:
            cabecalho +
            `Ex: *${process.env.PREFIX}imarcar* 5 - Marca todos os membros com menos de 5 mensagens.\n\n` +
            `*Obs*: Este comando só funciona com o *${process.env.PREFIX}contador* ativado.`,
        ibanir:
            cabecalho +
            `Ex: *${process.env.PREFIX}ibanir* 10 - Bane todos os membros com menos de 10 mensagens.\n\n` +
            `*Obs*: Este comando só funciona com o *${process.env.PREFIX}contador* ativado.`,
        topativos:
            cabecalho +
            `Ex: *${process.env.PREFIX}topativos* 10 - Marca os 10 membros com mais mensagens do grupo.\n\n` +
            `*Obs*: Este comando só funciona com o *${process.env.PREFIX}contador* ativado.`,
        enquete:
            cabecalho +
            `Ex: *${process.env.PREFIX}enquete* tema,opcao1,opcao2,opcao3 - Cria uma enquete com um tema e as opções de voto.\n\n` +
            `*Obs*: Digite *${process.env.PREFIX}enquete* novamente para encerrar uma enquete aberta e exibir os resultados finais dela.`,
        votarenquete:
            cabecalho +
            `Ex: *${process.env.PREFIX}votarenquete* 1 - Vota na opção 1 da enquete.\n\n` +
            `*Obs*: Este comando só funciona com uma enquete em aberto.`,
        verenquete: cabecalho + `Ex: *${process.env.PREFIX}verenquete* - Mostra se há alguma enquete em aberto.`,
        votacao: cabecalho + `Ex: *${process.env.PREFIX}votacao* - Mostra se há alguma votação de ban em aberto.`,
        fotogrupo: cabecalho + `Ex: Envie/responda uma *imagem* com *${process.env.PREFIX}fotogrupo* - Altera a foto do grupo.\n\n`,
        votar: cabecalho + `Ex: *${process.env.PREFIX}votar* - Vota no membro que está em votação.`,
        vb:
            cabecalho +
            `Ex: *${process.env.PREFIX}vb* @membro 10 - Abre uma votação de ban em um membro com limite de 10 votos.\n\n` +
            `*Obs*: Digite *${process.env.PREFIX}vb* novamente para encerrar uma votação aberta.`,
        bcmd:
            cabecalho +
            `Ex: *${process.env.PREFIX}bcmd* ${process.env.PREFIX}s ${process.env.PREFIX}sgif ${process.env.PREFIX}play - Bloqueia no grupo os comandos ${process.env.PREFIX}s, ${process.env.PREFIX}sgif e ${process.env.PREFIX}play (você pode escolher os comandos a sua necessidade).\n\n` +
            `Ex: *${process.env.PREFIX}bcmd* figurinhas - Bloqueia todos os comandos da categoria FIGURINHAS.\n\n` +
            `Ex: *${process.env.PREFIX}bcmd* utilidades - Bloqueia todos os comandos da categoria UTILIDADES.\n\n` +
            `Ex: *${process.env.PREFIX}bcmd* downloads - Bloqueia todos os comandos da categoria DOWNLOADS.\n\n` +
            `Ex: *${process.env.PREFIX}bcmd* diversão - Bloqueia todos os comandos da categoria DIVERSÃO.\n\n` +
            `*Obs* : Você não pode bloquear comandos de administrador.`,
        dcmd:
            cabecalho +
            `Ex: *${process.env.PREFIX}dcmd* ${process.env.PREFIX}s ${process.env.PREFIX}sgif ${process.env.PREFIX}play - Desbloqueia no grupo os comandos ${process.env.PREFIX}s, ${process.env.PREFIX}sgif e ${process.env.PREFIX}play.\n\n` +
            `Ex: *${process.env.PREFIX}dcmd* todos - Desbloqueia todos os comandos.\n\n` +
            `Ex: *${process.env.PREFIX}dcmd* figurinhas - Desbloqueia todos os comandos da categoria FIGURINHAS.\n\n` +
            `Ex: *${process.env.PREFIX}dcmd* utilidades - Desbloqueia todos os comandos da categoria UTILIDADES.\n\n` +
            `Ex: *${process.env.PREFIX}dcmd* downloads - Desbloqueia todos os comandos da categoria DOWNLOADS.\n\n` +
            `Ex: *${process.env.PREFIX}dcmd* diversão - Desbloqueia todos os comandos da categoria DIVERSÃO.\n\n` +
            `*Obs* : Verifique os comandos que estão bloqueados com *${process.env.PREFIX}status*.`,
        link: cabecalho + `Ex: *${process.env.PREFIX}link* - Exibe o link do grupo.`,
        adms: cabecalho + `Ex: *${process.env.PREFIX}adms* - Exibe e marca os administradores do grupo.`,
        dono: cabecalho + `Ex: *${process.env.PREFIX}dono* - Exibe e marca o dono do grupo.`,
        mt:
            cabecalho +
            `Ex: *${process.env.PREFIX}mt* - Marca todos os *MEMBROS/ADMIN* do grupo.\n\n` +
            `Ex: *${process.env.PREFIX}mt* mensagem - Marca todos os *MEMBROS/ADMIN* do grupo com uma mensagem.`,
        mm:
            cabecalho +
            `Ex: *${process.env.PREFIX}mm* - Marca todos os *MEMBROS* do grupo.\n\n` +
            `Ex: *${process.env.PREFIX}mm* mensagem - Marca todos os *MEMBROS* do grupo com uma mensagem.`,
        bantodos:
            cabecalho +
            `Ex: *${process.env.PREFIX}bantodos* - Bane todos os membros do grupo.\n\n` +
            `*Obs* : Apenas o dono do grupo pode usar este comando.`,
        promover:
            cabecalho +
            `Ex: *${process.env.PREFIX}promover* @membro - Promove o membro mencionado a *ADMINISTRADOR*.\n\n` +
            `Ex: Responder com *${process.env.PREFIX}promover* - Promove o usuário respondido a *ADMINISTRADOR*.`,
        rebaixar:
            cabecalho +
            `Ex: *${process.env.PREFIX}rebaixar* @admin - Rebaixa o administrador mencionado a *MEMBRO*.\n\n` +
            `Ex: Responder com *${process.env.PREFIX}rebaixar* - Rebaixa o administrador respondido a *MEMBRO*.`,
        apg:
            cabecalho +
            `Ex: Responder com *${process.env.PREFIX}apg* - Apaga a mensagem que foi respondida com esse comando.\n\n` +
            `*Obs* : Esse comando só pode ser usado por administradores.`,
        f: cabecalho + `Ex: *${process.env.PREFIX}f* - Abre/Fecha o grupo.`,
    },
    diversao: {
        detector: cabecalho + `Ex: Responder com *${process.env.PREFIX}detector* - Exibe o resultado da máquina da verdade.`,
        viadometro:
            cabecalho +
            `Ex: *${process.env.PREFIX}viadometro* @membro - Mede o nível de viadagem do membro mencionado.\n\n` +
            `Ex: Responder com *${process.env.PREFIX}viadometro* - Mede o nível de viadagem do membro respondido.`,
        bafometro:
            cabecalho +
            `Ex: *${process.env.PREFIX}bafometro* @membro - Mede o nível de alcool do membro mencionado.\n\n` +
            `Ex: Responder com *${process.env.PREFIX}bafometro* - Mede o nível de alcool do membro respondido.`,
        caracoroa: cabecalho + `Ex: *${process.env.PREFIX}caracoroa* - Decisão no cara ou coroa, exibe o lado da moeda que cair.`,
        chance: cabecalho + `Ex: *${process.env.PREFIX}chance de ficar rico* - Calcula sua chance de um tema aleatório a sua escolha.`,
        ppt:
            cabecalho +
            `Ex: *${process.env.PREFIX}ppt* pedra - Escolhe pedra, para jogar pedra, papel ou tesoura.\n\n` +
            `Ex: *${process.env.PREFIX}ppt* papel - Escolhe papel, para jogar pedra, papel ou tesoura.\n\n` +
            `Ex: *${process.env.PREFIX}ppt* tesoura - Escolhe tesoura, para jogar pedra, papel ou tesoura.`,
        top5: cabecalho + `Ex: *${process.env.PREFIX}top5* tema - Exibe uma ranking de 5 membros aleatórios com o tema que você escolher.`,
        mascote: cabecalho + `Ex: *${process.env.PREFIX}mascote* - Exibe o mascote do BOT.`,
        roletarussa:
            cabecalho +
            `Ex: *${process.env.PREFIX}roletarussa* - Bane um membro aleatório do grupo.\n\n` +
            `*Obs*: Comando apenas para administradores, pode banir qualquer um exceto o dono do grupo e o BOT.`,
        casal: cabecalho + `Ex: *${process.env.PREFIX}casal* - Escolhe 2 pessoas aleatórias do grupo para formar um casal.`,
        par: cabecalho + `Ex: *${process.env.PREFIX}par* @membro1 @membro2 - Mede o nível de compatibilidade dos 2 membros mencionados.`,
        fch:
            cabecalho +
            `Ex: *${process.env.PREFIX}fch* - Exibe uma frase aleatória montada com as cartas do jogo Cartas contra a Humanidade.`,
    },
    admin: {
        admin: cabecalho + `Ex: *${process.env.PREFIX}admin* - Exibe o menu de administração do Bot.`,
        grupos: cabecalho + `Ex: *${process.env.PREFIX}grupos* - Mostra os grupos atuais que o bot está e suas informações.`,
        fotobot: cabecalho + `Ex: Envie/responda uma *imagem* com *${process.env.PREFIX}fotobot* - Altera a foto do BOT.\n\n`,
        infocompleta:
            cabecalho +
            `Ex: *${process.env.PREFIX}infocompleta* - Exibe as informações completas do bot, inclusive as configurações atuais.`,
        entrargrupo: cabecalho + `Ex: *${process.env.PREFIX}entrargrupo* link - Entra em um grupo por link de convite.`,
        sair: cabecalho + `Ex: *${process.env.PREFIX}sair* - Faz o bot sair do grupo.`,
        listablock: cabecalho + `Ex: *${process.env.PREFIX}listablock* - Exibe a lista de usuários bloqueados pelo bot.`,
        limpartudo: cabecalho + `Ex: *${process.env.PREFIX}limpartudo* - Limpa todos os chats (Grupos e Contatos).`,
        bcmdglobal:
            cabecalho +
            `Ex: *${process.env.PREFIX}bcmdglobal* ${process.env.PREFIX}s ${process.env.PREFIX}sgif ${process.env.PREFIX}play - Bloqueia  os comandos ${process.env.PREFIX}s, ${process.env.PREFIX}sgif e ${process.env.PREFIX}play (você pode escolher os comandos a sua necessidade).\n\n` +
            `Ex: *${process.env.PREFIX}bcmdglobal* figurinhas - Bloqueia todos os comandos da categoria FIGURINHAS.\n\n` +
            `Ex: *${process.env.PREFIX}bcmdglobal* utilidades - Bloqueia todos os comandos da categoria UTILIDADES.\n\n` +
            `Ex: *${process.env.PREFIX}bcmdglobal* downloads - Bloqueia todos os comandos da categoria DOWNLOADS.\n\n` +
            `Ex: *${process.env.PREFIX}bcmdglobal* diversão - Bloqueia todos os comandos da categoria DIVERSÃO.\n\n` +
            `*Obs* : Você não pode bloquear comandos de administrador.`,
        dcmdglobal:
            cabecalho +
            `Ex: *${process.env.PREFIX}dcmdglobal* ${process.env.PREFIX}s ${process.env.PREFIX}sgif ${process.env.PREFIX}play - Desbloqueia  os comandos ${process.env.PREFIX}s, ${process.env.PREFIX}sgif e ${process.env.PREFIX}play.\n\n` +
            `Ex: *${process.env.PREFIX}dcmdglobal* todos - Desbloqueia todos os comandos.\n\n` +
            `Ex: *${process.env.PREFIX}dcmdglobal* figurinhas - Desbloqueia todos os comandos da categoria FIGURINHAS.\n\n` +
            `Ex: *${process.env.PREFIX}dcmdglobal* utilidades - Desbloqueia todos os comandos da categoria UTILIDADES.\n\n` +
            `Ex: *${process.env.PREFIX}dcmdglobal* downloads - Desbloqueia todos os comandos da categoria DOWNLOADS.\n\n` +
            `Ex: *${process.env.PREFIX}dcmdglobal* diversão - Desbloqueia todos os comandos da categoria DIVERSÃO.\n\n` +
            `*Obs* : Verifique os comandos que estão bloqueados com ${process.env.PREFIX}infocompleta.`,
        autostickerpv:
            cabecalho +
            `Ex: *${process.env.PREFIX}autostickerpv* - Liga/desliga a criação automatica de stickers sem precisar de comandos no privado.`,
        pvliberado: cabecalho + `Ex: *${process.env.PREFIX}pvliberado* - Liga/desliga os comandos em MENSAGENS PRIVADAS.`,
        antitravapv:
            cabecalho +
            `Ex: *${process.env.PREFIX}antitravapv* - Liga/desliga o anti-trava no privado para no máximo 1500 caracteres por mensagem.\n\n` +
            `Ex : *${process.env.PREFIX}antitravapv* 500 - Configura o anti-trava no privado para no máximo 500 caracteres por mensagem.`,
        limpar: cabecalho + `Ex: *${process.env.PREFIX}limpar* - Limpa todos os chats de contatos.`,
        rconfig: cabecalho + `Ex: *${process.env.PREFIX}rconfig* - Reseta a configuração de todos os grupos.`,
        sairgrupos: cabecalho + `Ex: *${process.env.PREFIX}sairgrupos* - Sai de todos os grupos.`,
        bloquear:
            cabecalho +
            `Ex: *${process.env.PREFIX}bloquear* @membro - Para o bot bloquear o membro mencionado.\n\n` +
            `Ex: *${process.env.PREFIX}bloquear* +55 (xx) xxxxx-xxxx - Para o bot bloquear o número digitado.\n\n` +
            `Ex: Responder alguém com *${process.env.PREFIX}bloquear* - Para o bot bloquear o membro que você respondeu.`,
        desbloquear:
            cabecalho +
            `Ex: *${process.env.PREFIX}desbloquear* @membro - Para o bot desbloquear o membro mencionado.\n\n` +
            `Ex: *${process.env.PREFIX}desbloquear* +55 (xx) xxxxx-xxxx - Para o bot desbloquear o número digitado.\n\n` +
            `Ex: Responder alguém com *${process.env.PREFIX}desbloquear* - Para o bot desbloquear o membro que você respondeu.`,
        usuarios:
            cabecalho +
            `Ex: *${process.env.PREFIX}usuarios* bronze - Mostra todos os usuários do tipo *BRONZE*.\n\n` +
            `*Obs*: Use o *${process.env.PREFIX}tipos* para ver os tipos disponíveis de usuários.`,
        limitediario: cabecalho + `Ex: *${process.env.PREFIX}limitediario* - Ativa/desativa o limite diario de comandos.`,
        taxalimite:
            cabecalho +
            `Ex: *${process.env.PREFIX}taxalimite* 5 60 - Ativa a taxa limite de comandos para 5 comandos a cada minuto por usuário, caso o usuário ultrapasse ele fica 60 segundos impossibilitado de fazer comandos.\n\n` +
            `*Obs*: Digite *${process.env.PREFIX}taxalimite* novamente para desativar a taxa limite de comandos.`,
        limitarmsgs:
            cabecalho +
            `Ex: *${process.env.PREFIX}limitarmsgs* 10 10 - Ativa o limite de mensagens privadas em 10 mensagens a cada 10 segundos, se o usuário ultrapassar ele será bloqueado.\n\n` +
            `*Obs*: Digite *${process.env.PREFIX}limitarmsgs* novamente para desativar o limite de mensagens privadas.`,
        tipos:
            cabecalho +
            `Ex: *${process.env.PREFIX}tipos* - Exibe os tipos de usuários disponíveis e quantos comandos estão configurados por dia.`,
        limpartipo:
            cabecalho +
            `Ex: *${process.env.PREFIX}limpartipo* ouro - Transforma todos os usuários do tipo *OURO* em *BRONZE*.\n\n` +
            `*Obs*: Use o *${process.env.PREFIX}tipos* para ver os tipos disponíveis de usuários.`,
        mudarlimite:
            cabecalho +
            `Ex: *${process.env.PREFIX}mudarlimite* bronze 50 - Altera o limite diário de comandos do usuário *BRONZE* para 50/dia.\n\n` +
            `*Obs*: O comando de *${process.env.PREFIX}limitediario* deve estar ativado.\n` +
            `*Obs²*: Verifique os tipos disponíveis de usuários em *${process.env.PREFIX}tipos*.\n` +
            `*Obs³*: Para ficar sem limite de comandos digite -1 no campo de limite.`,
        alterartipo:
            cabecalho +
            `Ex: *${process.env.PREFIX}alterartipo* ouro @usuario - Altera o tipo do usuário mencionado para *OURO*.\n\n` +
            `Ex: Responder com *${process.env.PREFIX}alterartipo* bronze - Altera o tipo do usuário respondido para *BRONZE*.\n\n` +
            `Ex: *${process.env.PREFIX}alterartipo* prata  55219xxxxxxxx - Altera o tipo do usuário do número para *PRATA*.\n\n` +
            `*Obs*: Use o *${process.env.PREFIX}tipos* para ver os tipos disponíveis de usuários.`,
        rtodos:
            cabecalho +
            `Ex: *${process.env.PREFIX}rtodos* - Reseta os comandos diários de todos os usuários.\n\n` +
            `*Obs*: O comando de *${process.env.PREFIX}limitediario* deve estar ativado.`,
        r:
            cabecalho +
            `Ex: *${process.env.PREFIX}r* @usuario - Reseta os comandos diários de um usuário mencionado.\n\n` +
            `Ex: Responder com *${process.env.PREFIX}r* - Reseta os comandos diários do usuário respondido.\n\n` +
            `Ex: *${process.env.PREFIX}r* 55219xxxxxxxx - Reseta os comandos diários do usuário com esse número.\n\n` +
            `*Obs*: O comando de *${process.env.PREFIX}limitediario* deve estar ativado.`,
        verdados:
            cabecalho +
            `Ex: *${process.env.PREFIX}verdados* @usuario - Mostra os dados gerais do usuário mencionado.\n\n` +
            `Ex: Responder com *${process.env.PREFIX}verdados* - Mostra os dados gerais do usuário respondido.\n\n` +
            `Ex: *${process.env.PREFIX}verdados* 55219xxxxxxxx - Mostra os dados gerais do usuário com esse número.`,
        bctodos: cabecalho + `Ex: *${process.env.PREFIX}bctodos* mensagem - Envia uma mensagem para todos os *GRUPOS E CONTATOS*.`,
        bcgrupos: cabecalho + `Ex: *${process.env.PREFIX}bcgrupos* mensagem - Envia uma mensagem para todos os *GRUPOS*.`,
        bccontatos: cabecalho + `Ex: *${process.env.PREFIX}bccontatos* mensagem - Envia uma mensagem para todos os *CONTATOS*.`,
        print: cabecalho + `Ex: *${process.env.PREFIX}print* - Tira uma print do WhatsApp Web do BOT e envia.`,
        estado:
            cabecalho +
            `Ex: *${process.env.PREFIX}estado* online - Muda o status do bot para ONLINE.\n\n` +
            `Ex: *${process.env.PREFIX}estado* offline - Muda o status do bot para OFFLINE.\n\n` +
            `Ex: *${process.env.PREFIX}estado* manutencao - Muda o status do bot para MANUTENCÃO.`,
        desligar: cabecalho + `Ex: *${process.env.PREFIX}desligar* - Desliga o BOT.`,
        ping: cabecalho + `Ex: *${process.env.PREFIX}ping* - Exibe as informações do sistema do BOT e o tempo de resposta dele.`,
    },
};

export const guiaComandoMsg = (tipo: string, comando: string): string | undefined => {
    comando = comando.replace(`${process.env.PREFIX}`, ``);
    const msgGuia = guias[tipo]?.[comando];
    return msgGuia;
};

export default guias;
