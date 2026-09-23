#!/usr/bin/env node
/**
 * servidor.mjs — o cérebro do Painel de Ofertas.
 *
 * Um servidor HTTP local, sem nenhuma dependência: só Node puro. Ele escuta
 * apenas em 127.0.0.1, então nada disso fica exposto na rede — é um app de
 * desktop que por acaso fala HTTP.
 *
 * O que ele faz:
 *   - serve a interface (app/publico)
 *   - lê os relatórios, produtos, ideias, criativos e páginas já gerados
 *   - dispara o Claude localmente (claude -p "/minerar") e transmite o que
 *     está acontecendo em tempo real pro painel, via SSE
 *   - liga/desliga/roda as tarefas do Agendador do Windows
 *   - guarda favoritos e anotações em data/painel.json
 *
 * Subir: node app/servidor.mjs   (ou clicar em "Painel de Ofertas.bat")
 */

import { createServer } from "node:http";
import { spawn } from "node:child_process";
import {
  createReadStream, existsSync, mkdirSync, readdirSync, readFileSync, renameSync, statSync, unlinkSync, writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chamaUtmify, urlDaUtmify } from "./utmify.mjs";

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PUBLICO = join(RAIZ, "app", "publico");
const PORTA = Number(process.env.PORTA ?? 4545);
const CLAUDE = process.env.CLAUDE_BIN ?? "claude";

const hoje = () => new Date().toISOString().slice(0, 10);
const leJson = (p, padrao) => {
  try { return JSON.parse(readFileSync(p, "utf8")); } catch { return padrao; }
};

/* ------------------------------------------------------------------ *
 * Estado do painel (favoritos, anotações, histórico de rodadas)
 * ------------------------------------------------------------------ */

const ARQ_PAINEL = join(RAIZ, "data", "painel.json");
function lePainel() {
  const p = leJson(ARQ_PAINEL, {});
  return { favoritos: p.favoritos ?? [], notas: p.notas ?? {}, historico: p.historico ?? [] };
}
function salvaPainel(p) {
  mkdirSync(dirname(ARQ_PAINEL), { recursive: true });
  writeFileSync(ARQ_PAINEL, JSON.stringify(p, null, 2));
}

/* ------------------------------------------------------------------ *
 * Trabalhos: cada clique em "rodar" vira um processo local
 * ------------------------------------------------------------------ */

/** O que o painel tem permissão de executar. Nada fora desta lista roda. */
const RECEITAS = {
  minerar: { rotulo: "Minerar ofertas", tipo: "claude", prompt: () => "/minerar", minutos: 25 },
  ideias: { rotulo: "Gerar ideias de oferta", tipo: "claude", prompt: () => "/ideias", minutos: 15 },
  criativos: {
    rotulo: "Gerar criativos", tipo: "claude",
    prompt: (arg) => (arg ? `/criativos ${arg}` : "/criativos"), minutos: 15,
  },
  semana: { rotulo: "Rodada completa da semana", tipo: "claude", prompt: () => "/semana", minutos: 50 },
  modelar: {
    rotulo: "Modelar oferta (MVT)", tipo: "claude",
    // --auto: o pipeline decide os gates sozinho e grava tudo em arquivo,
    // porque numa rodada headless não há ninguém pra confirmar fase por fase.
    prompt: (arg) => `/modelar --auto ${arg ?? ""}`.trim(), minutos: 45, turnos: 400,
  },
  modelarJunto: {
    rotulo: "Modelar oferta (com você)", tipo: "claude",
    // --gates: para em cada fase, escreve a pergunta em data/gate.json e encerra
    // o turno. O painel mostra, você responde, e a conversa segue com --resume.
    prompt: (arg) => `/modelar --gates ${arg ?? ""}`.trim(), minutos: 15, turnos: 200,
  },
  termometro: {
    rotulo: "Atualizar o termômetro", tipo: "claude",
    // Só o período que está na tela — é o que o artifact original faz, e o que
    // separa 30 segundos de meia hora.
    prompt: (arg) => `/termometro ${arg ?? "hoje"}`, minutos: 2, turnos: 40,
  },
  briefing: {
    rotulo: "Briefing das imagens", tipo: "node",
    args: (arg) => [join(RAIZ, "scripts", "imagens.mjs"), join(RAIZ, arg ?? "")], minutos: 1,
  },
  publicarImagens: {
    rotulo: "Publicar as imagens", tipo: "node",
    // A origem é sempre imagens-novas/<produto>/ — o script sabe achar.
    args: (arg) => [join(RAIZ, "scripts", "imagens.mjs"), join(RAIZ, arg ?? ""), "--publicar"],
    minutos: 4,
  },
  pedirImagens: {
    rotulo: "Pedir as imagens ao Codex", tipo: "node",
    args: (arg) => [join(RAIZ, "scripts", "pedir-imagens.mjs"), join(RAIZ, arg ?? "")], minutos: 30,
  },
  conferir: {
    rotulo: "Conferir a página", tipo: "node",
    args: (arg) => [join(RAIZ, "scripts", "conferir-pagina.mjs"), join(RAIZ, arg ?? "")], minutos: 1,
  },
  corrigir: {
    rotulo: "Corrigir a página", tipo: "claude", minutos: 15, turnos: 120,
    prompt: (arg) => `Rode \`node scripts/conferir-pagina.mjs ${arg}\` e corrija no HTML dessa pasta tudo que ele listar como PROBLEMA. `
      + `Siga as regras de .claude/commands/modelar.md (seção da página) e do templates/CATALOGO.md. `
      + `Não redesenhe: mexa em texto, ordem e presença de bloco — nunca em CSS, cor, fonte ou layout. `
      + `Repita até o verificador sair com 0 problemas. No fim, diga em 2 linhas o que mudou.`,
  },
  auditar: {
    rotulo: "Refazer a auditoria", tipo: "claude", minutos: 20, turnos: 120,
    prompt: (arg) => `Refaça a auditoria da página em ${arg}, seguindo a etapa 5 de .claude/commands/modelar.md. `
      + `A página mudou desde o laudo anterior. Rode \`node scripts/conferir-pagina.mjs ${arg}\` primeiro. `
      + `A nota é de COPY E CONTEXTO apenas — a página está sem imagens, os {{IMG:...}} entram depois na Atomicat, `
      + `então não dê nota de execução visual nem de prova visual. Sobrescreva o arquivo de auditoria da pasta. `
      + `No fim, diga em 2 linhas a nota e o que mudou em relação ao laudo anterior.`,
  },
  importar: {
    rotulo: "Importar cache do Ad Hunter", tipo: "node",
    args: () => [join(RAIZ, "scripts", "importar-adhunter.mjs")], minutos: 1,
  },
  adhunter: {
    rotulo: "Atualizar Ad Hunter (usa proxy)", tipo: "powershell",
    args: () => ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", join(RAIZ, "scripts", "atualizar-adhunter.ps1")],
    minutos: 60,
  },
};

let contador = 0;
let emAndamento = null;       // trabalho rodando agora (só um por vez)
let aguardando = null;        // trabalho parado num gate, esperando resposta
const ouvintes = new Set();   // respostas SSE abertas
const historicoVivo = [];     // trabalhos desta sessão, com a saída completa

function transmite(evento, dados) {
  const linha = `event: ${evento}\ndata: ${JSON.stringify(dados)}\n\n`;
  for (const res of ouvintes) {
    try { res.write(linha); } catch { ouvintes.delete(res); }
  }
}

function anota(trabalho, nivel, texto) {
  if (!texto) return;
  const item = { hora: new Date().toLocaleTimeString("pt-BR"), nivel, texto: String(texto).slice(0, 4000) };
  trabalho.saida.push(item);
  if (trabalho.saida.length > 900) trabalho.saida.splice(0, 300);
  transmite("linha", { id: trabalho.id, ...item });
}

/** Traduz o NDJSON do Claude em frases que fazem sentido pra quem está olhando. */
function interpreta(evt) {
  const saida = [];
  if (evt.type === "system" && evt.subtype === "init") {
    saida.push(["info", `Claude pronto (modelo ${evt.model ?? "padrão"})`]);
  } else if (evt.type === "assistant") {
    for (const bloco of evt.message?.content ?? []) {
      if (bloco.type === "text" && bloco.text?.trim()) {
        saida.push(["fala", bloco.text.trim()]);
      } else if (bloco.type === "tool_use") {
        const n = bloco.name;
        const i = bloco.input ?? {};
        if (n === "Bash") saida.push(["passo", i.description || i.command || "comando"]);
        else if (n === "Agent") saida.push(["passo", `chamou o agente ${i.subagent_type ?? ""}`.trim()]);
        else if (n === "Read") saida.push(["passo", `lendo ${basename(i.file_path ?? "")}`]);
        else if (n === "Write" || n === "Edit") saida.push(["passo", `escrevendo ${basename(i.file_path ?? "")}`]);
        else if (n === "Glob" || n === "Grep") saida.push(["passo", `procurando ${i.pattern ?? ""}`]);
        else if (n === "Skill") saida.push(["passo", `carregou a skill ${i.skill ?? ""}`]);
        else saida.push(["passo", n]);
      }
    }
  } else if (evt.type === "result") {
    const seg = Math.round((evt.duration_ms ?? 0) / 1000);
    saida.push(evt.subtype === "success"
      ? ["ok", `Terminou em ${seg}s`]
      : ["erro", `Terminou com problema (${evt.subtype}) em ${seg}s`]);
    if (evt.result) saida.push(["fala", String(evt.result).trim()]);
  }
  return saida;
}

const resumoTrabalho = (t) => (t ? {
  id: t.id, chave: t.chave, rotulo: t.rotulo, status: t.status,
  inicio: t.inicio, fim: t.fim, minutos: t.minutos,
  segundos: Math.round(((t.fim ?? Date.now()) - t.inicio) / 1000),
  pergunta: t.pergunta ?? null,
} : null);

/* O gate em disco. A fase escreve a pergunta aqui e encerra o turno; o painel
   mostra, a pessoa responde, e a conversa segue com --resume. Um arquivo só
   basta porque o painel roda uma coisa de cada vez. */
const ARQ_GATE = join(RAIZ, "data", "gate.json");

function lePergunta() {
  if (!existsSync(ARQ_GATE)) return null;
  try {
    const g = JSON.parse(readFileSync(ARQ_GATE, "utf8"));
    if (!g?.pergunta) return null;
    return {
      pergunta: String(g.pergunta).slice(0, 400),
      contexto: String(g.contexto ?? "").slice(0, 2000),
      opcoes: (Array.isArray(g.opcoes) ? g.opcoes : []).slice(0, 5).map((o) => String(o).slice(0, 120)),
    };
  } catch { return null; }
}

function apagaPergunta() {
  try { if (existsSync(ARQ_GATE)) unlinkSync(ARQ_GATE); } catch { /* já foi */ }
}

function iniciaTrabalho(chave, argumento, retomar) {
  const receita = RECEITAS[chave];
  if (!receita) throw new Error("Não conheço essa ação.");
  if (emAndamento) throw new Error(`Já tem uma coisa rodando: ${emAndamento.rotulo}. Espere terminar ou clique em parar.`);

  const trabalho = {
    id: ++contador,
    chave,
    rotulo: receita.rotulo + (argumento ? ` — ${argumento}` : ""),
    argumento: argumento ?? null,
    inicio: Date.now(),
    fim: null,
    status: "rodando",
    minutos: receita.minutos,
    saida: [],
    sessaoClaude: null,   // id da conversa, pra retomar num gate
    pergunta: null,       // o gate em aberto, quando houver
  };

  let cmd;
  let args;
  if (receita.tipo === "claude") {
    cmd = CLAUDE;
    // Retomando de um gate: mesma conversa, a resposta como nova mensagem.
    args = retomar
      ? ["-p", retomar.resposta, "--resume", retomar.sessao]
      : ["-p", receita.prompt(argumento)];
    args.push(
      "--permission-mode", "acceptEdits",
      "--output-format", "stream-json",
      "--verbose",
      "--max-turns", String(receita.turnos ?? 140),
    );
  } else if (receita.tipo === "node") {
    cmd = process.execPath;
    args = receita.args(argumento);
  } else {
    cmd = "powershell.exe";
    args = receita.args(argumento);
  }

  // stdin fechado: sem isso o `claude -p` fica 3s esperando algo que nunca vem.
  const proc = spawn(cmd, args, { cwd: RAIZ, shell: false, windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
  trabalho.proc = proc;
  emAndamento = trabalho;
  historicoVivo.unshift(trabalho);
  if (historicoVivo.length > 30) historicoVivo.pop();

  anota(trabalho, "info", `Começou: ${trabalho.rotulo}`);
  transmite("inicio", resumoTrabalho(trabalho));

  let sobra = "";
  proc.stdout.setEncoding("utf8");
  proc.stdout.on("data", (pedaco) => {
    if (receita.tipo !== "claude") {
      for (const l of String(pedaco).split(/\r?\n/)) anota(trabalho, "passo", l.trim());
      return;
    }
    sobra += pedaco;
    const linhas = sobra.split("\n");
    sobra = linhas.pop() ?? "";
    for (const linha of linhas) {
      const t = linha.trim();
      if (!t) continue;
      try {
        const evt = JSON.parse(t);
        // Guarda o id da conversa: é ele que permite retomar num gate com --resume.
        if (evt.type === "system" && evt.subtype === "init" && evt.session_id) {
          trabalho.sessaoClaude = evt.session_id;
        }
        for (const [nivel, texto] of interpreta(evt)) anota(trabalho, nivel, texto);
      } catch {
        anota(trabalho, "passo", t);
      }
    }
  });

  proc.stderr.setEncoding("utf8");
  proc.stderr.on("data", (pedaco) => {
    for (const l of String(pedaco).split(/\r?\n/)) {
      const t = l.trim();
      if (t) anota(trabalho, "erro", t);
    }
  });

  proc.on("error", (e) => anota(trabalho, "erro", `Não consegui executar: ${e.message}`));

  proc.on("close", (codigo) => {
    trabalho.fim = Date.now();
    trabalho.status = trabalho.status === "parado" ? "parado" : codigo === 0 ? "ok" : "erro";
    trabalho.proc = null;

    /* Parou num gate? A fase escreve a pergunta em disco antes de encerrar o
       turno. O trabalho fica "esperando" em vez de "pronto": nada terminou,
       ele só está esperando a decisão de quem está olhando. */
    const gate = trabalho.status === "ok" ? lePergunta() : null;
    if (gate && trabalho.sessaoClaude) {
      trabalho.status = "esperando";
      trabalho.pergunta = gate;
      anota(trabalho, "info", `Esperando você: ${gate.pergunta}`);
      emAndamento = null;
      aguardando = trabalho;
      transmite("pergunta", resumoTrabalho(trabalho));
      return;
    }

    anota(trabalho, trabalho.status === "ok" ? "ok" : "erro",
      trabalho.status === "ok" ? "Pronto."
        : trabalho.status === "parado" ? "Parado por você."
          : `Saiu com código ${codigo}.`);
    const p = lePainel();
    p.historico = [{
      chave,
      rotulo: trabalho.rotulo,
      status: trabalho.status,
      inicio: new Date(trabalho.inicio).toISOString(),
      segundos: Math.round((trabalho.fim - trabalho.inicio) / 1000),
    }, ...p.historico].slice(0, 60);
    salvaPainel(p);
    emAndamento = null;
    transmite("fim", resumoTrabalho(trabalho));
  });

  return trabalho;
}

/* ------------------------------------------------------------------ *
 * Agendador do Windows
 * ------------------------------------------------------------------ */

const TAREFAS = {
  HarnessOfertas: {
    rotulo: "Mineração diária",
    quando: "todo dia às 06:00",
    explica: "Lê o cache do Ad Hunter, escolhe as melhores ofertas e publica o relatório. Não usa proxy.",
    cor: "azul",
  },
  "AdHunter-Semanal": {
    rotulo: "Ad Hunter semanal",
    quando: "domingo às 04:00",
    explica: "Único passo que gasta proxy: o Ad Hunter minera todas as categorias e deixa o cache fresco.",
    cor: "ambar",
  },
  "AdHunter-Semanal-2": {
    rotulo: "Ad Hunter (2ª vez na semana)",
    quando: "segunda janela",
    explica: "Opcional: uma segunda coleta no meio da semana.",
    cor: "ambar",
  },
};

/**
 * Abre o Claude numa janela de terminal, já dentro da pasta do projeto e com o
 * comando digitado — é assim que o /modelar funciona, porque o MVT conversa com
 * você entre as fases e precisa que você responda.
 *
 * Em vez de tentar montar `cmd /k "..."` na mão (aspas dentro de aspas no
 * Windows são uma fonte infinita de bug), a gente escreve um .cmd de três
 * linhas e manda o Windows abrir ele. Simples e à prova de escape.
 */
function abreClaudeNoTerminal(res, comando) {
  const limpo = String(comando).replace(/["\r\n]/g, "").slice(0, 300);
  const arquivo = join(tmpdir(), `painel-ofertas-${Date.now()}.cmd`);
  writeFileSync(arquivo, [
    "@echo off",
    "chcp 65001 > nul",
    `title Claude - ${limpo}`,
    `cd /d "${RAIZ}"`,
    `"${CLAUDE}" "${limpo}"`,
    "",
  ].join("\r\n"), "utf8");
  spawn("cmd.exe", ["/c", "start", "", arquivo], { cwd: RAIZ, detached: true, windowsHide: false }).unref();
  return manda(res, 200, { ok: true });
}

function powershell(comando) {
  return new Promise((ok) => {
    const p = spawn("powershell.exe", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", comando], { windowsHide: true });
    let out = "";
    let err = "";
    p.stdout.on("data", (d) => (out += d));
    p.stderr.on("data", (d) => (err += d));
    p.on("close", (c) => ok({ codigo: c, out: out.trim(), err: err.trim() }));
    p.on("error", (e) => ok({ codigo: 1, out: "", err: e.message }));
  });
}

async function listaTarefas() {
  const nomes = Object.keys(TAREFAS).map((n) => `'${n}'`).join(",");
  const cmd = [
    "$r=@();",
    `foreach($n in @(${nomes})){`,
    "$t=Get-ScheduledTask -TaskName $n -ErrorAction SilentlyContinue;",
    "if($t){ $i=Get-ScheduledTaskInfo -TaskName $n;",
    "$r+=[pscustomobject]@{nome=$n;estado=[string]$t.State;",
    "proxima=$(if($i.NextRunTime){$i.NextRunTime.ToString('s')}else{$null});",
    "ultima=$(if($i.LastRunTime -and $i.LastRunTime.Year -gt 2000){$i.LastRunTime.ToString('s')}else{$null});",
    "resultado=$i.LastTaskResult } } };",
    "ConvertTo-Json @($r) -Compress",
  ].join(" ");
  const { out } = await powershell(cmd);
  let lista = leJson0(out);
  if (!Array.isArray(lista)) lista = lista ? [lista] : [];
  return lista.map((t) => ({ ...TAREFAS[t.nome], ...t, ligada: t.estado !== "Disabled" }));
}

function leJson0(txt) {
  try { return JSON.parse(txt || "[]"); } catch { return []; }
}

/* ------------------------------------------------------------------ *
 * Leitura dos dados do projeto
 * ------------------------------------------------------------------ */

function listaArquivos(pasta, ext) {
  const dir = join(RAIZ, pasta);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => !f.startsWith("_") && !f.startsWith(".") && (!ext || ext.includes(extname(f))))
    .map((f) => {
      const st = statSync(join(dir, f));
      return {
        nome: f,
        caminho: `${pasta}/${f}`,
        tamanho: st.size,
        mexido: st.mtime.toISOString(),
        ehPasta: st.isDirectory(),
      };
    })
    .filter((a) => !a.ehPasta)
    .sort((a, b) => b.mexido.localeCompare(a.mexido));
}

function relatorios() {
  return listaArquivos("saidas/mineracao", [".json"]).map((a) => ({ ...a, data: basename(a.nome, ".json") }));
}

/**
 * A mídia é salva com o id do anúncio PRINCIPAL do grupo, que nem sempre é o
 * `adId` do card (o agente troca o card pela oferta dominante). Então a gente
 * repete aqui a busca que o render-relatorio.mjs faz na coleta bruta do dia.
 */
function achaAnuncio(data, nichoId, adId, paginaId) {
  const p = join(RAIZ, "data", "raw", data, `${nichoId}.json`);
  const raw = existsSync(p) ? leJson(p, null) : null;
  const grupos = raw?.ofertas ?? raw?.anunciantes ?? [];
  const daPagina = grupos.filter((x) => String(x.pagina?.id) === String(paginaId));
  const grupo = grupos.find((g) => adId && (g.ads ?? []).some((a) => a.id === adId)) ?? daPagina[0];
  if (!grupo) return null;
  // Todos os ids da página servem de candidato: o "principal" muda a cada
  // coleta, mas a mídia já baixada continua com o id de quando foi salva.
  const ids = [
    adId,
    grupo.principal?.id,
    ...daPagina.flatMap((g) => [g.principal?.id, ...(g.ads ?? []).map((a) => a.id)]),
  ].filter(Boolean);
  const ad = (grupo.ads ?? []).find((a) => a.id === adId) ?? grupo.principal;
  return { ad, pagina: grupo.pagina, ids: [...new Set(ids.map(String))] };
}

/**
 * A fonte mais confiável da mídia é o próprio HTML do relatório: ele foi escrito
 * no mesmo instante em que os vídeos foram baixados, então o casamento está
 * certo mesmo que a coleta bruta tenha sido refeita depois (os ids mudam).
 * Os cards do HTML saem na mesma ordem das ofertas do JSON.
 */
function midiaDoHtml(data) {
  const p = join(RAIZ, "saidas", "mineracao", `${data}.html`);
  if (!existsSync(p)) return [];
  const html = readFileSync(p, "utf8");
  return html.split('class="card').slice(1).map((pedaco) => ({
    video: (pedaco.match(/midia\/(\d+)\.mp4/) ?? [])[0] ?? null,
    imagem: (pedaco.match(/midia\/(\d+)\.jpg/) ?? [])[0] ?? null,
  }));
}

function relatorio(data) {
  const p = join(RAIZ, "saidas", "mineracao", `${data}.json`);
  if (!existsSync(p)) return null;
  const r = leJson(p, null);
  if (!r) return null;
  const midiaDir = join(RAIZ, "saidas", "mineracao", "midia");
  const doHtml = midiaDoHtml(data);
  const painel = lePainel();
  let iCard = 0;
  for (const n of r.nichos ?? []) {
    for (const o of n.ofertas ?? []) {
      o.nicho = n.nome;
      o.nichoId = n.id;
      o.favorita = painel.favoritos.includes(String(o.adId));
      o.nota = painel.notas[String(o.adId)] ?? null;

      // Biblioteca de anúncios do anunciante: todos os anúncios ativos da página.
      o.urlPagina = o.paginaId
        ? "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR"
          + `&view_all_page_id=${o.paginaId}&search_type=page&media_type=all`
        : null;

      const achado = achaAnuncio(data, n.id, o.adId, o.paginaId);
      o.curtidas = achado?.pagina?.curtidas ?? null;
      o.copyAnuncio = o.copy ?? achado?.ad?.texto ?? null;
      const ids = achado?.ids ?? [o.adId].filter(Boolean);
      const acha = (ext) => ids.map((i) => (existsSync(join(midiaDir, `${i}.${ext}`)) ? `/midia/${i}.${ext}` : null)).find(Boolean) ?? null;
      const card = doHtml[iCard++] ?? {};
      o.video = (card.video ? `/${card.video}` : null) ?? acha("mp4");
      o.imagem = (card.imagem ? `/${card.imagem}` : null) ?? acha("jpg");
    }
  }
  r.temHtml = existsSync(join(RAIZ, "saidas", "mineracao", `${data}.html`));
  return r;
}

function produtos() {
  return listaArquivos("produtos", [".md"])
    .filter((a) => a.nome !== "README.md")
    .map((a) => {
      const txt = readFileSync(join(RAIZ, a.caminho), "utf8");
      const titulo = (txt.match(/^#\s+(.+)$/m) ?? [])[1] ?? basename(a.nome, ".md");
      return { ...a, titulo, slug: basename(a.nome, ".md") };
    });
}

function modelagens() {
  const dir = join(RAIZ, "saidas", "modelagem");
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => !f.startsWith("."))
    .map((f) => {
      const p = join(dir, f);
      const st = statSync(p);
      const arquivos = st.isDirectory() ? readdirSync(p) : [];
      const html = arquivos.find((x) => x.endsWith(".html"));
      const dentro = (nome) => (arquivos.includes(nome) ? `saidas/modelagem/${f}/${nome}` : null);
      // Casa por padrão, não por nome exato: o pipeline já renumerou as fases uma vez.
      const acha = (re) => {
        const n = arquivos.find((x) => re.test(x));
        return n ? `saidas/modelagem/${f}/${n}` : null;
      };
      // A nota da auditoria é o resumo mais útil da modelagem inteira. O laudo dá nota por
      // mandamento e fecha numa média — é a média que interessa.
      // Quantas imagens ainda faltam na página — é o que trava a publicação.
      let imagensFaltando = null;
      if (html) {
        const t = readFileSync(join(p, html), "utf8");
        imagensFaltando = (t.match(/\{\{IMG:[^}]*\}\}/g) ?? []).length;
      }
      let nota = null;
      const aud = acha(/auditoria[-_]?pagina.*\.md$/i) ?? acha(/auditoria.*\.md$/i);
      if (aud) {
        const linhas = readFileSync(join(RAIZ, aud), "utf8").split(/\r?\n/);
        const fecha = linhas.find((l) => /m[ée]dia|nota\s+(final|geral)/i.test(l) && /\d\s*\/\s*10/.test(l));
        nota = (fecha?.match(/(\d{1,2}(?:[.,]\d+)?)\s*\/\s*10/) ?? [])[1] ?? null;
        if (nota) nota = `${nota}/10`;
      }
      return {
        nome: f,
        caminho: `saidas/modelagem/${f}`,
        mexido: st.mtime.toISOString(),
        arquivos: arquivos.length,
        pagina: html ? `saidas/modelagem/${f}/${html}` : null,
        decisoes: dentro("DECISOES.md"),
        status: dentro("STATUS.md"),
        imagensFaltando,
        briefingImagens: acha(/^IMAGENS\.md$/i),
        concepcao: acha(/^0?2[-_]?concepcao.*\.md$/i) ?? acha(/concepcao\.md$/i),
        auditoriaConcepcao: acha(/auditoria[-_]?concepcao.*\.md$/i),
        auditoria: aud,
        nota,
      };
    })
    .sort((a, b) => b.mexido.localeCompare(a.mexido));
}

/* ------------------------------------------------------------------ *
 * Cache da Utmify — o que o Termômetro portado lê no lugar do MCP
 * ------------------------------------------------------------------ */

/** Ordena as chaves recursivamente: a mesma entrada dá sempre a mesma chave. */
function ordenado(v) {
  if (Array.isArray(v)) return v.map(ordenado);
  if (v && typeof v === "object") {
    return Object.keys(v).sort().reduce((o, k) => { o[k] = ordenado(v[k]); return o; }, {});
  }
  return v;
}
const chaveUtmify = (ferramenta, entrada) => `${ferramenta}|${JSON.stringify(ordenado(entrada ?? {}))}`;

let cacheUtmify = null;
function leCacheUtmify() {
  const p = join(RAIZ, "data", "termometro", "cache.json");
  if (!existsSync(p)) return null;
  const mexido = statSync(p).mtimeMs;
  if (cacheUtmify?.mexido === mexido) return cacheUtmify;
  const bruto = leJson(p, null);
  if (!bruto?.chamadas) return null;
  const indice = new Map();
  for (const c of bruto.chamadas) indice.set(chaveUtmify(c.ferramenta, c.entrada), c.payload);
  cacheUtmify = { mexido, indice, atualizadoEm: bruto.atualizadoEm ?? null };
  return cacheUtmify;
}

/* ------------------------------------------------------------------ *
 * HTTP
 * ------------------------------------------------------------------ */

const TIPOS = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".mp4": "video/mp4",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".md": "text/plain; charset=utf-8",
  ".ico": "image/x-icon",
};

function manda(res, codigo, corpo, tipo = "application/json; charset=utf-8") {
  res.writeHead(codigo, { "content-type": tipo, "cache-control": "no-store" });
  res.end(typeof corpo === "string" ? corpo : JSON.stringify(corpo));
}

function serveArquivo(res, caminho) {
  if (!existsSync(caminho) || statSync(caminho).isDirectory()) return manda(res, 404, { erro: "não achei" });
  res.writeHead(200, { "content-type": TIPOS[extname(caminho)] ?? "application/octet-stream" });
  return createReadStream(caminho).pipe(res);
}

/** Só deixa ler o que está dentro do projeto. */
function dentroDaRaiz(caminhoRelativo) {
  const alvo = resolve(RAIZ, caminhoRelativo);
  return alvo.startsWith(RAIZ) ? alvo : null;
}

function corpoDe(req) {
  return new Promise((ok) => {
    let d = "";
    req.on("data", (p) => (d += p));
    req.on("end", () => { try { ok(JSON.parse(d || "{}")); } catch { ok({}); } });
  });
}

const servidor = createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  const rota = url.pathname;

  try {
    /* ---- eventos ao vivo ---- */
    if (rota === "/api/eventos") {
      res.writeHead(200, {
        "content-type": "text/event-stream",
        "cache-control": "no-cache",
        connection: "keep-alive",
      });
      res.write(`event: ola\ndata: ${JSON.stringify({ rodando: resumoTrabalho(emAndamento) })}\n\n`);
      ouvintes.add(res);
      const ping = setInterval(() => { try { res.write(": ping\n\n"); } catch { /* ignora */ } }, 20000);
      req.on("close", () => { clearInterval(ping); ouvintes.delete(res); });
      return undefined;
    }

    /* ---- o painel inteiro numa chamada só ---- */
    if (rota === "/api/estado") {
      const rels = relatorios();
      const cfg = leJson(join(RAIZ, "config", "nichos.json"), {});
      const painel = lePainel();
      return manda(res, 200, {
        hoje: hoje(),
        raiz: RAIZ,
        relatorios: rels.map((r) => r.data),
        ultimoRelatorio: rels[0]?.data ?? null,
        tarefas: await listaTarefas(),
        produtos: produtos().length,
        ideias: listaArquivos("saidas/ideias", [".md"]).length,
        criativos: listaArquivos("saidas/criativos", [".md"]).length,
        modelagens: modelagens().length,
        favoritos: painel.favoritos.length,
        historico: painel.historico.slice(0, 12),
        rodando: resumoTrabalho(emAndamento),
        nichosAtivos: (cfg.nichos ?? []).filter((n) => n.ativo !== false).length,
        ofertasAtivas: (() => {
          const t = leJson(join(RAIZ, "data", "termometro", "ultimo.json"), null);
          return (t?.periodos?.["7d"]?.ofertas ?? []).filter((o) => !o.erro).length || null;
        })(),
      });
    }

    if (rota === "/api/relatorio") {
      const data = url.searchParams.get("data") || relatorios()[0]?.data;
      const r = data ? relatorio(data) : null;
      return r ? manda(res, 200, r) : manda(res, 404, { erro: "Nenhum relatório ainda. Rode uma mineração." });
    }

    /* ---- Termômetro: o artifact portado fala com estas três rotas ---- *
     * O cache guarda as respostas cruas da Utmify. A chave é a ferramenta
     * mais a entrada com as chaves ordenadas, pra os dois lados concordarem
     * independente da ordem em que o JSON foi escrito. */
    if (rota === "/api/utmify" && req.method === "POST") {
      const { ferramenta, entrada } = await corpoDe(req);

      // Caminho principal: perguntar pra Utmify agora. São segundos.
      if (urlDaUtmify()) {
        try {
          return manda(res, 200, { payload: await chamaUtmify(ferramenta, entrada) });
        } catch (e) {
          // Sem rede ou token vencido: tenta o que ficou guardado da última vez.
          const guardado = leCacheUtmify()?.indice.get(chaveUtmify(ferramenta, entrada));
          if (guardado) return manda(res, 200, { payload: guardado });
          return manda(res, 502, { erro: e.message, code: "upstream_error" });
        }
      }

      const cache = leCacheUtmify();
      if (!cache) return manda(res, 503, { erro: "Falta o .env.utmify com a URL da Utmify.", code: "not_granted" });
      const achado = cache.indice.get(chaveUtmify(ferramenta, entrada));
      if (!achado) return manda(res, 404, { erro: `Não achei no cache (${ferramenta}).`, code: "upstream_error" });
      return manda(res, 200, { payload: achado });
    }

    if (rota === "/api/utmify/atualizar" && req.method === "POST") {
      const { periodo } = await corpoDe(req);
      const ok = ["hoje", "ontem", "7d", "30d", "mes", "mespassado"];
      try {
        return manda(res, 200, resumoTrabalho(iniciaTrabalho("termometro", ok.includes(periodo) ? periodo : "hoje")));
      } catch (e) {
        return manda(res, 409, { erro: e.message });
      }
    }

    if (rota === "/api/utmify/estado") {
      return manda(res, 200, {
        rodando: emAndamento?.chave === "termometro",
        aoVivo: !!urlDaUtmify(),
        atualizadoEm: leCacheUtmify()?.atualizadoEm ?? null,
      });
    }

    /* O termômetro: números reais das ofertas, lidos do arquivo local. */
    if (rota === "/api/termometro") {
      const dir = join(RAIZ, "data", "termometro");
      const p = join(dir, "ultimo.json");
      const dado = existsSync(p) ? leJson(p, null) : null;
      if (!dado) return manda(res, 404, { erro: "Nenhum dado ainda. Clique em atualizar." });
      dado.arquivoMexidoEm = statSync(p).mtime.toISOString();
      return manda(res, 200, dado);
    }

    if (rota === "/api/produtos") return manda(res, 200, produtos());
    if (rota === "/api/modelagens") return manda(res, 200, modelagens());
    if (rota === "/api/ideias") return manda(res, 200, listaArquivos("saidas/ideias", [".md"]));
    if (rota === "/api/criativos") return manda(res, 200, listaArquivos("saidas/criativos", [".md"]));

    if (rota === "/api/config") {
      if (req.method === "POST") {
        const novo = await corpoDe(req);
        if (!novo?.nichos) return manda(res, 400, { erro: "config inválida" });
        writeFileSync(join(RAIZ, "config", "nichos.json"), JSON.stringify(novo, null, 2));
        return manda(res, 200, { ok: true });
      }
      return manda(res, 200, leJson(join(RAIZ, "config", "nichos.json"), {}));
    }

    if (rota === "/api/arquivo") {
      const alvo = dentroDaRaiz(url.searchParams.get("p") ?? "");
      if (!alvo || !existsSync(alvo)) return manda(res, 404, { erro: "não achei" });
      return manda(res, 200, readFileSync(alvo, "utf8"), "text/plain; charset=utf-8");
    }

    /* A página de vendas renderizada, servida do próprio painel: assim ela abre
       numa aba de verdade (com JS funcionando) em vez de file://. */
    if (rota.startsWith("/pagina/")) {
      const alvo = dentroDaRaiz(join("saidas", "modelagem", decodeURIComponent(rota.slice("/pagina/".length))));
      if (!alvo || !existsSync(alvo)) return manda(res, 404, { erro: "não achei" });
      return serveArquivo(res, alvo);
    }

    if (rota.startsWith("/midia/")) {
      return serveArquivo(res, join(RAIZ, "saidas", "mineracao", "midia", basename(rota)));
    }

    if (rota === "/api/trabalho" && req.method === "POST") {
      const { acao, argumento } = await corpoDe(req);
      try {
        return manda(res, 200, resumoTrabalho(iniciaTrabalho(acao, argumento)));
      } catch (e) {
        return manda(res, 409, { erro: e.message });
      }
    }

    if (rota === "/api/parar" && req.method === "POST") {
      if (!emAndamento?.proc) return manda(res, 200, { ok: true });
      emAndamento.status = "parado";
      spawn("taskkill", ["/pid", String(emAndamento.proc.pid), "/t", "/f"], { windowsHide: true });
      return manda(res, 200, { ok: true });
    }

    if (rota === "/api/saida") {
      const id = Number(url.searchParams.get("id"));
      const t = historicoVivo.find((x) => x.id === id) ?? emAndamento ?? historicoVivo[0];
      return manda(res, 200, { trabalho: resumoTrabalho(t), linhas: t?.saida ?? [] });
    }

    if (rota === "/api/tarefa" && req.method === "POST") {
      const { nome, acao } = await corpoDe(req);
      if (!TAREFAS[nome]) return manda(res, 400, { erro: "tarefa desconhecida" });
      const mapa = { ligar: "Enable-ScheduledTask", desligar: "Disable-ScheduledTask", rodar: "Start-ScheduledTask" };
      if (!mapa[acao]) return manda(res, 400, { erro: "ação desconhecida" });
      const r = await powershell(`${mapa[acao]} -TaskName '${nome}' | Out-Null`);
      return manda(res, r.codigo === 0 ? 200 : 500, { ok: r.codigo === 0, erro: r.err || null });
    }

    if (rota === "/api/favorito" && req.method === "POST") {
      const { adId, nota } = await corpoDe(req);
      const p = lePainel();
      const chave = String(adId);
      if (nota !== undefined) {
        if (nota) p.notas[chave] = String(nota).slice(0, 600);
        else delete p.notas[chave];
      } else {
        p.favoritos = p.favoritos.includes(chave)
          ? p.favoritos.filter((x) => x !== chave)
          : [...p.favoritos, chave];
      }
      salvaPainel(p);
      return manda(res, 200, { favorita: p.favoritos.includes(chave), nota: p.notas[chave] ?? null });
    }

    /* Excluir uma modelagem. Nao apaga: move pra lixeira dentro da propria
       pasta de modelagem. Sao 45 minutos de trabalho por pasta, e clique errado
       acontece — desfazer tem que ser arrastar de volta, nao refazer tudo. */
    if (rota === "/api/excluir-modelagem" && req.method === "POST") {
      const { nome } = await corpoDe(req);
      // Nome simples e so: nada de barra, de ".." nem de caminho absoluto.
      if (!/^[\w.-]+$/.test(String(nome ?? ""))) return manda(res, 400, { erro: "nome inválido" });
      const de = join(RAIZ, "saidas", "modelagem", nome);
      if (!existsSync(de) || !statSync(de).isDirectory()) return manda(res, 404, { erro: "não achei essa modelagem" });

      const lixeira = join(RAIZ, "saidas", "modelagem", ".lixeira");
      mkdirSync(lixeira, { recursive: true });
      const carimbo = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");
      const para = join(lixeira, `${nome}__${carimbo}`);
      try {
        renameSync(de, para);
      } catch (e) {
        return manda(res, 500, { erro: `não consegui mover: ${e.message}` });
      }
      return manda(res, 200, { ok: true, lixeira: `saidas/modelagem/.lixeira/${basename(para)}` });
    }

    /* A resposta ao gate: retoma a MESMA conversa do Claude com o que a pessoa
       decidiu. O arquivo do gate some antes, senão a pergunta velha reaparece
       assim que o próximo turno terminar. */
    if (rota === "/api/responder" && req.method === "POST") {
      const { resposta } = await corpoDe(req);
      if (!aguardando?.sessaoClaude) return manda(res, 400, { erro: "não tem nada esperando resposta" });
      const texto = String(resposta ?? "").trim().slice(0, 1000);
      if (!texto) return manda(res, 400, { erro: "resposta vazia" });

      const anterior = aguardando;
      aguardando = null;
      apagaPergunta();
      try {
        const t = iniciaTrabalho(anterior.chave, anterior.argumento, {
          sessao: anterior.sessaoClaude,
          resposta: texto,
        });
        return manda(res, 200, resumoTrabalho(t));
      } catch (e) {
        aguardando = anterior;   // devolve o estado: ninguém perdeu o gate
        return manda(res, 400, { erro: e.message });
      }
    }

    /* "Com voce" sem terminal: deixa o pedido num arquivo que a conversa do
       Claude fica vigiando. Quando ela esta aberta, a modelagem comeca la
       mesmo, com historico e arquivos clicaveis. Quando nao esta, o pedido
       espera na fila — nada se perde, so nao e instantaneo. */
    if (rota === "/api/pedir-modelagem" && req.method === "POST") {
      const { pagina } = await corpoDe(req);
      if (!pagina) return manda(res, 400, { erro: "faltou a página" });
      const arq = join(RAIZ, "data", "pedidos-modelagem.json");
      mkdirSync(dirname(arq), { recursive: true });
      const fila = existsSync(arq) ? JSON.parse(readFileSync(arq, "utf8")) : [];
      fila.push({ pagina: String(pagina).slice(0, 200), pedidoEm: new Date().toISOString(), atendido: false });
      writeFileSync(arq, JSON.stringify(fila, null, 2), "utf8");
      return manda(res, 200, { ok: true, naFila: fila.filter((p) => !p.atendido).length });
    }

    /* Abre no Windows: pasta, arquivo, link — ou um terminal com o Claude pronto. */
    if (rota === "/api/abrir" && req.method === "POST") {
      const { caminho, link, terminal } = await corpoDe(req);
      if (terminal) return abreClaudeNoTerminal(res, terminal);
      if (link) {
        if (!/^https?:\/\//i.test(link)) return manda(res, 400, { erro: "link inválido" });
        // rundll32 abre no navegador padrão sem passar por shell nenhum — o `&`
        // das URLs da Biblioteca de Anúncios quebraria num `cmd /c start`.
        spawn("rundll32.exe", ["url.dll,FileProtocolHandler", link], { windowsHide: true, detached: true }).unref();
        return manda(res, 200, { ok: true });
      }
      const alvo = dentroDaRaiz(caminho ?? "");
      if (!alvo || !existsSync(alvo)) return manda(res, 404, { erro: "não achei" });
      spawn("explorer.exe", [alvo], { detached: true }).unref();
      return manda(res, 200, { ok: true });
    }

    /* ---- estáticos ---- */
    const arq = rota === "/" ? "index.html" : rota.replace(/^\//, "");
    const alvo = join(PUBLICO, arq);
    if (alvo.startsWith(PUBLICO) && existsSync(alvo) && !statSync(alvo).isDirectory()) {
      return serveArquivo(res, alvo);
    }
    return manda(res, 404, { erro: "não achei" });
  } catch (e) {
    return manda(res, 500, { erro: e.message });
  }
});

servidor.listen(PORTA, "127.0.0.1", () => {
  console.log(`Painel de Ofertas no ar: http://localhost:${PORTA}`);
});
