/**
 * routes.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Rutas de la app con nombre propio y las listas que usa el
 *            middleware para decidir quién puede entrar dónde.
 *
 * POR QUÉ EXISTE: El grupo app/(dashboard) NO aparece en la URL (los
 *            paréntesis son solo organización de Next.js), así que el
 *            middleware no puede preguntar "¿empieza con /dashboard?".
 *            Necesita esta lista. Al crear una pantalla protegida nueva,
 *            se agrega aquí.
 *
 * USADO EN:   middleware.ts, components/auth/*, app/(dashboard)/*
 * ---------------------------------------------------------------
 */

export const RUTA_INICIO = '/inicio';
export const RUTA_LOGIN = '/login';
export const RUTA_REGISTRO = '/registro';

// Carpetas de app/(dashboard) definidas en §2.3.
export const RUTAS_PROTEGIDAS = [RUTA_INICIO, '/dinero', '/eventos', '/reportes'];

// Quien ya tiene sesión no necesita ver estas: se le manda a /inicio.
export const RUTAS_DE_AUTH = [RUTA_LOGIN, RUTA_REGISTRO];

// Navegación COMPLETA (recarga la página) para los cambios de sesión:
// login, registro y cierre de sesión. Con router.replace() + refresh()
// Next.js 14 a veces dejaba la barra en /login mostrando /inicio. Una
// recarga garantiza URL correcta, que el middleware vea las cookies
// nuevas y que no quede en memoria nada del usuario anterior.
export function navegarConRecarga(ruta: string): void {
  window.location.replace(ruta);
}

// '/eventos/123' cuenta como '/eventos'; '/eventosx' no.
export function coincideCon(pathname: string, rutas: string[]): boolean {
  return rutas.some((ruta) => pathname === ruta || pathname.startsWith(`${ruta}/`));
}
