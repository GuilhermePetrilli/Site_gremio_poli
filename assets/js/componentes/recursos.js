// Cartões das subpáginas de uma ramificação, para páginas escritas à mão.
// Uso: <div data-componente="recursos" data-id="aluno"></div>

import { cartoes } from "./pagina.js?v=202610071025";

export default function recursos(alvo, contexto) {
  const achado = contexto.encontrar(alvo.dataset.id);
  if (achado) alvo.innerHTML = cartoes(contexto, achado.no, achado.ancestrais);
}
