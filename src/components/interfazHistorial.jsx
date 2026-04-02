import { useState } from 'react';

const InterfazHistorial = ({ historial }) => {
  const [filtro, setFiltro] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [detalleSeleccionado, setDetalleSeleccionado] = useState(null);

  const formatearEtiqueta = (texto) => {
    if (!texto) return '';
    return texto
      .replace(/_/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/^./, (c) => c.toUpperCase());
  };

  const renderValorDato = (valor, nivel = 0) => {
    if (valor === null || valor === undefined || valor === '') {
      return <span className="text-gray-400 italic">No especificado</span>;
    }

    if (Array.isArray(valor)) {
      if (valor.length === 0) {
        return <span className="text-gray-400 italic">Sin elementos</span>;
      }

      return (
        <div className="space-y-2">
          {valor.map((item, index) => (
            <div
              key={`${nivel}-${index}`}
              className="bg-white border border-purple-200 rounded-lg p-3"
            >
              {typeof item === 'object' && item !== null ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Object.entries(item).map(([k, v]) => (
                    <div key={k}>
                      <p className="text-[11px] font-semibold text-purple-700 uppercase tracking-wide">
                        {formatearEtiqueta(k)}
                      </p>
                      <p className="text-sm text-gray-800 break-words">
                        {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-800 break-words">{String(item)}</p>
              )}
            </div>
          ))}
        </div>
      );
    }

    if (typeof valor === 'object') {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {Object.entries(valor).map(([k, v]) => (
            <div key={k} className="bg-white border border-purple-200 rounded-lg p-3">
              <p className="text-[11px] font-semibold text-purple-700 uppercase tracking-wide mb-1">
                {formatearEtiqueta(k)}
              </p>
              <p className="text-sm text-gray-800 break-words">
                {typeof v === 'object' ? JSON.stringify(v) : String(v)}
              </p>
            </div>
          ))}
        </div>
      );
    }

    return <span className="text-sm text-gray-800 break-words">{String(valor)}</span>;
  };

  const getColorPorTipo = (tipo) => {
    switch(tipo) {
      case 'entrada': return 'bg-green-100 text-green-700 border-green-300';
      case 'salida': return 'bg-red-100 text-red-700 border-red-300';
      case 'modificacion': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'creacion': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'eliminacion': return 'bg-red-100 text-red-700 border-red-300';
      case 'login': return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'logout': return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'registro': return 'bg-indigo-100 text-indigo-700 border-indigo-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getIconoPorTipo = (tipo) => {
    switch(tipo) {
      case 'entrada':
        return (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        );
      case 'salida':
        return (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        );
      case 'modificacion':
      case 'creacion':
        return (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        );
      case 'eliminacion':
        return (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        );
      default:
        return (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const historialFiltrado = historial.filter(entry => {
    // Filtrar por tipo
    if (filtro !== 'todos' && entry.tipo !== filtro) return false;
    
    // Filtrar por búsqueda
    if (busqueda) {
      const textoBusqueda = busqueda.toLowerCase();
      return (
        entry.accion.toLowerCase().includes(textoBusqueda) ||
        entry.detalle.toLowerCase().includes(textoBusqueda) ||
        entry.usuario.toLowerCase().includes(textoBusqueda)
      );
    }
    
    return true;
  });

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 w-full max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-center text-purple-600 mb-6">Historial de Movimientos</h2>
      
      {/* Filtros */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar en historial..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full p-3 border-2 border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400"
          />
        </div>
        <div className="sm:w-48">
          <select
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="w-full p-3 border-2 border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400"
          >
            <option value="todos">Todos</option>
            <option value="entrada">Entradas</option>
            <option value="salida">Salidas</option>
            <option value="modificacion">Modificaciones</option>
            <option value="creacion">Creaciones</option>
            <option value="eliminacion">Eliminaciones</option>
            <option value="login">Login/Logout</option>
          </select>
        </div>
      </div>

      {/* Lista de historial */}
      <div className="border-2 border-purple-100 rounded-lg overflow-hidden">
        <div className="max-h-[500px] overflow-y-auto">
          {historialFiltrado.length > 0 ? (
            <div className="divide-y divide-purple-100">
              {historialFiltrado.map((entry) => (
                <div 
                  key={entry.id} 
                  onClick={() => setDetalleSeleccionado(entry)}
                  className="p-4 hover:bg-purple-50/50 transition-colors cursor-pointer border-l-4 border-l-transparent hover:border-l-purple-500"
                >
                  <div className="flex items-start gap-4">
                    {/* Icono */}
                    <div className={`p-2 rounded-lg ${getColorPorTipo(entry.tipo)}`}>
                      {getIconoPorTipo(entry.tipo)}
                    </div>
                    
                    {/* Contenido */}
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1">
                        <span className="font-bold text-gray-800">{entry.accion}</span>
                        <span className="text-xs text-gray-500">{entry.fecha}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{entry.detalle}</p>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getColorPorTipo(entry.tipo)}`}>
                          {entry.tipo}
                        </span>
                        <span className="text-xs text-gray-500">por: {entry.usuario}</span>
                        <span className="text-xs text-purple-600 font-semibold">Ver detalles →</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No hay registros que coincidan con los filtros
            </div>
          )}
        </div>
      </div>

      {/* Resumen */}
      <div className="mt-4 text-sm text-gray-500 text-right">
        Total de registros: {historialFiltrado.length}
      </div>

      {/* Modal de detalles */}
      {detalleSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto border-2 border-purple-100">
            {/* Encabezado */}
            <div className="sticky top-0 bg-white z-10 pb-4 mb-5 border-b border-purple-100 flex justify-between items-start gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-2 rounded-lg ${getColorPorTipo(detalleSeleccionado.tipo)}`}>
                    {getIconoPorTipo(detalleSeleccionado.tipo)}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-800">{detalleSeleccionado.accion}</h3>
                </div>
                <p className={`text-xs px-2 py-1 rounded-full inline-block ${getColorPorTipo(detalleSeleccionado.tipo)}`}>
                  {formatearEtiqueta(detalleSeleccionado.tipo)}
                </p>
              </div>
              <button
                onClick={() => setDetalleSeleccionado(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold w-10 h-10 rounded-full hover:bg-gray-100"
                aria-label="Cerrar detalle"
              >
                ✕
              </button>
            </div>

            {/* Contenido */}
            <div className="space-y-4">
              {/* Información general */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-sm font-bold text-gray-600 mb-1">Fecha y Hora</p>
                  <p className="text-base sm:text-lg font-semibold text-gray-800 break-words">{detalleSeleccionado.fecha}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-sm font-bold text-gray-600 mb-1">Realizado por</p>
                  <p className="text-base sm:text-lg font-semibold text-gray-800 break-words">{detalleSeleccionado.usuario}</p>
                </div>
              </div>

              {/* Detalle principal */}
              <div className="bg-blue-50 border-2 border-blue-200 p-4 rounded-lg">
                <p className="text-sm font-bold text-blue-700 mb-2">Descripción del Movimiento</p>
                <p className="text-base text-gray-800 whitespace-pre-wrap break-words">{detalleSeleccionado.detalle}</p>
              </div>

              {/* Datos adicionales si existen */}
              {detalleSeleccionado.datos && Object.keys(detalleSeleccionado.datos).length > 0 && (
                <div className="bg-purple-50 border-2 border-purple-200 p-4 rounded-lg">
                  <p className="text-sm font-bold text-purple-700 mb-3">Información Adicional</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(detalleSeleccionado.datos).map(([clave, valor]) => {
                      const ocupaAnchoCompleto = Array.isArray(valor) || (typeof valor === 'object' && valor !== null);

                      return (
                        <div key={clave} className={ocupaAnchoCompleto ? 'col-span-1 sm:col-span-2' : ''}>
                          <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-1">
                            {formatearEtiqueta(clave)}
                          </p>
                          <div className="bg-white border border-purple-200 rounded-lg p-3">
                            {renderValorDato(valor)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Botón cerrar */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setDetalleSeleccionado(null)}
                className="px-6 py-2 border-2 border-gray-500 bg-gray-50 text-gray-700 font-bold rounded-lg hover:bg-gray-100 transition-all duration-300"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterfazHistorial;