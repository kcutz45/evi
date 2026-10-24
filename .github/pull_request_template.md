## Qué cambia

<!-- Una o dos frases: qué hace este PR y por qué. -->

## Cómo probarlo

<!-- Pasos exactos para que quien revisa lo vea funcionando. -->
1.
2.

## Revisión mínima — reglas anti-spaghetti (EVI_SPEC.md §2.2)

- [ ] 1. Sin credenciales en el código: todo secreto viene de `process.env`
- [ ] 2. Sin estilos inline: solo clases de Tailwind y colores de `tokens.ts`
- [ ] 3. Ningún archivo `.ts`/`.tsx` pasa de 200 líneas
- [ ] 4. Ninguna función pasa de 40 líneas ni de 3 niveles de anidación
- [ ] 5. Sin números mágicos: los umbrales viven en `lib/constants.ts`
- [ ] 6. Sin `any` en TypeScript
- [ ] 7. Toda tabla nueva tiene Row Level Security
- [ ] 8. Toda función `SECURITY DEFINER` rechaza a quien no tiene sesión
- [ ] 9. Toda vista expuesta usa `security_invoker = true`
- [ ] 10. Las columnas que decide el servidor no se escriben desde la API

> Las reglas 1–6 las revisa también la verificación automática (lint, tipos y build).
> Las 7–10 solo aplican si el PR toca `supabase/schema.sql`.

## Definición de Terminado (§7)

- [ ] Funciona en un celular real
- [ ] Tiene estado de carga, vacío y error
- [ ] Los componentes visuales no consultan la base de datos
- [ ] Dispara los eventos de telemetría que le corresponden
- [ ] Tiene comentarios de cabecera y de decisión
- [ ] Probado con dos usuarios distintos: el segundo no ve los datos del primero
- [ ] Textos en español y montos en formato `Q1,250.00`
