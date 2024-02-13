import prompt from 'prompt';
import * as fs from 'fs-extra';
import * as path from 'path';
import { corTexto } from './util';

interface CriacaoEnvResult {
    numero_dono: string;
    newsapi: string;
    acrcloud: string;
    deepai: string;
}

const criacaoEnv = async (): Promise<void> => {
    const schema = {
        properties: {
            numero_dono: {
                description: corTexto(
                    'Digite seu número de WhatsApp com o código do país incluído - ex: 55219xxxxxxxx. (O SEU NÚMERO E NÃO O DO BOT) ',
                ),
                required: true,
            },
        },
    };

    const { numero_dono } = await prompt.get(schema);

    const envContent =
        '#############  DADOS DO BOT #############\n\n' +
        'NOME_ADMINISTRADOR=M@ste® Bot\n' +
        'NOME_BOT=M@ste® Bot\n' +
        'NOME_AUTOR_FIGURINHAS = M@ste® Bot\n\n' +
        '############ PREFIXO DO BOT #############\n' +
        'PREFIX="!"\n\n' +
        '############ CONFIGURAÇÕES DO BOT #############\n\n' +
        '# LEMBRE-SE SEU NÚMERO DE WHATSAPP E NÃO O DO BOT. (COM CÓDIGO DO PAÍS INCLUÍDO)\n' +
        'NUMERO_DONO=' +
        numero_dono +
        '\n' +
        '# NEWSAPI- Coloque abaixo sua chave API do site newsapi.org (NOTICIAIS ATUAIS)\n' +
        'API_NEWS_ORG=??????\n' +
        '# ACRCLOUD - Coloque abaixo suas chaves do ACRCloud (Reconhecimento de Músicas)\n' +
        'acr_host=??????\n' +
        'acr_access_key=??????\n' +
        'acr_access_secret=??????\n' +
        '# DEEPAI- Coloque abaixo sua chave do deepai.org (Detector de nudez/pornografia)\n' +
        'API_DEEPAI=??????\n\n' +
        'API_REMOVEBG=??????\n\n' +
        '############ PATH GOOGLE CHROME ##############\n' +
        `PATH_CHROME='C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'`;

    await fs.writeFile(path.resolve('.env'), envContent, 'utf8');
};

const verificarEnv = (): void => {
    const numDono = process.env.NUMERO_DONO ?? 'SEM NUMERO';
    const newsApi = process.env.API_NEWS_ORG ?? 'SEM API_NEWS';
    const acrHost = process.env.acr_host ?? 'SEM_ACR_HOST';
    const acrAccess = process.env.acr_access_key ?? 'SEM_ACR_ACCESS';
    const acrSecret = process.env.acr_access_secret ?? 'SEM_ACR_SECRET';
    const apiDeepai = process.env.API_DEEPAI ?? 'SEM_API_DEEPAI';

    const resposta: CriacaoEnvResult = {
        numero_dono: numDono.trim() == '55219xxxxxxxx' ? 'O número do DONO ainda não foi configurado' : '✓ Número do DONO configurado.',
        newsapi: newsApi.trim() == '??????' ? 'A API do NEWSAPI ainda não foi configurada' : '✓ API NEWSAPI Configurada.',
        acrcloud:
            acrHost.trim() == '??????' || acrAccess.trim() == '??????' || acrSecret.trim() == '??????'
                ? 'A API do ACRCloud ainda não foi configurada corretamente'
                : '✓ API ACRCloud Configurada.',
        deepai: apiDeepai.trim() == '??????' ? 'A API do DEEPAI ainda não foi configurada' : '✓ API DEEPAI Configurada.',
    };

    console.log('[ENV]', corTexto(resposta.numero_dono));
    console.log('[ENV]', corTexto(resposta.newsapi));
    console.log('[ENV]', corTexto(resposta.acrcloud));
    console.log('[ENV]', corTexto(resposta.deepai));
};

export { criacaoEnv, verificarEnv };
