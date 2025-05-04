import { pino } from "pino";
import {
  isJidBroadcast,
  makeCacheableSignalKeyStore,
  AuthenticationState,
  WAVersion,
  UserFacingSocketConfig,
  proto,
} from "baileys";
import NodeCache from "node-cache";

const groupCache = new NodeCache();

export default function configWaSocket(
  state: AuthenticationState,
  retryCache: NodeCache,
  version: WAVersion,
  messagesCache: NodeCache,
  usePairingCode: boolean,
) {
  const config: UserFacingSocketConfig = {
    logger: pino({ level: "silent" }),
    printQRInTerminal: !usePairingCode,
    browser: ["Chrome (Linux)", "", ""],
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" })),
    },
    version,
    msgRetryCounterCache: retryCache,
    defaultQueryTimeoutMs: undefined,
    syncFullHistory: true,
    shouldIgnoreJid: (jid) => isJidBroadcast(jid) || jid?.endsWith("@newsletter"),
    getMessage: async (key: proto.IMessageKey): Promise<proto.IMessage | undefined> => {
      const message = key.id ? ((await messagesCache.get(key.id)) as proto.IMessage) : undefined;
      return message;
    },
    cachedGroupMetadata: async (jid) => groupCache.get(jid),
  };

  return config;
}
