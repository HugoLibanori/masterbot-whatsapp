<h1> BOT BRASILEIRO PARA ADMINISTRAÇÃO DE GRUPOS, COM VARIOS COMANDOS.

## REQUERIMENTOS :

-   Um número de celular secundário para usar o bot.
-   [NODE VERSÃO LTS](https://nodejs.org/en/)
-   [GOOGLE CHROME](https://www.google.com/intl/pt-BR/chrome/)
-   [FFMPEG](https://www.ffmpeg.org/download.html)

Isso tudo é necessário para o bot funcionar corretamente.

## 1 - Faça download da ultima versão :

Faça o download da última versão lançada no link abaixo (extraia o zip e entre na pasta para os passos seguintes):
https://github.com/HugoLibanori/masterbot-whatsapp

<br>

## 2 - Instale as dependências :

Abra o prompt de comando (CMD/Terminal) na pasta do projeto que você extraiu e execute o comando abaixo :

```bash
npm i
```

#### Obs: Se houver algum erro verifique as dependências estão todas instaladas.

<br>

## 3 - Uso :

Dentro da pasta do projeto após ter realizado todos os passos anteriores, execute este comando.

```bash
npm start
```

Se for a sua primeira vez executando escaneie o QR Code com o seu celular (No modo BETA que não exige conexão com o celular) e digite no terminal **SEU** número de telefone **COM CÓDIGO DO PAÍS** no terminal. Ele irá encerrar o bot e você deverá inicia-lo novamente.

<br>

## 4 - Funcionamento :

Após todos os passos anteriores feitos, seu bot já deve estar iniciando normalmente, use os comandos abaixo para visualizar os comandos disponíveis.
<br><br>
**!menu** - Dá acesso ao MENU PRINCIPAL.
<br>
**!admin** - Dá acesso ao MENU de ADMINISTRADOR/DONO DO BOT.
<br><br>
Todos os comandos agora tem um guia ao digitar **!comando guia**

### Pronto! Seu bot já está funcionando!!

<br>

Para que o comando **!figurinhas** funcione, adicione imagens dentro da pasta 'figurinhas', que se encontra na raiz do projeto. caso não tenha crie essa pasta.

<br>

## 5 - Configuração do arquivo .env :

#### Abra o arquivo .env na raiz do projeto e edite manualmente : </br>

        #############  DADOS DO BOT #############

        NOME_ADMINISTRADOR=M@ste® Bot
        NOME_BOT=M@ste® Bot
        NOME_AUTOR_FIGURINHAS = M@ste® Bot

        ############ PREFIXO DO BOT #############
        PREFIX="!"

        ############ CONFIGURAÇÕES DO BOT #############

        # LEMBRE-SE SEU NÚMERO DE WHATSAPP E NÃO O DO BOT. (COM CÓDIGO DO PAÍS INCLUÍDO)

        NUMERO_DONO=??????

        # NEWSAPI- Coloque abaixo sua chave API do site newsapi.org (NOTICIAIS ATUAIS)

        API_NEWS_ORG=??????

        # API REMOVEBG - coloque sua api removebg aqui
        API_REMOVEBG=??????

        ############ PATH GOOGLE CHROME ##############
        PATH_CHROME_WIN='C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'

**Obs**: Se o seu sistema for MAC, habilite a exibição de arquivos ocultos para exibir o .env na raiz do projeto.<br>

Configure o caminho do PATH_CHROME_WIN para não haver erros, por padrão ele vem com path do windows. Se seu sistema for diferente mude-o.

<br>

#### Caso você queira usar o bot com PM2 rode o comando: <br>

```bash
npx tsc
```

#### Isso compilará os arquivos da pasta ./dist. Lá, serão criados todos os arquivos em JS. Em seguida,

#### rode o comando:<br>

```bash
pm2 start ./dist/app.js
```

#### Assim o bot vai rodar normal.

<br>

## 6 - Recursos Principais :

### Figurinhas

| Criador de Sticker |           Recursos            |
| :----------------: | :---------------------------: |
|         ✅         |       Foto para Sticker       |
|         ✅         |       Sticker para foto       |
|         ✅         |      Texto para Sticker       |
|         ✅         |  Texto para Sticker Animado   |
|         ✅         |    Video/GIF para Sticker     |
|         ✅         | Foto para Sticker (Sem fundo) |

### Downloads

| Downloads |                Recursos                |
| :-------: | :------------------------------------: |
|    ✅     |   Download de aúdio/videos (Youtube)   |
|    ✅     |     Download de videos (Facebook)      |
|    ✅     | Download de imagens/videos (Instagram) |
|    ✅     |      Pesquisa/Download de Imagens      |

### Utilidades Gerais

| Utilitários |    Recursos    |
| :---------: | :------------: |
|     ✅      | Texto para voz |
|     ✅      |  Pesquisa Web  |

### Administração de Grupo

| Apenas Grupo |            Recursos            |
| :----------: | :----------------------------: |
|      ✅      |        Promover usuário        |
|      ✅      |        Rebaixar usuário        |
|      ✅      |        Remover usuário         |
|      ✅      |       Adicionar usuário        |
|      ✅      |          Marcar todos          |
|      ✅      |      Obter link do grupo       |
|      ✅      |    Redefinir link do grupo     |
|      ✅      | Obter lista de administradores |
|      ✅      |      Obter dono do grupo       |
|      ✅      |          Mutar Grupo           |
|      ✅      |           Bem Vindo            |
|      ✅      |          Auto Sticker          |
|      ✅      |           Anti Fake            |
|      ✅      |           Anti Link            |
|      ❌      |     Contagem de mensagens      |
|      ❌      |        Marcar inativos         |
|      ❌      |         Banir inativos         |
|      ❌      | Bloquear/Desbloquear Comandos  |
|      ❌      |          Banir Todos           |
|      ✅      |        Apagar mensagens        |

### Administração de Dono

| Apenas Dono do Bot |           Recurso            |
| :----------------: | :--------------------------: |
|         ❌         |      Entrar em um grupo      |
|         ❌         |   Sair de todos os grupos    |
|         ❌         |  Broadcast - Anuncio Geral   |
|         ❌         | Bloquear/Desbloquear usuário |
|         ❌         | Sistema de Tipos de Usuários |
|         ✅         |     Auto Sticker Privado     |
|         ✅         |        Sair do grupo         |

<br>

## 8 - Agradecimentos

-   [`whatsapp-web.js`](https://github.com/pedroslopez/whatsapp-web.js)
