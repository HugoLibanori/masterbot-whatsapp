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

const client: Client = new Client({
    authStrategy: new LocalAuth({
        dataPath: 'session',
    }),
    puppeteer: {
        executablePath: process.env.PATH_CHROME_WIN || undefined,
        args: ['--no-sandbox'],
    },
    webVersionCache: {
        type: 'local',
        path: 'session',
    },
    qrMaxRetries: 10,
});

client.on('qr', (qr: string) => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', async () => {
    console.log('Cliente conectado!');
    const necessitaCriar = await criarArquivosNecessarios();
    if (necessitaCriar) {
        console.log(corTexto(msgs_texto.inicio.arquivos_criados));
        setTimeout(() => {
            return client.destroy();
        }, 5000);
    } else {
        console.log(corTexto(await atualizarParticipantes(client)));
        console.log(corTexto(await cadastrarGrupo(client, 'inicio')));
    }
});

// Ouvindo mensagens!
client.on('message', async (message: any) => {
    // console.log(await client.getBlockedContacts());
    if (!(await new AntiLink().antiLink(client, message))) return;
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
        new BemVindo().bemVindo(client, add, g_info);
        new AntiFake().antiFake(client, add, g_info);
        if (await participanteExiste(add.chatId, add.recipientIds[0])) return;
        await adicionarParticipante(add.chatId, add.recipientIds[0]);
    } else {
        await removerParticipante(add.chatId, add.recipientIds[0]);
    }
});

client.initialize();
