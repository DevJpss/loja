"use client";

import Link from "next/link";

type Props = {
  error: unknown;
  retry: () => void;
};

const styles = {
  body: {
    margin: 0,
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f7f7f8",
    color: "#111217",
    fontFamily: "Arial, Helvetica, sans-serif",
    padding: 24,
  },
  card: {
    maxWidth: 560,
    background: "#ffffff",
    border: "1px solid #cacdd3",
    padding: 32,
  },
  label: {
    color: "#b54708",
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: "0.14em",
    textTransform: "uppercase" as const,
  },
  title: {
    fontSize: 40,
    lineHeight: 1.05,
    margin: "12px 0 16px",
    textTransform: "uppercase" as const,
  },
  text: { color: "#5c6070", lineHeight: 1.6 },
  actions: { display: "flex", flexWrap: "wrap" as const, gap: 12, marginTop: 28 },
  primary: {
    minHeight: 48,
    padding: "0 24px",
    border: 0,
    background: "#111217",
    color: "#ffffff",
    fontWeight: 700,
    cursor: "pointer",
  },
  secondary: {
    minHeight: 48,
    padding: "0 24px",
    border: "2px solid #111217",
    color: "#111217",
    fontWeight: 700,
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
  },
};

export default function GlobalError({ retry }: Props) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Algo deu errado | Evidence Reps</title>
      </head>
      <body style={styles.body}>
        <div style={styles.card}>
          <p style={styles.label}>Ops</p>
          <h1 style={styles.title}>Algo deu errado</h1>
          <p style={styles.text}>
            Não conseguimos carregar esta página agora. Tente novamente ou volte ao
            início da loja.
          </p>
          <div style={styles.actions}>
            <button type="button" onClick={retry} style={styles.primary}>
              Tentar novamente
            </button>
            <Link href="/" style={styles.secondary}>
              Voltar ao início
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
