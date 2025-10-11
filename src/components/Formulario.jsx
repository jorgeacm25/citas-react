const Formulario = () => {
    return (
        <div className="md:w-1/2 lg:w-2/5"> 

            <h2 className="font-black text-3xl text-center">Seguimiento Pacientes</h2>  
            <p className="text-lg  mt-5 text-center mb-10">Añade Pacientes y <span className="text-indigo-600 font-bold text-lg"> Administralos</span></p>

            <form className="bg-white shadow-md rounded-lg py-10 px-5 mb-10">
                <div>
                    <label htmlFor="mascota" className="block text-gray-700 uppercase font-bold">Nombre Mascota</label>
                    <input type="text" 
                    id="mascota"
                    placeholder="Nombre de la Mascota"
                    className="border-2 w-full p-2 mt-2 placeholder-gray-400 rounded-r-md"
                    />

                </div>

                  <div>
                    <label htmlFor="propietario" className="block text-gray-700 uppercase font-bold">Nombre Propietario</label>
                    <input type="text" 
                    id="propietario"
                    placeholder="Nombre del Propietario"
                    className="border-2 w-full p-2 mt-2 placeholder-gray-400 rounded-r-md"
                    />

                </div>

                  <div>
                    <label htmlFor="email" className="block text-gray-700 uppercase font-bold">Email del Propietario</label>
                    <input type="text" 
                    id="email"
                    placeholder="Email Contacto del Propietario"
                    className="border-2 w-full p-2 mt-2 placeholder-gray-400 rounded-r-md"
                    />

                </div>
                  <div>
                    <label htmlFor="alta" className="block text-gray-700 uppercase font-bold">Nombre Mascota</label>
                    <input type="date" 
                    id="alta"
                    className="border-2 w-full p-2 mt-2 placeholder-gray-400 rounded-r-md"
                    />

                </div>

                  <div>
                    <label htmlFor="sintomas" className="block text-gray-700 uppercase font-bold">Sintomas</label>
                    <textarea  id="sintomas"
                    className="border-2 w-full p-2 mt-2 placeholder-gray-400 rounded-md"
                        placeholder="Describe los Sintomas">


                    </textarea>

                </div>
                <input type="submit" 
                className="bg-indigo-600 w-full p-3 text-white uppercase font-bold hover:bg-indigo-700 cursor-pointer transition-all"
                value="Agregar paciente"/>
            </form>
       
       
        </div>

        
    );
}
export default Formulario;
 