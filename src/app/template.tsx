import { ViewTransition, type ReactNode } from "react";

// O template é remontado a cada troca de rota, então o ViewTransition pareia
// o conteúdo antigo com o novo. Em navegadores sem a API, o wrapper abaixo
// recebe uma animação CSS de entrada (ver globals.css).
export default function Template({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter="er-page-in" exit="er-page-out" default="none">
      <div className="er-page-enter">{children}</div>
    </ViewTransition>
  );
}
