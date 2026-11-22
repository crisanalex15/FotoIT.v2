/**
 * Porneste o descarcare nativa a browserului (cu bara lui de progres), fara a tine fisierul
 * in memoria paginii. Raspunsul ajunge intr-un iframe ascuns, deci pagina nu se schimba
 * nici daca serverul raspunde cu eroare.
 */
const FRAME_NAME = "fotoit-download-frame";

function getFrame(): HTMLIFrameElement {
  let frame = document.querySelector<HTMLIFrameElement>(`iframe[name="${FRAME_NAME}"]`);
  if (!frame) {
    frame = document.createElement("iframe");
    frame.name = FRAME_NAME;
    frame.style.display = "none";
    frame.setAttribute("aria-hidden", "true");
    document.body.appendChild(frame);
  }
  return frame;
}

export function startDownload(
  url: string,
  options: { method?: "GET" | "POST"; fields?: Record<string, string | string[]> } = {}
) {
  getFrame();
  const form = document.createElement("form");
  form.method = options.method ?? "GET";
  form.action = url;
  form.target = FRAME_NAME;
  form.style.display = "none";

  for (const [name, value] of Object.entries(options.fields ?? {})) {
    for (const v of Array.isArray(value) ? value : [value]) {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = v;
      form.appendChild(input);
    }
  }

  document.body.appendChild(form);
  form.submit();
  form.remove();
}
