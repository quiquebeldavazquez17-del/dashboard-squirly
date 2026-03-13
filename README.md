# Data Whiz Hub - KPI Dashboard

Este proyecto es un dashboard de KPI's sincronizado con Clockify.

## Requisitos
- Node.js & npm

## Configuración
El archivo `.env` ya está configurado con las claves necesarias, pero puedes editarlas si es necesario:
- `CLOCKIFY_API_KEY`: Tu API Key de Clockify.
- `CLOCKIFY_WORKSPACE_ID`: El ID del workspace.

## Cómo ejecutar el proyecto

### 1. Iniciar el Servidor API (Backend)
En una terminal, ejecuta:
```sh
npm run server
```
El servidor estará disponible en `http://localhost:3000`.

### 2. Iniciar el Dashboard (Frontend)
En otra terminal, ejecuta:
```sh
npm run dev
```
El dashboard se abrirá normalmente en `http://localhost:8080` (o el puerto que indique la consola).

### Ejecución combinada
Si deseas ejecutar ambos con un solo comando, puedes instalar `concurrently` o simplemente abrir dos pestañas de terminal.


**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
