import { useState, useEffect } from 'react';

const ModalModificarComboSalida = ({ combo, productos, onGuardar, onCerrar }) => {
  const [nombreCombo, setNombreCombo] = useState('');
  const [cantidadCombo, setCantidadCombo] = useState(1);
  const [productosCombo, setProductosCombo] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (combo) {
      setNombreCombo(combo.nombre);
      setProductosCombo(combo.productos.map(p => ({ ...p })));
    }
  }, [combo]);

  const productosFiltrados = productos.filter(p => 
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) &&
    !productosCombo.some(pc => pc.nombre === p.nombre)
  );

  const agregarProductoCombo = (producto) => {
    setProductosCombo([
      ...productosCombo,
      {
        nombre: producto.nombre,
        cantidad: 1,
        unidad: producto.unidad
      }
    ]);
    setBusqueda('');
  };

  const actualizarCantidadProducto = (index, nuevaCantidad) => {
    const nuevos = [...productosCombo];
    nuevos[index].cantidad = nuevaCantidad;
    setProductosCombo(nuevos);
  };

  const actualizarUnidadProducto = (index, nuevaUnidad) => {
    const nuevos = [...productosCombo];
    nuevos[index].unidad = nuevaUnidad;
    setProductosCombo(nuevos);
  };

  const eliminarProductoCombo = (index) => {
    setProductosCombo(productosCombo.filter((_, i) => i !== index));
  };

  const handleGuardar = () => {
    if (!nombreCombo.trim()) {
      setError('El nombre del combo es obligatorio');
      return;
    }

    if (cantidadCombo <= 0) {
      setError('La cantidad debe ser mayor a 0');
      return;
    }

    if (productosCombo.length === 0) {
      setError('El combo debe tener al menos un producto');
      return;
    }

    // Verificar stock para los productos del combo
    const productosSinStock = [];
    productosCombo.forEach(item => {
      const producto = productos.find(p => p.nombre === item.nombre);
      if (!producto || producto.cantidad < item.cantidad * cantidadCombo) {
        productosSinStock.push(`${item.nombre} (requiere ${item.cantidad * cantidadCombo} ${item.unidad}, disponible: ${producto?.cantidad || 0})`);
      }
    });

    if (productosSinStock.length > 0) {
      setError(`Stock insuficiente para:\n${productosSinStock.join('\n')}`);
      return;
    }

    onGuardar({
      ...combo,
      nombre: nombreCombo,
      productos: productosCombo,
      cantidadSalida: cantidadCombo
    });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onCerrar}></div>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-orange-600 mb-4">Editar Combo para Salida</h2>

        {error && (
          <div className="bg-red-600 text-white text-center p-3 text-sm rounded-lg mb-4 whitespace-pre-line">
            {error}
          </div>
        )}

        {/* Nombre y Cantidad del Combo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-gray-700 font-bold text-sm mb-2">Nombre del Combo</label>
            <input
              type="text"
              value={nombreCombo}
              onChange={(e) => setNombreCombo(e.target.value)}
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
              placeholder="Nombre del combo"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-bold text-sm mb-2">Cantidad de Combos a Salir</label>
            <input
              type="number"
              value={cantidadCombo}
              onChange={(e) => setCantidadCombo(parseInt(e.target.value) || 0)}
              min="1"
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
              placeholder="1"
            />
          </div>
        </div>

        {/* Agregar Productos */}
        <div className="mb-6 p-4 bg-orange-50 rounded-lg border-2 border-orange-200">
          <label className="block text-gray-700 font-bold text-sm mb-2">
            Agregar Productos al Combo
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar y agregar productos..."
              className="flex-1 p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
            />
          </div>

          {busqueda && productosFiltrados.length > 0 && (
            <div className="mt-2 max-h-40 overflow-y-auto border-2 border-gray-200 rounded-lg">
              {productosFiltrados.map((producto, idx) => (
                <div
                  key={idx}
                  className="p-3 hover:bg-orange-100 cursor-pointer border-b last:border-b-0 flex justify-between items-center"
                >
                  <div>
                    <span className="font-medium">{producto.nombre}</span>
                    <span className="text-xs text-gray-500 ml-2">Stock: {producto.cantidad} {producto.unidad}</span>
                  </div>
                  <button
                    onClick={() => agregarProductoCombo(producto)}
                    className="px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded hover:bg-orange-600"
                  >
                    Agregar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tabla de Productos en el Combo */}
        <div>
          <h3 className="text-lg font-bold text-gray-700 mb-3">Productos del Combo</h3>
          {productosCombo.length > 0 ? (
            <div className="overflow-x-auto">
              <div className="max-h-96 overflow-y-auto border-2 border-orange-200 rounded-lg">
                <table className="w-full border-collapse">
                  <thead className="sticky top-0 bg-orange-50 z-10">
                    <tr>
                      <th className="border-2 border-orange-200 p-2 text-left text-xs font-bold">#</th>
                      <th className="border-2 border-orange-200 p-2 text-left text-xs font-bold">Producto</th>
                      <th className="border-2 border-orange-200 p-2 text-left text-xs font-bold">Cantidad</th>
                      <th className="border-2 border-orange-200 p-2 text-left text-xs font-bold">Unidad</th>
                      <th className="border-2 border-orange-200 p-2 text-left text-xs font-bold">Stock Disponible</th>
                      <th className="border-2 border-orange-200 p-2 text-left text-xs font-bold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productosCombo.map((producto, index) => {
                      const productoEnStock = productos.find(p => p.nombre === producto.nombre);
                      const cantidadNecesaria = producto.cantidad * cantidadCombo;
                      const tieneStock = productoEnStock && productoEnStock.cantidad >= cantidadNecesaria;

                      return (
                        <tr key={index} className={`hover:bg-orange-50/50 ${!tieneStock ? 'bg-red-50' : ''}`}>
                          <td className="border-2 border-orange-200 p-2 text-xs">{index + 1}</td>
                          <td className="border-2 border-orange-200 p-2 text-xs font-medium">{producto.nombre}</td>
                          <td className="border-2 border-orange-200 p-2 text-xs">
                            <input
                              type="number"
                              value={producto.cantidad}
                              onChange={(e) => actualizarCantidadProducto(index, parseInt(e.target.value) || 0)}
                              onFocus={(e) => e.target.select()}
                              className="w-20 p-1 border border-orange-300 rounded text-xs"
                              placeholder="0"
                              min="0"
                            />
                          </td>
                          <td className="border-2 border-orange-200 p-2 text-xs">
                            <select
                              value={producto.unidad}
                              onChange={(e) => actualizarUnidadProducto(index, e.target.value)}
                              className="p-1 border border-orange-300 rounded text-xs"
                            >
                              <option value="u">Unidad (u)</option>
                              <option value="lb">Libra (lb)</option>
                              <option value="kg">Kilogramo (kg)</option>
                              <option value="g">Gramo (g)</option>
                              <option value="L">Litro (L)</option>
                            </select>
                          </td>
                          <td className={`border-2 border-orange-200 p-2 text-xs font-bold ${!tieneStock ? 'text-red-600' : ''}`}>
                            {productoEnStock?.cantidad || 0} {producto.unidad}
                            {!tieneStock && (
                              <div className="text-red-600 text-[10px]">
                                Necesita: {cantidadNecesaria} {producto.unidad}
                              </div>
                            )}
                          </td>
                          <td className="border-2 border-orange-200 p-2">
                            <button
                              onClick={() => eliminarProductoCombo(index)}
                              className="px-2 py-1 border-2 border-red-500 bg-red-50 text-red-700 font-bold rounded-lg hover:bg-red-100 transition-all duration-300 text-[10px]"
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-500 py-6 border-2 border-dashed border-gray-300 rounded-lg">
              No hay productos en el combo. Agregue productos desde arriba.
            </p>
          )}
        </div>

        {/* Botones de Acción */}
        <div className="mt-6 flex gap-3 justify-end">
          <button
            onClick={onCerrar}
            className="px-6 py-3 border-2 border-gray-300 bg-gray-50 text-gray-700 font-bold rounded-lg hover:bg-gray-100 transition-all duration-300"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            className="px-6 py-3 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 transition-all duration-300"
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalModificarComboSalida;
