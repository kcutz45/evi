# Cómo trabajamos en EVI

Guía práctica del flujo de §2.5 de `EVI_SPEC.md`. Si algo aquí contradice al spec, manda el spec.

## Reglas

- **`main` siempre funciona.** Nadie hace commit directo a `main`: todo entra por pull request (PR).
- **Una rama por funcionalidad:** `feat/registro-movimiento`, `fix/barra-presupuesto`, `docs/...`, `refactor/...`, `chore/...`.
- **Todo PR lo revisa otro integrante** antes de unirlo. Revisión mínima: la lista de la plantilla del PR (las 10 reglas anti-spaghetti).
- **La verificación automática tiene que estar en verde** (lint, tipos y build). Si falla, no se une.
- **Commits en español con prefijo:** `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`.
- **`.env.local` nunca se sube.** Cada integrante tiene el suyo (copia de `.env.example`).

---

## Primera vez (cada integrante, una sola vez)

1. Instalar [Git](https://git-scm.com/download/win) y [Node.js LTS](https://nodejs.org).
2. Decirle a Git quién sos (aparece en cada commit):

   ```bash
   git config --global user.name "Tu Nombre"
   git config --global user.email "tu@correo.com"
   ```

3. Descargar el proyecto (la dirección la da quien creó el repositorio en GitHub):

   ```bash
   git clone https://github.com/USUARIO/evi.git
   cd evi
   npm install
   ```

4. Crear `.env.local` copiando `.env.example` y pedir los valores al equipo **por un medio privado** (nunca por el grupo de WhatsApp ni en el repositorio).
5. Probar: `npm run dev` y abrir http://localhost:3000.

---

## Día a día

```bash
# 1. Partir siempre de main actualizado
git switch main
git pull

# 2. Crear la rama de tu tarea
git switch -c feat/nombre-corto

# 3. Trabajar... y guardar avances seguido
git add .
git commit -m "feat: agrega el formulario de metas"

# 4. Antes de subir, revisar lo mismo que revisa GitHub
npm run lint
npx tsc --noEmit

# 5. Subir la rama
git push -u origin feat/nombre-corto
```

6. GitHub muestra el botón **"Compare & pull request"**. Abrí el PR, llená la plantilla y asigná a otro integrante como revisor.
7. Cuando el revisor apruebe y la verificación esté en verde: **"Squash and merge"**.
8. Borrar la rama en GitHub (botón que aparece después del merge) y en tu compu:

   ```bash
   git switch main
   git pull
   git branch -d feat/nombre-corto
   ```

### Si `main` avanzó mientras trabajabas

```bash
git switch main
git pull
git switch feat/nombre-corto
git merge main
```

Si hay conflictos, VS Code los marca en el archivo: elegí qué versión queda, guardá, y `git add .` + `git commit`.

---

## Revisar el PR de otro

1. En GitHub: pestaña **Files changed** para leer el código.
2. Para probarlo en tu compu:

   ```bash
   git fetch
   git switch feat/la-rama-del-otro
   npm install
   npm run dev
   ```

3. Recorré la lista de la plantilla. Si algo falta: **Request changes** con un comentario concreto. Si todo cumple: **Approve**.

---

## Avisos útiles

- **Un solo `npm run dev` a la vez.** Si dice `Port 3000 is in use`, ya hay otro corriendo.
- **`npm run dev` sirve la rama activa.** Al cambiar de rama, la app cambia con ella.
- **Si una página da 404 sin motivo:** detené el servidor, borrá la carpeta `.next` y volvé a correr `npm run dev`.
