import { useState } from 'react';
import ModalModificarComboSalida from './ModalModificarComboSalida';

const InterfazSalida = ({ 
  productos, 
  combos, 
  clientesFrecuentes = [], 
  onCancelar, 
  adminId, 
  userId 
}) => {
  console.log('tipoSalida actual:', tipoSalida);
  const [tipoSalida, setTipoSalida] = useState('producto');
  const [itemsSalida, setItemsSalida] = useState([]);
  const [comboSeleccionado, setComboSeleccionado] = useState(null);
  const [comboEditado, setComboEditado] = useState(null);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [motivo, setMotivo] = useState('');
  const [motivoOtro, setMotivoOtro] = useState('');
  const [clienteVenta, setClienteVenta] = useState('');
  const [clienteVentaNuevo, setClienteVentaNuevo] = useState('');
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [error, setError] = useState('');
  const [modalEditarComboAbierto, setModalEditarComboAbierto] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [salidaDate, setSalidaDate] = useState(new Date().toISOString().slice(0, 16));
  const [cantidadCombos, setCantidadCombos] = useState('');

  const clienteVentaFinal = clienteVenta === '__nuevo__'
    ? clienteVentaNuevo.trim()
    : clienteVenta.trim();

  const productosFiltrados = productos.filter(p => 
    p.nombre?.toLowerCase().includes(terminoBusqueda.toLowerCase()) &&
    p.cantidad > 0
  );

  const agregarItem = () => {
    if (!productoSeleccionado) {
      setError('Debe seleccionar un producto');
      return;
    }
    if (cantidad <= 0) {
      setError('La cantidad debe ser mayor a 0');
      return;
    }
    if (cantidad > productoSeleccionado.cantidad) {
      setError(`Stock insuficiente. Disponible: ${productoSeleccionado.cantidad} ${productoSeleccionado.unidad}`);
      return;
    }

    const existe = itemsSalida.find(item => item.producto.id === productoSeleccionado.id);
    if (existe) {
      setError('Este producto ya está en la lista');
      return;
    }

    setItemsSalida([...itemsSalida, {
      producto: productoSeleccionado,
      cantidad: cantidad
    }]);
    setProductoSeleccionado(null);
    setCantidad(1);
    setTerminoBusqueda('');
    setError('');
  };

  const eliminarItem = (index) => {
    setItemsSalida(itemsSalida.filter((_, i) => i !== index));
  };

  const actualizarCantidad = (index, nuevaCantidad) => {
    const item = itemsSalida[index];
    if (nuevaCantidad > item.producto.cantidad) {
      alert(`Stock insuficiente. Disponible: ${item.producto.cantidad} ${item.producto.unidad}`);
      return;
    }
    if (nuevaCantidad <= 0) {
      eliminarItem(index);
      return;
    }
    const nuevosItems = [...itemsSalida];
    nuevosItems[index].cantidad = nuevaCantidad;
    setItemsSalida(nuevosItems);
  };

  const comboParaUsar = comboEditado || comboSeleccionado;

  const handleEditarCombo = () => {
    if (comboSeleccionado) {
      setComboEditado(JSON.parse(JSON.stringify(comboSeleccionado)));
      setModalEditarComboAbierto(true);
    }
  };

  const handleGuardarComboEditado = (comboModificado) => {
    setComboEditado(comboModificado);
    setModalEditarComboAbierto(false);
  };

  const handleRegistrarSalida = async () => {
    if (!motivo) {
      setError('Debe seleccionar un motivo para la salida');
      return;
    }

    if (motivo === 'venta' && !clienteVentaFinal) {
      setError('Debe indicar el nombre del cliente para registrar la venta');
      return;
    }

    const motivoFinal = motivo === 'otro' ? motivoOtro.trim() : motivo;
    if (motivo === 'otro' && !motivoFinal) {
      setError('Debe describir el motivo de la salida');
      return;
    }

    const dateTime = new Date(salidaDate).toISOString();
    const token = localStorage.getItem('token');
    let body = {};
    let url = '';

    if (tipoSalida === 'producto') {
      if (itemsSalida.length === 0) {
        setError('Debe agregar al menos un producto a la salida');
        return;
      }
      url = '/api/productOut';
      body = {
        products: itemsSalida.map(item => ({
          id: item.producto.id,
          quantity: item.cantidad
        })),
        productOutDate: dateTime,
        outMotive: motivoFinal,
        adminId: adminId || null,
        userId: userId || null,
        customer: motivo === 'venta' ? clienteVentaFinal : ''
      };
    } else { // combo
      if (!comboParaUsar) {
        setError('Debe seleccionar un combo');
        return;
      }
      let cantidadCombosNum = null;
      if (cantidadCombos !== '' && !isNaN(parseFloat(cantidadCombos))) {
        cantidadCombosNum = parseFloat(cantidadCombos);
      }
      const multiplicador = cantidadCombosNum !== null ? cantidadCombosNum : 1;
      const productosSinStock = [];
      comboParaUsar.productos.forEach(item => {
        const producto = productos.find(p => p.nombre === item.nombre);
        const cantidadNecesaria = item.cantidad * multiplicador;
        if (!producto || producto.cantidad < cantidadNecesaria) {
          productosSinStock.push(`${item.nombre} (requiere ${cantidadNecesaria} ${item.unidad})`);
        }
      });
      if (productosSinStock.length > 0) {
        setError(`Stock insuficiente para:\n${productosSinStock.join('\n')}`);
        return;
      }

      url = '/api/comboOut';
      body = {
        comboId: comboParaUsar.id,
        comboOutDate: dateTime,
        outMotive: motivoFinal,
        adminId: adminId || null,
        userId: userId || null,
        customer: motivo === 'venta' ? clienteVentaFinal : '',
        quantityToQuit: cantidadCombosNum
      };
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.title || errorData.message || 'Error al registrar la salida');
      }

      alert('Salida registrada correctamente');
      setItemsSalida([]);
      setComboSeleccionado(null);
      setComboEditado(null);
      setMotivo('');
      setMotivoOtro('');
      setClienteVenta('');
      setClienteVentaNuevo('');
      setCantidadCombos('');
      setError('');
      if (onCancelar) onCancelar();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const totalProductos = itemsSalida.reduce((acc, item) => acc + item.cantidad, 0);
  console.log('tipoSalida actual:', tipoSalida);

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-6 w-full max-w-6xl mx-auto">
      <h2 className="text-2xl sm:text-3xl font-bold text-center text-red-600 mb-6">Registrar Salida de Inventario</h2>
      
      {error && (
        <div className="bg-red-600 text-white text-center p-3 text-sm rounded-lg mb-4 whitespace-pre-line">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
        <button
          onClick={() => {
            setTipoSalida('producto');
            setComboSeleccionado(null);
            setError('');
          }}
          className={`flex-1 py-3 px-4 rounded-lg font-bold transition-all duration-300 ${
            tipoSalida === 'producto'
              ? 'bg-red-600 text-white'
              : 'border-2 border-red-300 bg-red-50 text-red-700 hover:bg-red-100'
          }`}
        >
          Salida de Productos
        </button>
        <button
          onClick={() => {
            setTipoSalida('combo');
            setItemsSalida([]);
            setProductoSeleccionado(null);
            setError('');
          }}
          className={`flex-1 py-3 px-4 rounded-lg font-bold transition-all duration-300 ${
            tipoSalida === 'combo'
              ? 'bg-red-600 text-white'
              : 'border-2 border-red-300 bg-red-50 text-red-700 hover:bg-red-100'
          }`}
        >
          Salida de Combo
        </button>
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 font-bold text-sm mb-2">
          Fecha de Salida <span className="text-red-500">*</span>
        </label>
        <input
          type="datetime-local"
          value={salidaDate}
          onChange={(e) => setSalidaDate(e.target.value)}
          className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400"
        />
      </div>

      {tipoSalida === 'producto' ? (
        <>
          <div className="mb-6">
            <label className="block text-gray-700 font-bold text-sm mb-2">
              Buscar Producto para Agregar
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Escriba para buscar productos..."
                  value={terminoBusqueda}
                  onChange={(e) => setTerminoBusqueda(e.target.value)}
                  className="w-full p-3 pl-10 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400"
                />
                <svg className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <button onClick={agregarItem} className="w-full sm:w-auto px-6 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700">
                Agregar
              </button>
            </div>
            {terminoBusqueda && productosFiltrados.length > 0 && (
              <div className="mt-2 max-h-40 overflow-y-auto border-2 border-gray-200 rounded-lg">
                {productosFiltrados.map(producto => (
                  <div key={producto.id} onClick={() => { setProductoSeleccionado(producto); setTerminoBusqueda(producto.nombre); }} className="p-2 hover:bg-red-50 cursor-pointer">
                    <div>
                      <span className="font-medium">{producto.nombre}</span>
                      <span className="text-xs text-gray-500 ml-2">Stock: {producto.cantidad} {producto.unidad}</span>
                    </div>
                    <button className="text-red-600 text-xs font-bold">Seleccionar</button>
                  </div>
                ))}
              </div>
            )}
            {productoSeleccionado && (
              <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <div className="flex-1 bg-green-50 p-3 rounded-lg">
                  <span className="font-bold text-green-700">Seleccionado: </span>
                  <span>{productoSeleccionado.nombre}</span>
                  <span className="text-sm text-gray-600 ml-2">(Stock: {productoSeleccionado.cantidad} {productoSeleccionado.unidad})</span>
                </div>
                <div className="w-full sm:w-32">
                  <input type="number" value={cantidad} onChange={(e) => setCantidad(parseInt(e.target.value) || 0)} className="w-full p-3 border-2 border-gray-200 rounded-lg" placeholder="0" min="0" max={productoSeleccionado?.cantidad || 0} />
                </div>
              </div>
            )}
          </div>
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-700 mb-3">Productos a Registrar Salida</h3>
            {itemsSalida.length > 0 ? (
              <div className="overflow-x-auto">
                <div className="max-h-[300px] overflow-y-auto border-2 border-red-100 rounded-lg">
                  <table className="w-full border-collapse">
                    <thead className="sticky top-0 bg-red-50 z-10">
                      <tr>
                        <th className="border-2 border-red-200 p-2 text-left text-xs font-bold">#</th>
                        <th className="border-2 border-red-200 p-2 text-left text-xs font-bold">Producto</th>
                        <th className="border-2 border-red-200 p-2 text-left text-xs font-bold">Unidad</th>
                        <th className="border-2 border-red-200 p-2 text-left text-xs font-bold">Stock Actual</th>
                        <th className="border-2 border-red-200 p-2 text-left text-xs font-bold">Cantidad a Salir</th>
                        <th className="border-2 border-red-200 p-2 text-left text-xs font-bold">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {itemsSalida.map((item, index) => (
                        <tr key={index} className="hover:bg-red-50/50">
                          <td className="border-2 border-red-200 p-2 text-xs">{index + 1}</td>
                          <td className="border-2 border-red-200 p-2 text-xs font-medium">{item.producto.nombre}</td>
                          <td className="border-2 border-red-200 p-2 text-xs">{item.producto.unidad}</td>
                          <td className="border-2 border-red-200 p-2 text-xs">{item.producto.cantidad}</td>
                          <td className="border-2 border-red-200 p-2 text-xs">
                            <input type="number" value={item.cantidad} onChange={(e) => actualizarCantidad(index, parseInt(e.target.value) || 0)} className="w-20 p-1 border border-red-300 rounded text-xs" min="0" max={item.producto.cantidad} />
                          </td>
                          <td className="border-2 border-red-200 p-2">
                            <button onClick={() => eliminarItem(index)} className="px-2 py-1 border-2 border-red-500 bg-red-50 text-red-700 font-bold rounded-lg hover:bg-red-100 text-[10px]">Eliminar</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No hay productos agregados a la salida. Busque y agregue productos arriba.</p>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-gray-700 font-bold text-sm">Seleccionar Combo</label>
              {comboParaUsar && (
                <button onClick={handleEditarCombo} className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700">✏️ Editar Combo Seleccionado</button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto border-2 border-gray-200 rounded-lg p-3 mb-4">
              {combos.map(combo => {
                const tieneStock = combo.productos.every(item => {
                  const producto = productos.find(p => p.nombre === item.nombre);
                  return producto && producto.cantidad >= item.cantidad;
                });
                const esComboEditado = comboEditado?.id === combo.id;
                const comboParaMostrar = esComboEditado ? comboEditado : combo;
                const tieneStockMostrado = comboParaMostrar.productos.every(item => {
                  const producto = productos.find(p => p.nombre === item.nombre);
                  const cantidadNecesaria = item.cantidad * (comboParaMostrar.cantidadSalida || 1);
                  return producto && producto.cantidad >= cantidadNecesaria;
                });
                return (
                  <div key={combo.id} onClick={() => { setComboSeleccionado(combo); setComboEditado(null); }} className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${comboSeleccionado?.id === combo.id ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-red-300 hover:bg-red-50/50'}`}>
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <h3 className="font-bold text-lg">{comboParaMostrar.nombre}</h3>
                        {comboEditado?.id === combo.id && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Editado</span>}
                      </div>
                      {!tieneStockMostrado && <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Sin stock</span>}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{comboParaMostrar.productos.length} productos</p>
                    {comboParaMostrar.cantidadSalida && comboParaMostrar.cantidadSalida > 1 && <p className="text-xs text-blue-600 font-bold mb-2">Cantidad: {comboParaMostrar.cantidadSalida} combos</p>}
                    <div className="text-xs text-gray-500">
                      {comboParaMostrar.productos.slice(0,5).map((p, idx) => (
                        <div key={idx} className="flex justify-between"><span>{p.nombre}</span><span>{p.cantidad} {p.unidad}</span></div>
                      ))}
                      {comboParaMostrar.productos.length > 5 && <div className="text-gray-400 font-bold">... y {comboParaMostrar.productos.length - 5} más</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {/* Campo Cantidad de Combos (solo en modo combo) */}
          <div className="mb-4">
            <label className="block text-gray-700 font-bold text-sm mb-2">
              Cantidad de Combos (opcional)
            </label>
            <input
              type="number"
              step="any"
              value={cantidadCombos}
              onChange={(e) => setCantidadCombos(e.target.value)}
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400"
              placeholder="Ej: 1, 2, etc."
            />
            <p className="text-xs text-gray-500 mt-1">Dejar vacío para usar 1 (multiplicador de cantidades).</p>
          </div>
        </>
      )}

      {tipoSalida === 'producto' && itemsSalida.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-red-50 p-4 rounded-lg"><p className="text-sm text-gray-600">Total de productos:</p><p className="text-2xl font-bold text-red-600">{itemsSalida.length}</p></div>
          <div className="bg-red-50 p-4 rounded-lg"><p className="text-sm text-gray-600">Unidades totales:</p><p className="text-2xl font-bold text-red-600">{totalProductos}</p></div>
        </div>
      )}

      <div className="mb-6">
        <label className="block text-gray-700 font-bold text-sm mb-2">Motivo de la Salida <span className="text-red-500">*</span></label>
        <select value={motivo} onChange={(e) => { setMotivo(e.target.value); if (e.target.value !== 'venta') { setClienteVenta(''); setClienteVentaNuevo(''); } if (e.target.value !== 'otro') setMotivoOtro(''); }} className="w-full p-3 border-2 border-gray-200 rounded-lg">
          <option value="">Seleccione un motivo</option>
          <option value="venta">Venta</option>
          <option value="consumo_interno">Consumo Interno</option>
          <option value="merma">Merma/Pérdida</option>
          <option value="donacion">Donación</option>
          <option value="otro">Otro</option>
        </select>
      </div>

      {motivo === 'venta' && (
        <div className="mb-6">
          <label className="block text-gray-700 font-bold text-sm mb-2">Cliente de la Venta <span className="text-red-500">*</span></label>
          <select value={clienteVenta} onChange={(e) => { setClienteVenta(e.target.value); if (e.target.value !== '__nuevo__') setClienteVentaNuevo(''); }} className="w-full p-3 border-2 border-gray-200 rounded-lg">
            <option value="">Seleccione un cliente</option>
            {clientesFrecuentes.map(cliente => <option key={cliente} value={cliente}>{cliente}</option>)}
            <option value="__nuevo__">Cliente nuevo...</option>
          </select>
          {clienteVenta === '__nuevo__' && <input type="text" value={clienteVentaNuevo} onChange={(e) => setClienteVentaNuevo(e.target.value)} className="w-full mt-3 p-3 border-2 border-gray-200 rounded-lg" placeholder="Nombre del cliente" />}
        </div>
      )}

      {motivo === 'otro' && (
        <div className="mb-6">
          <input type="text" value={motivoOtro} onChange={(e) => setMotivoOtro(e.target.value)} className="w-full p-3 border-2 border-gray-200 rounded-lg" placeholder="Describa el motivo..." />
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
        <button onClick={onCancelar} className="w-full sm:w-auto px-6 py-3 border-2 border-gray-500 bg-gray-50 text-gray-700 font-bold rounded-lg hover:bg-gray-100" disabled={isLoading}>Cancelar</button>
        <button onClick={handleRegistrarSalida} className="w-full sm:w-auto px-6 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed" disabled={isLoading || (tipoSalida === 'producto' && itemsSalida.length === 0) || (tipoSalida === 'combo' && !comboParaUsar) || !motivo || (motivo === 'venta' && !clienteVentaFinal) || (motivo === 'otro' && !motivoOtro.trim())}>
          {isLoading ? 'Registrando...' : 'Registrar Salida'}
        </button>
      </div>

      {modalEditarComboAbierto && comboEditado && (
        <ModalModificarComboSalida combo={comboEditado} productos={productos} onGuardar={handleGuardarComboEditado} onCerrar={() => setModalEditarComboAbierto(false)} />
      )}
    </div>
  );
};

export default InterfazSalida;