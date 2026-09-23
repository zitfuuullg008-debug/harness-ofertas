# STATUS — Cinnamon Roll Lucrativo

**Oferta criada:** Cinnamon Roll Lucrativo · R$ 27,90, plano único, vitalício, 30 dias de garantia
**Mecanismo:** Fornada Encomendada
**Lastro:** Luciana Prado · `inlead.digital/rolinhos-gourmet` · 150 anúncios, 60 criativos, 46 dias
**Rodada:** `/modelar --auto`, 2026-09-22 · **Nota da página: 8,0/10** (4 mandamentos auditáveis)

---

## As etapas

| Etapa | Arquivo | Estado |
|---|---|---|
| 1 · Pesquisa e concorrência | `01-pesquisa.md` | ✅ completa — extração da concorrente bloqueada (AES), marcada como "Não identificado" |
| 2 · Concepção | `02-concepcao.md` | ✅ |
| 3 · Auditoria da concepção | `03-auditoria-concepcao.md` | ✅ 2 reprovações, as 2 corrigidas antes de construir |
| 4 · Página | `04-pagina.html` | ✅ montada no molde A — 60,1 KB, 12 blocos |
| 5 · Auditoria da página | `05-auditoria-pagina.md` | ✅ 5 correções aplicadas na hora |
| — · Imagens na Atomicat | — | ⏸ fora do `--auto` (depende de arrastar arquivo) |
| — · App entregável | — | ⏸ fora do `--auto` (depende de você fechar as correções) |

---

## O que trava a página de ir ao ar

**Dois bloqueadores.** Enquanto existirem, a nota não importa.

1. **`{{CHECKOUT}}`** — o botão não aponta pra lugar nenhum. Preciso do link da oferta
   nova. **Nunca** o do `pão de queijo.html` (`pay.hotmart.com/N107541978G?off=ry882h3a`),
   que faria a venda cair no produto errado.
2. **16 slots de imagem vazios**, inclusive a primeira dobra e os dois mockups. Cada `alt`
   já está escrito como briefing da foto.

| Marcador | Bloco | Quantos |
|---|---|---|
| `{{CHECKOUT}}` | `planos` | 1 |
| `{{IMG:hero:1}}` | `hero` | 1 |
| `{{IMG:dor:1}}` | `dor` | 1 |
| `{{IMG:demo:1..6}}` | `demo` | 6 |
| `{{IMG:produto:1}}` | `produto` | 1 |
| `{{IMG:bonus:1..6}}` | `bonuses` | 6 |
| `{{IMG:planos:1}}` | `planos` | 1 |

## O que depende de uma decisão sua

| Assunto | Por que eu não decidi |
|---|---|
| **Quem assina a oferta** | O bloco `autoridade` foi removido: não há expert. É o gargalo da auditoria e a vantagem que sobrou sobre a concorrente, que não tem rosto no nicho de comida |
| **Depoimentos** | Bloco removido. Volta inteiro do molde quando houver 3 clientes reais com print |
| **A receita de verdade** | Massa de 24 rolinhos, 6 recheios, 3 coberturas, 12 horas de geladeira. Coerente com as receitas levantadas, mas ninguém assou |

## O que a página herdou do molde e está certo assim

Plano único a R$ 27,90 com âncora R$ 197, garantia de 30 dias e o bloco `acesso` **já
vinham no `pão de queijo.html`** — as peças de `templates/blocos/` foram recortadas dele.
Nada foi enxertado, porque não faltava nada.

## Conferido

- Zero resíduo do molde: nenhum "pão de queijo", "polvilho", "freezer", "Mari Dias",
  "+17.800 alunas" ou checkout antigo.
- Zero palavra abstrata: nenhum "guia", "curso", "método", "manual", "material", "conteúdo".
- `<section>` 12/12, `<div>` 145/145, `<style>` 1, `<script>` 2 — igual ao molde.
- Mais leve que o molde: 60.148 B contra 64.874 B, 559 nós contra 617.

## Próximo passo

Me passe o link do checkout e as imagens, ou diga qual linha do `DECISOES.md` você quer
diferente — a etapa correspondente se refaz.
