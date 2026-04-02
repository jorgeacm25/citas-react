const ModalInfoProducto = ({ producto, historial = [], onCerrar }) => {
  const nombreProducto = (producto?.nombre || '').toLowerCase();
  const historialProducto = historial.filter((entrada) => {
    if (!['entrada', 'salida'].includes(entrada.tipo)) return false;

    const datos = entrada.datos || {};
    if (datos.producto_id === producto.id) return true;
    if ((datos.producto_nombre || '').toLowerCase() === nombreProducto) return true;
    return (entrada.detalle || '').toLowerCase().includes(nombreProducto);
  });

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onCerrar}></div>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl sm:text-2xl font-bold text-purple-600 mb-4">Información del Producto</h3>
        
        <div className="space-y-3">
          <div className="border-b border-gray-200 pb-2">
            <p className="text-sm text-gray-500">ID</p>
            <p className="text-base sm:text-lg font-bold">{producto.id}</p>
          </div>
          
          <div className="border-b border-gray-200 pb-2">
            <p className="text-sm text-gray-500">Nombre</p>
            <p className="text-base sm:text-lg font-bold">{producto.nombre}</p>
          </div>
          
          <div className="border-b border-gray-200 pb-2">
            <p className="text-sm text-gray-500">Cantidad</p>
            <p className="text-base sm:text-lg font-bold">{producto.cantidad} {producto.unidad}</p>
          </div>
          
          <div className="border-b border-gray-200 pb-2">
            <p className="text-sm text-gray-500">Fecha de Entrada</p>
            <p className="text-base sm:text-lg font-bold">{producto.fechaEntrada}</p>
          </div>
          
          <div className="border-b border-gray-200 pb-2">
            <p className="text-sm text-gray-500">Fecha de Vencimiento</p>
            <p className="text-base sm:text-lg font-bold">{producto.fechaVencimiento || 'No especificada'}</p>
          </div>
          
          <div className="border-b border-gray-200 pb-2">
            <p className="text-sm text-gray-500">Operador</p>
            <p className="text-base sm:text-lg font-bold">{producto.operador || 'No especificado'}</p>
          </div>

          <div className="pt-2">
            <p className="text-sm text-gray-500 mb-2">Historial de Entradas y Salidas</p>
            {historialProducto.length > 0 ? (
              <div className="max-h-56 overflow-y-auto border border-purple-200 rounded-lg divide-y divide-purple-100">
                {historialProducto.map((entrada) => (
                  <div key={entrada.id} className="p-3 bg-purple-50/40">
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${entrada.tipo === 'entrada' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {entrada.tipo === 'entrada' ? 'Entrada' : 'Salida'}
                      </span>
                      <span className="text-xs text-gray-500">{entrada.fecha}</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-800">{entrada.accion}</p>
                    <p className="text-xs text-gray-600 whitespace-pre-wrap">{entrada.detalle}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-lg p-3">
                Este producto aun no tiene movimientos de entrada o salida registrados.
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onCerrar}
            className="px-6 py-2 border-2 border-purple-500 bg-purple-50 text-purple-700 font-bold rounded-lg hover:bg-purple-100"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalInfoProducto;