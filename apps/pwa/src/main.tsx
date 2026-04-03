import { RouterProvider } from "@tanstack/react-router";
import { createRoot } from "react-dom/client";

import { createRouter } from "./router.gen";

const router = createRouter();

const root = document.getElementById("root");
if (root) {
  root.innerHTML = "";
  createRoot(root).render(<RouterProvider router={router} />);
}
