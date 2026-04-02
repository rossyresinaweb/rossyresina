// Pedidos locales deshabilitados — todos los pedidos vienen de la base de datos.
export function readOrdersStore<T = any>(): T[] { return []; }
export function writeOrdersStore(_data: any[]) {}
