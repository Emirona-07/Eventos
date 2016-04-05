var express = require('express');
var router = express.Router();
var EventoModel = require('../models/eventos');
var CategoriaModel = require('../models/categorias');
var fotoEvento;
//Para subir archivos con Multer
var multer  =   require('multer');

var app = express();

var storage = multer.diskStorage({
    destination: function (req, file, callback) 
    {
        callback(null, './uploads');
    },
    filename: function (req, file, callback) 
    {
        fotoEvento = req.body.Nombre + '-' + Date.now() + '.jpg';
        callback(null, req.body.Nombre + '-' + Date.now() + '.jpg');
    }
});

var upload = multer({ storage : storage}).single('Imagen');
//Subir foto con Multer

/* Mostramos el formualario para crear usuarios nuevos */
router.get('/', function(req, res) 
{
    CategoriaModel.getCategorias(function(error, categorias)
    {
        res.render("index",{ 
            title: "Gestor de Eventos", 
            categorias: categorias
        });
    });
});
 
router.get('/nuevaCategoria', function(req, res) 
{
  res.render('categorias', { title: 'Gestor de Eventos'});
});

/* Creamos un nuevo evento */
router.post('/evento', function(req,res)
{
    //creamos un objeto con los datos a insertar del usuario
    var userData = 
    {
        ID: null,
        Nombre: req.body.Nombre,
        NombreBD: req.body.NombreBD,
        Descripcion: req.body.Descripcion,
        IDCategoria: req.body.IDCategoria,
        Imagen: req.files,
        FechaInicio: req.body.FechaInicio,
        Color: req.body.Color
    };

    EventoModel.insertEvento(userData,function(error, data)
    {
        //si el usuario se ha insertado correctamente mostramos su info
        if(data && data.insertId)
        {
            res.redirect("/evento/" + data.insertId);
        }
        else
        {
            res.json(500,{"msg":"Error"});
        }
    });
});

/* Creamos una nueva categoría */
router.post('/categoria', function(req,res)
{
    //creamos un objeto con los datos a insertar del usuario
    var categoriaData = {
        ID : null,
        Nombre : req.body.Nombre,
    };

    CategoriaModel.insertCategoria(categoriaData,function(error, data)
    {
        //si la categoría se ha insertado correctamente mostramos su info
        if (data && data.insertId)
        {
            res.redirect("/categoria/" + data.insertId);
        }
        else
        {
            res.json(500,{"msg":"Error"});
        }
    });
});
 
/* Actualizamos un evento existente */
router.post('/modificarEvento', function(req, res)
{
    upload(req,res,
    function(err) 
    {
        if (err) 
        {
            return res.end("Ocurrió un error al intentar subir la imagen.");
        }
        else 
        {
            console.log(fotoEvento);
            var userData = 
            {
                ID: req.body.ID,
                Nombre: req.body.Nombre,
                NombreBD: req.body.NombreBD,
                Descripcion: req.body.Descripcion,
                IDCategoria: req.body.IDCategoria,
                Imagen: fotoEvento,
                FechaInicio: req.body.FechaInicio,
                Color: req.body.Color
            };

            EventoModel.updateEvento(userData,function(error, data)
            {
                if(data && data.msg)
                    res.redirect("/eventos/");
                else
                    res.json(500,{"msg":"Error"});
            });
        }     
    });   
});

/* Actualizamos una categoría existente */
router.put('/categoria/', function(req, res)
{
    //almacenamos los datos del formulario en un objeto
    var categoriaData = {ID:req.param('ID'),Nombre:req.param('Nombre')};
    CategoriaModel.updateCategoria(categoriaData,function(error, data)
    {
        //si el usuario se ha actualizado correctamente mostramos un mensaje
        if (data && data.msg)
        {
            res.redirect("/evento/" + req.param('ID'));
        }
        else
        {
            res.json(500,{"msg":"Error"});
        }
    });
});
 
/* Obtenemos un evento por su id y lo mostramos en un formulario para editar */
router.get('/evento/:ID', function(req, res) 
{
    var id = req.params.ID;
    //solo actualizamos si la id es un número
    if (!isNaN(id))
    {
        EventoModel.getEvento(id,function(error, data)
        {
            //si existe el evento mostramos el formulario
            if (typeof data !== 'undefined' && data.length > 0)
            {
                CategoriaModel.getCategorias(function(error, categorias)
                {
                    res.render("updateEvento",{ 
                        title: "Gestor de Eventos", 
                        info: data,
                        categorias: categorias
                    });
                });
                
            }
            //en otro caso mostramos un error
            else
            {
                res.status(404).json({"msg":"notExist"});
            }
        });
    }
    //si la id no es numerica mostramos un error de servidor
    else
    {
        res.status(500).json({"msg":"El ID debe ser numerico"});
    }
});

/* Obtenemos una categoría por su id y la mostramos en un formulario para editar */
router.get('/categoria/:ID', function(req, res) 
{
    var id = req.params.ID;
    //solo actualizamos si la id es un número
    if (!isNaN(id))
    {
        CategoriaModel.getCategoria(id,function(error, data)
        {
            //si existe el evento mostramos el formulario
            if (typeof data !== 'undefined' && data.length > 0)
            {
                res.render("updateCategoria",{ 
                    title : "Gestor de Eventos", 
                    info : data
                });
            }
            //en otro caso mostramos un error
            else
            {
                res.json(404,{"msg":"notExist"});
            }
        });
    }
    //si la id no es numerica mostramos un error de servidor
    else
    {
        res.json(500,{"msg":"The id must be numeric"});
    }
});
 
/* Obtenemos y mostramos todos los eventos */
router.get('/eventos/', function(req, res) 
{
    EventoModel.getEventos(function(error, data)
    {
        //si existe el evento mostramos el formulario
        if (typeof data !== 'undefined')
        {
            res.render("showEventos",{ 
                title : "Gestor de Eventos", 
                eventos : data
            });
        }
        //en otro caso mostramos un error
        else
        {
            res.json(404,{"msg":"notExist"});
        }
    });
});

/* Obtenemos y mostramos todas las categorías */
router.get('/categorias/', function(req, res) 
{
    CategoriaModel.getCategorias(function(error, data)
    {
        //si existe la categoria mostramos el formulario
        if (typeof data !== 'undefined')
        {
            res.render("showCategorias",{ 
                title : "Gestor de Eventos", 
                categorias : data
            });
        }
        //en otro caso mostramos un error
        else
        {
            res.json(404,{"msg":"notExist"});
        }
    });
});
 
/* ELiminamos un evento */
router.delete("/evento/", function(req, res)
{
    var id = req.param('ID');
    EventoModel.deleteEvento(id,function(error, data)
    {
        if (data && data.msg === "deleted" || data.msg === "notExist")
        {
            res.redirect("/eventos/");
        }
        else
        {
            res.json(500,{"msg":"Error"});
        }
    });
});

/* ELiminamos una categoría */
router.delete("/categoria/", function(req, res)
{
    var id = req.param('ID');
    CategoriaModel.deleteCategoria(id,function(error, data)
    {
        if (data && data.msg === "deleted" || data.msg === "notExist")
        {
            res.redirect("/categorias/");
        }
        else
        {
            res.json(500,{"msg":"Error"});
        }
    });
});

router.get('/eventosycategorias', function(req, res) 
{  
  EventoModel.getAllEventos(function(error, data)
    {
        if (typeof data !== 'undefined')
        {
            res.json(data);
        }
        else
        {
            res.json(404,{"msg":"notExist"});
        }
    });
});

router.post('/descripcionEvento', function(req, res) 
{  
    var id = req.param('id');
    EventoModel.descripcionEvento(id,function(error, data)
     {       
        //si existe el usuario mostramos el formulario
        if (typeof data !== 'undefined')
        {
            res.json(data);
        }
        //en otro caso mostramos un error
        else
        {
            res.json(404,{"msg":"notExist"});
        }
    }
  ); 
});

router.post('/crearSuscripcion', function(req, res) 
{  
    var userData = {IDEvento:req.param('IDEvento'),Nombres:req.param('Nombres'),Apellidos:req.param('Apellidos'),Documento:req.param('Documento'),
    Telefono:req.param('Telefono'),Email:req.param('Email')};
    EventoModel.crearSuscripcion(userData,function(error, data)
     {       
        if (typeof data !== 'undefined')
        {
            res.json(data);
        }
        else
        {
            res.json(404,{"msg":"notExist"});
        }
    }
  ); 
});

 
module.exports = router;