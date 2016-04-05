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
var CategoriaModel = {};

//obtenemos todas las categorías
CategoriaModel.getCategorias = function(callback)
{
	if (connection) 
	{
		connection.query('SELECT * FROM categoria ORDER BY ID', function(error, rows) {
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

//obtenemos una categoría por su id
CategoriaModel.getCategoria = function(id,callback)
{
	if (connection) 
	{
		var sql = 'SELECT * FROM categoria WHERE ID = ' + connection.escape(id);
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

//añadir una nueva categoría
CategoriaModel.insertCategoria = function(userData,callback)
{
	if (connection) 
	{
		connection.query('INSERT INTO categoria SET ?', userData, function(error, result) 
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

//actualizar una categoría
CategoriaModel.updateCategoria = function(userData, callback)
{
	//console.log(userData); return;
	if(connection)
	{
		var sql = 'UPDATE categoria SET Nombre = ' + connection.escape(userData.Nombre) + ',' + 'NombreBD = ' + connection.escape(userData.NombreBD)
		+ "," + 'Descripcion = ' + connection.escape(userData.Descripcion) + "," + 'IDCategoria = ' + connection.escape(userData.IDCategoria) 
		+ "," + 'Imagen = ' + connection.escape(userData.Imagen) + "," + 'FechaInicio = ' + connection.escape(userData.FechaInicio) +
		'WHERE id = ' + userData.id;

		connection.query(sql, function(error, result) 
		{
			if(error)
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
CategoriaModel.deleteCategoria = function(id, callback)
{
	if(connection)
	{
		var sqlExists = 'SELECT * FROM categoria WHERE ID = ' + connection.escape(id);
		connection.query(sqlExists, function(err, row) 
		{
			//si existe la id de la categoría a eliminar
			if (row)
			{
				var sql = 'DELETE FROM categoria WHERE ID = ' + connection.escape(id);
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

//exportamos el objeto para tenerlo disponible en la zona de rutas
module.exports = CategoriaModel;