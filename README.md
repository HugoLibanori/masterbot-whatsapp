<h1 aling="center">M@ste® Bot - Automatizando grupos de whatsapp!</h1>

---

## ✅ Requisitos:

- Nodejs LTS instalado.
- Ffmpeg instalado.
- Git instalado.
- Docker e Docker Compose instalado.
- Um numero do whatsapp para conectar ao bot.

---

## 🧩 Instalação

### Windows/Linux

Faça o download da última versão do bot [clicando aqui](https://github.com/HugoLibanori/masterbot-whatsapp/), e com o terminal aberto, entre na pasta do bot.

Instale as dependências:

```bash
npm i
```

Depois que instalar os modulos você digita:

```bash
npm start
```

Leia o QRCode e depois espere ele criar o arquivo .env com os dados do banco de dados. Preecha o arquivo conforme sua nescessidade.

ex:

```bash
DATABASE=BOT_TESTE
DATABASE_USERNAME=root
DATABASE_PASSWORD=123456
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_DIALECT=mysql
```

<br>

## 2 - 💾 Banco de Dados

### Mysql

<p>
Você deve ter o Docker instalado no seu sistema, o bot usa o Sequelize para banco de dados.
</p>

###### A - Depois que o arquivo estiver preenchido, rode os comandos abaixo:

obs: você deve entrar dentro da pasta do bot.

```bash
docker compose up -d
```

Este comando irá criar o banco de dados com o nome que esta no arquivo docker-compose.yml que é BOT_TESTE. mude conforme sua nescessidade!

```bash
npx sequelize db:create
```

Ele cria o banco de dados, agora rode:

```bash
npx sequelize db:migrate
```

Cria as tabelas do BD.

Pronto, se não ocorreu nenhum erro seu banco de dados foi criado.

## 3 - 🚀 Iniciando o Bot

Depois de tudo configurado certinho rode o comando abaixo e inicie seu bot.

```bash
npm start
```

Pronto, seu bot esta pronto para uso.

---

## 📚 Comandos Disponíveis

Aqui estão alguns dos comandos mais importantes com exemplos de uso:

#### 🖼️ MENU FIGURINHAS

Transforme imagens, vídeos ou texto em figurinhas com diversos estilos:

```bash
!s # Transformar imagem/vídeo em figurinha
!s 1 # Recorta vídeo/GIF
!s 2 # Sticker circular
!snome pack, autor # Renomeia o sticker
!simg # Sticker → Foto
!ssf # Sticker sem fundo
!emojimix 💩+😀 # 2 Emojis → Sticker
!emojimg 😀 # Emoji → Sticker
!tps texto # Texto → Sticker
!atps texto # Texto → Sticker animado
!smeme textoCima, textoBaixo # Meme em sticker
!nomepack nome # Define nome do pack
!nomeautor autor # Define autor do sticker

```

#### ⚒️ MENU UTILIDADES

Ferramentas úteis de imagem e voz:

```bash
!voz idioma texto # Texto → Áudio
!rbg # Remove o fundo da imagem
```

#### 📥 MENU DOWNLOADS

Baixe vídeos, músicas e imagens com facilidade:

```bash
!play nome # Baixa música
!yt nome # Baixa vídeo do YouTube
!fb link # Baixa vídeo do Facebook
!ig link # Baixa mídia do Instagram
!img tema # Baixa imagem por tema
```

#### 👨‍👩‍👧‍👦 MENU GRUPO (admin)

Gerencie seu grupo com funções avançadas (admin)

```bash
!status # Ver status dos recursos
!regras # Regras do grupo
!adms # Lista de admins
!fotogrupo # Alterar foto do grupo
!mt mensagem # Mencionar todos (ADM/Membros)
!mm mensagem # Mencionar apenas membros
!dono # Mostra dono do grupo
!fixar # Fixa uma mensagem
!desfixar # Desfixa mensagem
```

###### CONTROLE DE ATIVIDADE

```bash
!contador # Liga/desliga contador
!atividade @user # Atividade do usuário
!imarcar 1-50 # Marca inativos
!ibanir 1-50 # Bane inativos
!topativos 1-50 # Ranking mais ativos
```

###### BLOQUEIO DE COMANDOS

```bash
!bcmd comandos # Bloqueia comandos
!dcmd comandos # Desbloqueia comandos
```

###### LISTA NEGRA

```bash
!listanegra # Ver lista negra
!addlista número # Adicionar número à lista negra
!remlista número # Remover número da
```

###### RECURSOS

```bash
!mutar # Ativar/desativar comandos
!autosticker # Sticker automático
!alink # Anti-link
!aporno # Anti-pornô
!bv # Mensagem de boas-vindas
!afake # Anti-fake
!aflood # Anti-flood
```

#### 👑 MENU ADMIN (Administração do bot)

```bash
!nomebot nome # Altera nome do bot e atualiza menus
!nomeadm nome # Altera nome do administrador e atualiza menus
!nomesticker nome # Altera nome do pacote de figurinhas
!prefixo símbolo # Altera o prefixo dos comandos
!fotobot # Altera foto do BOT

!infobot # Informação completa do BOT
!bloquear @usuario # Bloqueia o usuário mencionado
!desbloquear @usuario # Desbloqueia o usuário mencionado
!listablock # Lista usuários bloqueados
!bcgrupos mensagem # Envia mensagem de broadcast para todos os grupos

!verdados @usuario # Mostra os dados de um usuário
!usuarios tipo # Lista usuários de determinado tipo
!tipos # Lista todos os tipos de usuário
!novotipo tipo,titulo,cmds # Cria novo tipo de usuário
!tipotitulo tipo,titulo # Altera título de um tipo de usuário
!deltipo tipo # Remove tipo de usuário
!usuariotipo tipo @usuario # Altera tipo de usuário
!limpartipo tipo # Remove todos usuários desse tipo
!limparcomandos # Limpa os comandos de todos os usuários

!bcmdglobal cmd1 cmd2 # Bloqueia comandos globalmente
!dcmdglobal cmd1 cmd2 # Desbloqueia comandos globalmente

!limitediario # Ativa/desativa limite diário de comandos
!tipocomandos tipo qtd # Define limite de comandos por tipo
!rtodos # Reseta comandos diários de todos usuários
!r @usuario # Reseta comandos diários de um usuário

!taxacomandos quantidade # Define taxa de comandos por minuto

!pvliberado # Ativa/desativa comandos em mensagens privadas
!autostickerpv # Ativa/desativa stickers automáticos no PV

!grupos # Lista os grupos onde o BOT está
!linkgrupo número # Mostra o link de um grupo
!sair # Sai do grupo atual
!sairgrupos # Sai de todos os grupos
!entrargrupo link # Entra em um grupo pelo link
!addgrupo link # Libera o BOT para funcionar em grupo
!removegrupo nome # Remove o BOT do grupo
!alterarexp link # Adiciona mais 30 dias ao grupo
!oficialgrupo link # Marca grupo como oficial do BOT
!statusverificados # Mostra grupos autorizados a usar o BOT
!apis nomeApi valorApi # Define a apiKey da api
```

---

## 🙏 Agradecimentos

- [Baileys](https://github.com/WhiskeySockets/Baileys) - Biblioteca de uso para conexão ao whatsapp

- [LBot-whatsapp](https://github.com/victorsouzaleal/lbot-whatsapp) - Bot que me basiei para esse projeto com algumas alterações prórpias.
