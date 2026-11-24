import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import ScrollReveal from "@/components/ScrollReveal";
import { jsonLdHtml } from "@/lib/jsonld";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Perguntas frequentes",
  description:
    "Como funciona a compra, o pagamento, o frete e o acompanhamento do pedido na Evidence Reps.",
  alternates: { canonical: "/faq" },
  openGraph: {
    title: `Perguntas frequentes | ${SITE_NAME}`,
    description: "Tire dúvidas rápidas antes de escolher seus acessórios de treino.",
    url: "/faq",
    type: "website",
  },
};

const questions = [
  {
    question: "Como funciona a compra?",
    answer:
      "Você escolhe o item e paga neste site com Pix ou cartão. Compramos o produto no fornecedor com recurso próprio e enviamos direto para você.",
  },
  {
    question: "Vocês usam meus dados de pagamento na loja parceira?",
    answer:
      "Não. Os dados de cartão ficam no gateway de pagamento. Nunca informamos CPF nem cartão do cliente ao fornecedor.",
  },
  {
    question: "Como acompanho meu pedido?",
    answer:
      "Ao finalizar, você recebe um código e um link de acompanhamento. A página pública mostra o status e os dados de entrega de forma resumida, sem exibir endereço, CEP ou telefone completos.",
  },
  {
    question: "Quanto custa o frete?",
    answer:
      "Pedidos acima de R$ 299 têm frete grátis. Nos demais casos, o valor é calculado no checkout conforme a UF de entrega.",
  },
  {
    question: "E se o item estiver indisponível no fornecedor?",
    answer:
      "Quando marcamos um item como indisponível, a venda fica bloqueada no site. Produtos esgotados manualmente não voltam a ser vendidos automaticamente.",
  },
  {
    question: "Como sei se o acessório serve no meu equipamento?",
    answer:
      "A página de cada produto traz a ficha técnica e, quando aplicável, um bloco de compatibilidade. Confira as medidas antes de comprar.",
  },
  {
    question: "Vocês vendem suplementos?",
    answer:
      "Não. O catálogo reúne apenas acessórios e equipamentos de treino.",
  },
];

export default function FaqPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };

  return (
    <main className="px-4 py-12 sm:px-8 lg:px-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(jsonLd) }}
      />
      <ScrollReveal depth={0.85}>
        <Breadcrumbs items={[{ label: "Início", href: "/" }, { label: "Perguntas frequentes" }]} />
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
          Ajuda
        </span>
        <h1 className="mt-2 font-display text-6xl font-bold uppercase sm:text-7xl">
          Perguntas frequentes
        </h1>
        <p className="mb-10 mt-4 max-w-2xl text-muted">
          Respostas rápidas sobre pagamento, entrega e acompanhamento do pedido.
        </p>

        <div className="max-w-3xl divide-y divide-line border-y border-line">
          {questions.map(({ question, answer }) => (
            <details key={question} className="group py-4">
              <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-4 font-semibold marker:content-none">
                {question}
                <span
                  aria-hidden="true"
                  className="text-2xl leading-none text-accent transition-transform duration-200 group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="faq-answer mt-3 max-w-2xl text-sm leading-relaxed text-muted">{answer}</p>
            </details>
          ))}
        </div>
      </ScrollReveal>
    </main>
  );
}
