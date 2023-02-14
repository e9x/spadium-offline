declare namespace JSX {
  interface IntrinsicElements {
    "spadium-proxy": SpadiumProxyAttributes;
  }
}

interface SpadiumProxyAttributes
  extends React.DetailedHTMLProps<
    React.AnchorHTMLAttributes<HTMLElement>,
    HTMLElement
  > {
  src?: string;
  server?: string;
}
