import { Client, LocalAuth, Call, GroupNotification, Contact } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import { ChamandoComandos } from './src/chamandoComandos';
import { ChecandoMensagens } from './src/checandoMensagens';
import { criarArquivosNecessarios, corTexto } from './src/util';
import msgs_texto from './src/msgs';
import { atualizarParticipantes, participanteExiste, adicionarParticipante, removerParticipante } from './src/controleParticipante';
import { cadastrarGrupo } from './src/cadastrarGrupo';
import db from './src/dataBase';
import BemVindo from './src/bemVindo';
import AntiFake from './src/antifake';
import AntiLink from './src/alink';
import AntiPorno from './src/antiporno';
import { verificarEnv } from './src/env';
import { verificarUsuarioListaNegra, verificacaoListaNegraGeral } from './src/listaNegra';
import bot from './src/bot';

const client: Client = new Client({
    authStrategy: new LocalAuth({
        dataPath: 'session',
    }),
    webVersionCache: {
        type: 'local',
        path: 'session',
    },
    puppeteer: {
        executablePath: process.env.PATH_CHROME || undefined,
        args: [
            '--no-sandbox',
            '--disable-client-side-phishing-detection',
            '--disable-setuid-sandbox',
            '--disable-component-update',
            '--disable-default-apps',
            '--disable-popup-blocking',
            '--disable-offer-store-unmasked-wallet-cards',
            '--disable-speech-api',
            '--hide-scrollbars',
            '--mute-audio',
            '--disable-extensions',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-default-browser-check',
            '--no-pings',
            '--password-store=basic',
            '--use-mock-keychain',
            '--no-zygote',
            // '--single-process',
            '--disable-gpu', // disable this if headless is false
            '--disable-sync',
            '--disable-ipc-flooding-protection',
        ],
    },
    qrMaxRetries: 10,
});

client.on('qr', (qr: string) => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', async () => {
    console.log('© Cliente conectado!');
    const necessitaCriar = await criarArquivosNecessarios();
    if (necessitaCriar) {
        console.log(corTexto(msgs_texto.inicio.arquivos_criados));
        setTimeout(() => {
            return client.destroy();
        }, 5000);
    } else {
        //Cadastro de grupos
        console.log(corTexto(await cadastrarGrupo(client, 'inicio')));
        //Verificar lista negra dos grupos
        console.log(corTexto(await verificacaoListaNegraGeral(client)));
        //Atualização dos participantes dos grupos
        console.log(corTexto(await atualizarParticipantes(client)));
        //Pegando hora de inicialização do BOT
        console.log(corTexto(await bot.botStart()));
        //Verificando se os campos do .env foram modificados e envia para o console
        verificarEnv();
    }
});

client.on('authenticated', () => {
    console.log('©  Autenticado');
});

client.on('auth_failure', function () {
    console.error('©  Falha na autenticação');
});

client.on('change_state', state => {
    console.log('©  Status de conexão: ', state);
});

client.on('disconnected', reason => {
    console.log('©  Cliente desconectado', reason);
    client.initialize();
});

// Ouvindo mensagens!
client.on('message', async (message: any) => {
    try {
        if (!(await new AntiLink().antiLink(client, message))) return;
        if (!(await new AntiPorno().antiPorno(client, message))) return;
        if (!(await new ChecandoMensagens().start(client, message))) return;
        await new ChamandoComandos().start(client, message);
    } catch (erro: any) {
        console.error('Erro ao ouvir mensagens:', erro);
    }
});

// OUVINDO LIGAÇÕES
client.on('call', async (call: Call) => {
    try {
        if (call.from === undefined) return;
        await client.sendMessage(call.from, msgs_texto.geral.sem_ligacoes);
        await call.reject();
        const block = call as unknown;
        const castBlock = block as Contact;
        await castBlock.block();
    } catch (erro) {
        console.error('Erro com ligações:', erro);
    }
});

client.on('group_join', async (ev: GroupNotification) => {
    try {
        const g_info = await db.obterGrupo(ev.chatId);
        if (ev.type === 'add' || ev.type === 'invite') {
            if (!(await new AntiFake().antiFake(client, ev, g_info))) return;
            if (!(await verificarUsuarioListaNegra(client, ev))) return;
            new BemVindo().bemVindo(client, ev, g_info);
            if (
                await participanteExiste(
                    ev.chatId,
                    ev.recipientIds.reduce(id => id),
                )
            )
                return;
            if (g_info.contador.status)
                await db.removerContagem(
                    ev.chatId,
                    ev.recipientIds.reduce(id => id),
                );
            await adicionarParticipante(
                ev.chatId,
                ev.recipientIds.reduce(id => id),
            );
        } else if (ev.type === 'remove') {
            await removerParticipante(
                ev.chatId,
                ev.recipientIds.reduce(id => id),
            );
            if (g_info.contador.status)
                await db.removerContagem(
                    ev.chatId,
                    ev.recipientIds.reduce(id => id),
                );
        }
    } catch (erro: any) {
        console.error('Erro entrada/saída de grupos:', erro);
    }
});

client.initialize();
