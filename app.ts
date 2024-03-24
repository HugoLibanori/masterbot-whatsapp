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
import { verificarUsuarioListaNegra } from './src/listaNegra';
import { from } from 'form-data';

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

client.on('loading_screen', (percent, message) => {
    console.log('LOADING SCREEN:', percent, message);
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

client.on('ready', async () => {
    console.log('© Cliente conectado!');
    const necessitaCriar = await criarArquivosNecessarios();
    if (necessitaCriar) {
        console.log(corTexto(msgs_texto.inicio.arquivos_criados));
        setTimeout(() => {
            return client.destroy();
        }, 5000);
    } else {
        console.log(corTexto(await atualizarParticipantes(client)));
        console.log(corTexto(await cadastrarGrupo(client, 'inicio')));
        verificarEnv();
    }
});

client.on('disconnected', reason => {
    console.log('©  Cliente desconectado', reason);
    client.initialize();
});

// Ouvindo mensagens!
client.on('message', async (message: any) => {
    if (!(await new AntiLink().antiLink(client, message))) return;
    if (!(await new AntiPorno().antiPorno(client, message))) return;
    if (!(await new ChecandoMensagens().start(client, message))) return;
    await new ChamandoComandos().start(client, message);
});

// OUVINDO LIGAÇÕES
client.on('call', async (call: Call) => {
    if (call.from === undefined) return;
    await client.sendMessage(call.from, msgs_texto.geral.sem_ligacoes);
    await call.reject();
    const block = call as unknown;
    const castBlock = block as Contact;
    await castBlock.block();
});

client.on('group_join', async (add: GroupNotification) => {
    const g_info = await db.obterGrupo(add.chatId);
    if (add.type === 'add' || add.type === 'invite') {
        if (!(await new AntiFake().antiFake(client, add, g_info))) return;
        if (!(await verificarUsuarioListaNegra(client, add))) return;
        new BemVindo().bemVindo(client, add, g_info);
        if (
            await participanteExiste(
                add.chatId,
                add.recipientIds.reduce(id => id),
            )
        )
            return;
        if (g_info.contador.status)
            await db.removerContagem(
                add.chatId,
                add.recipientIds.reduce(id => id),
            );
        await adicionarParticipante(
            add.chatId,
            add.recipientIds.reduce(id => id),
        );
    } else if (add.type === 'remove') {
        await removerParticipante(
            add.chatId,
            add.recipientIds.reduce(id => id),
        );
        if (g_info.contador.status)
            await db.removerContagem(
                add.chatId,
                add.recipientIds.reduce(id => id),
            );
    }
});

client.initialize();
