import { Client, LocalAuth, Call, Message, GroupNotification } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import { ChamandoComandos } from './src/chamandoComandos';
import { ChecandoMensagens } from './src/checandoMensagens';
import { criarArquivosNecessarios, corTexto } from './src/util';
import msgs_texto from './src/msgs';
import { atualizarParticipantes } from './src/controleParticipante';
import { cadastrarGrupo } from './src/cadastrarGrupo';
import db from './src/dataBase';
import BemVindo from './src/bemVindo';
import AntiFake from './src/antifake';

const client: Client = new Client({
    authStrategy: new LocalAuth({
        dataPath: 'session',
    }),
    puppeteer: {
        executablePath: process.env.PATH_CHROME,
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
            return client.logout();
        }, 5000);
    } else {
        console.log(corTexto(await atualizarParticipantes(client)));
        console.log(corTexto(await cadastrarGrupo(client, 'inicio')));
    }
});

// Ouvindo mensagens!
client.on('message', async (message: Message) => {
    if (!(await new ChecandoMensagens().start(client, message))) return;
    await new ChamandoComandos().start(client, message);
});

// OUVINDO LIGAÇÕES
client.on('call', async (call: Call) => {
    if (call.from === undefined) return;
    await client.sendMessage(call.from, msgs_texto.geral.sem_ligacoes);
    await call.reject();
});

client.on('group_join', async (add: GroupNotification) => {
    const g_info = await db.obterGrupo(add.chatId);
    if (add.type === 'add' || add.type === 'invite') {
        new BemVindo().bemVindo(client, add, g_info);
        new AntiFake().antiFake(client, add, g_info);
    }
});

client.initialize();
