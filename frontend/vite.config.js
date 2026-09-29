import { defineConfig } from "vite";

import react from "@vitejs/plugin-react"; // el nombre puede variar según la plantilla

export default defineConfig({
plugins: [react()],
server: {
// TODO (investigación): ¿qué opción de Vite reenvía las peticiones
// que comienzan con "/api" hacia el servidor de Django?
// Documenta en el README qué hace y por qué la necesitas.
},
});