//llamamos al paquete mysql que hemos instalado
var mysql = require('mysql'),
//creamos la conexion a nuestra base de datos con los datos de acceso de cada uno
connection = mysql.createConnection(
	{ 
		host: '192.168.1.254', 
		user: 'root',  
		password: 'T0d050ft!', 
		database: 'eventosmaster'
	}
);

//creamos un objeto para ir almacenando todo lo que necesitemos
var EventoModel = {};

//obtenemos todos los eventos
EventoModel.getEventos = function(callback)
{
	if (connection) 
	{
		connection.query('SELECT * FROM evento ORDER BY ID', function(error, rows) {
			if(error)
			{
				throw error;
			}
			else
			{
				callback(null, rows);
			}
		});
	}
}

//obtenemos un evento por su id
EventoModel.getEvento = function(id,callback)
{
	if (connection) 
	{
		var sql = 'SELECT * FROM evento WHERE ID = ' + connection.escape(id);
		connection.query(sql, function(error, row) 
		{
			if (error)
			{
				throw error;
			}
			else
			{
				callback(null, row);
			}
		});
	}
}

//obtenemos todos los eventos
EventoModel.getAllEventos = function(callback)
{
	if (connection)
	{
		var categorias = [];
		  var sql = 'SELECT categoria.Nombre AS Categoria, evento.Nombre AS Eventos, evento.ID AS IDEvento FROM categoria, evento WHERE evento.IDCategoria = categoria.ID'; 
		    connection.query(sql,function(err, result) 
		    {
		        for (i in result) {
		          var nuevoRegistro = {};
		          nuevoRegistro.Tipo = result[i].Categoria;
		          var eventos = [];
		          eventos.push({Nombre:result[i].Eventos, ID:result[i].IDEvento});
		          nuevoRegistro.Eventos = eventos;
		          posicionEnArraySiExiste = buscarEnArray(result[i].Categoria,categorias);
		          if (posicionEnArraySiExiste != -1) 
		            categorias[posicionEnArraySiExiste].Eventos.push({Nombre:result[i].Eventos, ID:result[i].IDEvento});
		          else
		            categorias.push(nuevoRegistro);
		        }
		        
		        callback(null,{Categorias:categorias});

		        if (err) 
		          throw err;
		    }
		  ); 
	}
}

function buscarEnArray(tipoDeCategoria, arreglo) {
  var i = 0;
  var posicion = -1;
  while (arreglo[i] != undefined && i <= arreglo.length && posicion == -1) {
    if (arreglo[i].Tipo == tipoDeCategoria)
      posicion = i;
    i++;    
  }
  return posicion;
}

//añadir un nuevo evento
EventoModel.insertEvento = function(userData,callback)
{
	if (connection) 
	{
		fs.readFile(userData.Imagen.displayImage.path, function (err, data) {
		  var newPath = __dirname + "/uploads/uploadedFileName";
		  fs.writeFile(newPath, data, function (err) {
		    res.redirect("back");
		  });
		});
		connection.query('INSERT INTO evento SET ?', userData, function(error, result) 
		{
			if(error)
			{
				throw error;
			}
			else
			{
				//devolvemos la última id insertada
				callback(null,{"insertId" : result.insertId});
			}
		});
	}
}

//actualizar un evento
EventoModel.updateEvento = function(userData, callback)
{
	if(connection)
	{
		var sql = 'UPDATE evento SET Nombre = ' + connection.escape(userData.Nombre) + ',' + 'NombreBD = ' + connection.escape(userData.NombreBD)
		+ "," + 'Descripcion = ' + connection.escape(userData.Descripcion) + "," + 'IDCategoria = ' + connection.escape(userData.IDCategoria) 
		+ "," + 'Imagen = ' + connection.escape(userData.Imagen) + "," + 'FechaInicio = ' + connection.escape(userData.FechaInicio) + ", "
		+ 'Color = ' + connection.escape(userData.Color) + 'WHERE ID = ' + userData.ID;
		connection.query(sql, function(error, result) 
		{
			if (error)
			{
				throw error;
			}
			else
			{
				callback(null,{"msg":"success"});
			}
		});
	}
}

//eliminar un evento pasando la id a eliminar
EventoModel.deleteEvento = function(id, callback)
{
	if(connection)
	{
		var sqlExists = 'SELECT * FROM evento WHERE ID = ' + connection.escape(id);
		connection.query(sqlExists, function(err, row) 
		{
			//si existe la id del evento a eliminar
			if (row)
			{
				var sql = 'DELETE FROM evento WHERE ID = ' + connection.escape(id);
				connection.query(sql, function(error, result) 
				{
					if (error)
					{
						throw error;
					}
					else
					{
						callback(null,{"msg":"deleted"});
					}
				});
			}
			else
			{
				callback(null,{"msg":"notExist"});
			}
		});
	}
}

EventoModel.crearSuscripcion = function(userData, callback)
{
	if (connection)
	{
		var QryNombreBD = 'SELECT evento.NombreBD AS NombreBD FROM evento WHERE evento.ID = ' + connection.escape(userData.IDEvento);
		connection.query(QryNombreBD,function(error,row)
		{
			if (row)
			{
				var bdEvento = row[0].NombreBD;
				connectionEvento = mysql.createConnection (
				{ 
					host: '192.168.1.254', 
					user: 'root',  
					password: 'T0d050ft!', 
					database: bdEvento
				});

				var QrySuscribir = 'INSERT INTO ' + bdEvento + '.suscripcion (Nombres, Apellidos, Documento, Telefono, Email) VALUES (' + connection.escape(userData.Nombres) 
				+ ', ' + connection.escape(userData.Apellidos) + ', ' + connection.escape(userData.Documento) + ', ' + connection.escape(userData.Telefono) + ', ' +
				connection.escape(userData.Email) + ')';
				connectionEvento.query(QrySuscribir,  function(error, result) 
				{
					if (error)
					{
						throw error;
					}
					else
					{
						callback(null,{"msg":"success"});
					}
				});
			}		
		});
	}
}


EventoModel.descripcionEvento = function(id, callback) 
{  
	if (connection)
	{
	    var sql = 'SELECT evento.Descripcion AS Descripcion, evento.Imagen AS Imagen, evento.FechaInicio AS FechaInicio FROM evento WHERE evento.ID = ' + connection.escape(id);
	    	connection.query(sql,function(err, result)
	    	{       
		        if (err) 
		          throw err;

		      	callback(null,{Descripcion: result[0].Descripcion, Imagen: result[0].Imagen, FechaInicio: result[0].FechaInicio});
	    	});
	}
}

//exportamos el objeto para tenerlo disponible en la zona de rutas
module.exports = EventoModel;