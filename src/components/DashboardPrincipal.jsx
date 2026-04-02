import Tooltip from './UI/Tooltip.jsx';

const obtenerTopCombos = (historial) => {
  const conteo = {};

  historial.forEach((item) => {
    if (item.tipo !== 'salida') return;
    const detalle = (item.detalle || '').toLowerCase();
    if (!detalle.includes('combo')) return;

    const match = item.detalle.match(/combo\s+([^()]+)/i);
    if (!match) return;

    const nombreCombo = match[1].trim();
    if (!nombreCombo) return;

    conteo[nombreCombo] = (conteo[nombreCombo] || 0) + 1;
  });

  return Object.entries(conteo)
    .map(([nombre, solicitudes]) => ({ nombre, solicitudes }))
    .sort((a, b) => b.solicitudes - a.solicitudes)
    .slice(0, 3);
};

const parsearFechaHistorial = (fechaRaw) => {
  if (!fechaRaw || typeof fechaRaw !== 'string') return null;

  // Formato ISO parcial: YYYY-MM-DD HH:mm
  if (/^\d{4}-\d{2}-\d{2}/.test(fechaRaw)) {
    const isoNormalizada = fechaRaw.replace(' ', 'T');
    const fecha = new Date(isoNormalizada);
    return Number.isNaN(fecha.getTime()) ? null : fecha;
  }

  // Formato local: DD/MM/YYYY HH:mm
  const match = fechaRaw.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2}))?/);
  if (match) {
    const dia = Number(match[1]);
    const mes = Number(match[2]) - 1;
    const anio = Number(match[3]);
    const hora = Number(match[4] || 0);
    const minuto = Number(match[5] || 0);
    const fecha = new Date(anio, mes, dia, hora, minuto);
    return Number.isNaN(fecha.getTime()) ? null : fecha;
  }

  const fallback = new Date(fechaRaw);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
};

const esMismoDia = (a, b) => {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};

const DashboardPrincipal = ({ productos, historial, alertas }) => {
  const totalTiposProducto = productos.length;
  const totalUnidades = productos.reduce((acc, p) => acc + (Number(p.cantidad) || 0), 0);

  const hoy = new Date();
  const movimientosHoy = historial.filter((item) => {
    const fechaItem = parsearFechaHistorial(item.fecha);
    if (!fechaItem) return false;
    return esMismoDia(fechaItem, hoy);
  });
  const entradasHoy = movimientosHoy.filter((item) => item.tipo === 'entrada').length;
  const salidasHoy = movimientosHoy.filter((item) => item.tipo === 'salida').length;

  const topCombos = obtenerTopCombos(historial);

  return (
    <div className="mt-8 px-4 sm:px-6 md:px-8 pb-8">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 w-full max-w-6xl mx-auto border-2 border-orange-100 transition-colors duration-300">
        <h2 className="text-2xl sm:text-3xl font-bold text-orange-600 mb-2">Dashboard Principal</h2>
        <p className="text-sm text-gray-600 mb-6">Resumen rapido del estado del almacen</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Tooltip texto="Cantidad diferente de artículos en almacén" posicion="abajo">
            <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-4 transition-all duration-300 hover:shadow-lg animate-slide-in">
              <p className="text-xs text-blue-700 font-bold uppercase">Total de productos</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-blue-900 mt-2">{totalTiposProducto}</p>
              <p className="text-xs text-blue-700 mt-1">{totalUnidades} unidades en stock</p>
            </div>
          </Tooltip>

          <Tooltip texto="Productos con stock por debajo del umbral de 50 unidades" posicion="abajo">
            <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-4 transition-all duration-300 hover:shadow-lg animate-slide-in"
              style={{ animationDelay: '0.1s' }}>
              <p className="text-xs text-amber-700 font-bold uppercase">Stock bajo</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-amber-900 mt-2">{alertas.stockBajo.length}</p>
              <p className="text-xs text-amber-700 mt-1">Umbral actual: 50</p>
            </div>
          </Tooltip>

          <Tooltip texto="Entradas y salidas registradas hoy" posicion="abajo">
            <div className="rounded-xl border-2 border-purple-200 bg-purple-50 p-4 transition-all duration-300 hover:shadow-lg animate-slide-in"
              style={{ animationDelay: '0.2s' }}>
              <p className="text-xs text-purple-700 font-bold uppercase">Movimientos del dia</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-purple-900 mt-2">{movimientosHoy.length}</p>
              <p className="text-xs text-purple-700 mt-1">Entradas: {entradasHoy} | Salidas: {salidasHoy}</p>
            </div>
          </Tooltip>

          <Tooltip texto="Top 3 combos más solicitados" posicion="abajo">
            <div className="rounded-xl border-2 border-rose-200 bg-rose-50 p-4 transition-all duration-300 hover:shadow-lg animate-slide-in"
              style={{ animationDelay: '0.3s' }}>
              <p className="text-xs text-rose-700 font-bold uppercase">Combos mas solicitados</p>
              {topCombos.length > 0 ? (
                <div className="mt-2 space-y-1">
                  {topCombos.map((combo) => (
                    <p key={combo.nombre} className="text-xs text-rose-900 font-semibold">
                      {combo.nombre}: {combo.solicitudes}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-rose-700 mt-2">Sin registros de salida de combos</p>
              )}
            </div>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default DashboardPrincipal;
