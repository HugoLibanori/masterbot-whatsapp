<h1 aling="center">M@ste® Bot - Automatizando grupos de whatsapp!</h1>

---

## ✅ Requisitos:

- Nodejs LTS instalado.
- Ffmpeg instalado.
- Git instalado.
- Docker instalado.
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

#### 🖼️ Menu Figurinhas

Transforme imagens, vídeos ou texto em figurinhas com diversos estilos:

```bash
!s # Transformar imagem/vídeo em figurinha
!s 1 # Recorta vídeo/GIF
!s 2 # Sticker circular
!snome pack, autor# Renomeia o sticker
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

#### ⚒️ Menu Utilidades

Ferramentas úteis de imagem e voz:

```bash
!voz idioma texto # Texto → Áudio
!rbg # Remove o fundo da imagem
```

#### 📥 Menu Downloads

Baixe vídeos, músicas e imagens com facilidade:

```bash
!play nome # Baixa música
!yt nome # Baixa vídeo do YouTube
!fb link # Baixa vídeo do Facebook
!ig link # Baixa mídia do Instagram
!img tema # Baixa imagem por tema
```

#### 👨‍👩‍👧‍👦 Menu Grupo (admin)

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
