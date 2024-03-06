import prompt from 'prompt';
import * as fs from 'fs-extra';
import * as path from 'path';
import { corTexto } from './util';

interface CriacaoEnvResult {
    numero_dono: string;
    newsapi: string;
    apiremovebg: string;
    apiapornouser: string;
    apiapornosecret: string;
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
        'API_NEWS_ORG=??????\n\n' +
        '# API REMOVEBG - coloque sua api removebg aqui\n' +
        'API_REMOVEBG=??????\n\n' +
        '############ PATH GOOGLE CHROME ##############\n' +
        `PATH_CHROME=??????\n\n` +
        '############ API SITE https://sightengine.com/ PARA ANTIPORNO ##############\n' +
        'API_USER=??????\n' +
        'API_SECRET=??????';

    await fs.writeFile(path.resolve('.env'), envContent, 'utf8');
};

const verificarEnv = (): void => {
    const numDono = process.env.NUMERO_DONO ?? 'SEM NUMERO';
    const newsApi = process.env.API_NEWS_ORG ?? 'SEM API_NEWS';
    const apiremovebg = process.env.API_REMOVEBG ?? 'SEM API_REMOVEBG';
    const apiApornoUser = process.env.API_USER ?? 'SEM API_USER';
    const apiApornoSecret = process.env.API_SECRET ?? 'SEM API_SECRET';

    const resposta: CriacaoEnvResult = {
        numero_dono: numDono.trim() === '55219xxxxxxxx' ? 'O número do DONO ainda não foi configurado' : '✓ Número do DONO configurado.',
        newsapi: newsApi.trim() === '??????' ? 'A API do NEWSAPI ainda não foi configurada' : '✓ API NEWSAPI configurada.',
        apiremovebg: apiremovebg.trim() === '??????' ? 'A API do REMOVEBG ainda não foi configurada' : '✓ API REMOVEBG configurada.',
        apiapornouser:
            apiApornoUser.trim() === '??????' ? 'A API ANTI-PORNO USER ainda não foi configurada' : '✓ API ANTI-PORNO USER configurada.',
        apiapornosecret:
            apiApornoSecret.trim() === '??????'
                ? 'A API ANTI-PORNO SECRET ainda não foi configurada'
                : '✓ API ANTI-PORNO SECRET configurada.',
    };

    console.log('[ENV]', corTexto(resposta.numero_dono));
    console.log('[ENV]', corTexto(resposta.newsapi));
    console.log('[ENV]', corTexto(resposta.apiremovebg));
    console.log('[ENV]', corTexto(resposta.apiapornouser));
    console.log('[ENV]', corTexto(resposta.apiapornosecret));
};

export { criacaoEnv, verificarEnv };
