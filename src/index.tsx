import "spadium";
import { createRoot } from "react-dom/client";
import Setup from "./Setup";

const root = document.getElementById("root");

if (!root) throw new TypeError("Unable to find root.");

const r = createRoot(root);

r.render(<Setup />);
