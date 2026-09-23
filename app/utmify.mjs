/**
 * utmify.mjs — cliente MCP que fala direto com a Utmify.
 *
 * É o que faz o Termômetro atualizar em segundos em vez de minutos: as
 * chamadas saem daqui, em paralelo, sem passar por um processo do Claude.
 *
 * A URL (com o token dentro) vem de `.env.utmify`, que está fora do Git.
 * É a mesma URL que o claude.ai usa como conector.
 */

import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export function urlDaUtmify() {
  const p = join(RAIZ, ".env.utmify");
  if (!existsSync(p)) return null;
  const m = readFileSync(p, "utf8").match(/^UTMIFY_MCP_URL=(.+)$/m);
  return m ? m[1].trim() : null;
}

let seq = 0;

/** Uma chamada JSON-RPC. A resposta pode vir como JSON puro ou como SSE. */
async function rpc(url, method, params, { notificacao = false, timeout = 30000 } = {}) {
  const corpo = notificacao
    ? { jsonrpc: "2.0", method, params }
    : { jsonrpc: "2.0", id: ++seq, method, params };

  const r = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json, text/event-stream" },
    body: JSON.stringify(corpo),
    signal: AbortSignal.timeout(timeout),
  });
  if (notificacao) return null;

  const texto = await r.text();
  if (!r.ok) throw new Error(`${method}: HTTP ${r.status} ${texto.slice(0, 120)}`);
  const linha = texto.split("\n").find((l) => l.startsWith("data:"));
  const json = JSON.parse(linha ? linha.slice(5).trim() : texto);
  if (json.error) throw new Error(`${method}: ${json.error.message}`);
  return json.result;
}

let pronto = null;
/** O aperto de mão roda uma vez por processo. */
async function garanteSessao(url) {
  if (!pronto) {
    pronto = (async () => {
      await rpc(url, "initialize", {
        protocolVersion: "2025-06-18",
        capabilities: {},
        clientInfo: { name: "painel-ofertas", version: "1" },
      });
      await rpc(url, "notifications/initialized", {}, { notificacao: true });
    })().catch((e) => { pronto = null; throw e; });
  }
  return pronto;
}

/**
 * Chama uma ferramenta e devolve o payload já desembrulhado — a mesma forma
 * que o Termômetro espera receber do MCP do claude.ai.
 */
export async function chamaUtmify(ferramenta, entrada = {}) {
  const url = urlDaUtmify();
  if (!url) throw new Error("Falta o arquivo .env.utmify com a UTMIFY_MCP_URL.");
  await garanteSessao(url);

  const r = await rpc(url, "tools/call", { name: ferramenta, arguments: entrada });
  const texto = r?.content?.[0]?.text;
  if (texto === undefined) throw new Error(`${ferramenta}: resposta sem conteúdo`);

  let dado;
  try { dado = JSON.parse(texto); } catch { return texto; }

  // O servidor sinaliza erro dentro do próprio conteúdo.
  if (r.isError || dado?.result === "ERROR") {
    throw new Error(`${ferramenta}: ${dado?.reason ?? "erro na Utmify"}`);
  }
  return dado;
}
