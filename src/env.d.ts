declare namespace preact {
  namespace JSX {
    interface IntrinsicElements {
      "spadium-proxy": SpadiumProxyAttributes;
    }
  }
}

interface SpadiumProxyAttributes
  extends preact.JSX.HTMLAttributes<HTMLElement> {
  src?: string;
  server?: string;
}
