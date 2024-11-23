const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sequelize } = require('../config/db'); 
const UserModel = require('../models/user'); 
const PersonaModel = require('../models/persona'); 
const UserMongo = require('../models/userMongo'); 
const PersonaMongo = require('../models/personaMongo'); 

const User = UserModel(sequelize);
const Persona = PersonaModel(sequelize);

exports.register = async (req, res) => {
    const { nombres, apellidos, telefono, tipo_documento, numero_documento, provincia, ciudad, direccion, nombre_usuario, contrasena, idTipo_usuario } = req.body;

    if (!nombres || !apellidos || !nombre_usuario || !contrasena) {
        return res.status(400).json({ error: 'Faltan campos requeridos.' });
    }
    try {

        const existingUserPostgres = await User.findOne({ where: { nombre_usuario } });
        if (existingUserPostgres) {
            return res.status(400).json({ error: 'El nombre de usuario ya está en uso. Intenta con otro.' });
        }

        const t = await sequelize.transaction(); 

        const hashedPassword = await bcrypt.hash(contrasena, 10);

        const nuevaPersona = await Persona.create({
            nombres: nombres,
            apellidos: apellidos,
            telefono: telefono,
            tipo_documento: tipo_documento,
            numero_documento: numero_documento,
            provincia: provincia,
            ciudad: ciudad,
            direccion: direccion
        }, { transaction: t });

        const nuevoUsuario = await User.create({
            idpersona: nuevaPersona.idpersona,
            idtipo_usuario: idTipo_usuario,
            nombre_usuario: nombre_usuario,
            contrasena: hashedPassword
        }, { transaction: t });


        const nuevaPersonaMongo = await PersonaMongo.create({
            nombres: nombres,
            apellidos: apellidos,
            telefono: telefono,
            tipo_documento: tipo_documento,
            numero_documento: numero_documento,
            provincia: provincia,
            ciudad: ciudad,
            direccion: direccion
        });


        const nuevoUsuarioMongo = await UserMongo.create({
            idpersona: nuevaPersonaMongo._id,
            nombre_usuario: nombre_usuario,
            contrasena: hashedPassword,
            idtipo_usuario: idTipo_usuario
        });
        await t.commit();

        res.status(201).json({ message: 'Usuario registrado correctamente.' });

    } catch (error) {
        await t.rollback();
        console.error('Error registrando al usuario:', error);
        res.status(500).json({ error: 'Error registrando al usuario.' });
    }
};



exports.login = async (req, res) => {
    const { nombre_usuario, contrasena } = req.body;

    try {
        const usuario = await User.findOne({ where: { nombre_usuario } });
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }
        const validPassword = await bcrypt.compare(contrasena, usuario.contrasena);

        if (!validPassword) {
            return res.status(401).json({ error: 'Contraseña incorrecta.' });
        }
        const token = jwt.sign({ 
            idusuario: usuario.idusuario, 
            nombre_usuario: usuario.nombre_usuario }, process.env.JWT_SECRET, {
            expiresIn: '1h'
        });

        res.json({ message: 'Inicio de sesión exitoso', token,  user: {
            idusuario: usuario.idusuario,
            idtipo_usuario: usuario.idtipo_usuario,
            nombre_usuario:usuario.nombre_usuario
        }});

    } catch (error) {
        console.error('Error al iniciar sesión::', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

exports.actualizarContrasena = async (req, res) => {
    const { idusuario, contrasenaActual, nuevaContrasena } = req.body;

    try {
        const usuarioPostgres = await User.findByPk(idusuario);
        if (!usuarioPostgres) {
            return res.status(404).json({ message: 'Usuario no encontrado en PostgreSQL' });
        }
        const usuarioMongo = await UserMongo.findById(idusuario);
        if (!usuarioMongo) {
            return res.status(404).json({ message: 'Usuario no encontrado en MongoDB' });
        }
        const esContrasenaValida = await bcrypt.compare(contrasenaActual, usuarioPostgres.contrasena);
        if (!esContrasenaValida) {
            return res.status(401).json({ message: 'La contraseña actual es incorrecta' });
        }
        const hashedPassword = await bcrypt.hash(nuevaContrasena, 10);

        usuarioPostgres.contrasena = hashedPassword;
        await usuarioPostgres.save();

        usuarioMongo.contrasena = hashedPassword;
        await usuarioMongo.save();

        res.status(200).json({ message: 'Contraseña actualizada exitosamente' });
    } catch (error) {
        console.error('Error al actualizar la contraseña:', error);
        res.status(500).json({ message: 'Error al actualizar la contraseña', error: error.message });
    }
};

exports.actualizarDatosPersonales = async (req, res) => {
    const {
        idusuario,
        nombres,
        apellidos,
        telefono,
        tipo_documento,
        numero_documento,
        provincia,
        ciudad,
        direccion
    } = req.body;

    try {
        const usuarioPostgres = await User.findByPk(idusuario);
        if (!usuarioPostgres) {
            return res.status(404).json({ message: 'Usuario no encontrado en PostgreSQL' });
        }
         const personaPostgres = await Persona.findByPk(usuarioPostgres.idpersona);
         if (!personaPostgres) {
             return res.status(404).json({ message: 'Datos personales no encontrados en PostgreSQL' });
         }
        if (nombres) personaPostgres.nombres = nombres;
        if (apellidos) personaPostgres.apellidos = apellidos;
        if (telefono) personaPostgres.telefono = telefono;
        if (tipo_documento) personaPostgres.tipo_documento = tipo_documento;
        if (numero_documento) personaPostgres.numero_documento = numero_documento;
        if (provincia) personaPostgres.provincia = provincia;
        if (ciudad) personaPostgres.ciudad = ciudad;
        if (direccion) personaPostgres.direccion = direccion;
        await personaPostgres.save();

        const usuarioMongo = await UserMongo.findById(idusuario);
        if (!usuarioMongo) {
            return res.status(404).json({ message: 'Usuario no encontrado en MongoDB' });
        }

        const personaMongo = await PersonaMongo.findById(usuarioMongo.idpersona);
        if (!personaMongo) {
            return res.status(404).json({ message: 'Datos personales no encontrados en MongoDB' });
        }

        if (nombres) personaMongo.nombres = nombres;
        if (apellidos) personaMongo.apellidos = apellidos;
        if (telefono) personaMongo.telefono = telefono;
        if (tipo_documento) personaMongo.tipo_documento = tipo_documento;
        if (numero_documento) personaMongo.numero_documento = numero_documento;
        if (provincia) personaMongo.provincia = provincia;
        if (ciudad) personaMongo.ciudad = ciudad;
        if (direccion) personaMongo.direccion = direccion;
        await personaMongo.save();

        res.status(200).json({ message: 'Datos personales actualizados exitosamente' });
    } catch (error) {
        console.error('Error al actualizar datos personales:', error);
        res.status(500).json({ message: 'Error al actualizar datos personales', error: error.message });
    }
};

exports.obtenerPersonaPorIdUsuario = async (req, res) => {
    const { usuario, persona} = require('../models');
    
    const { idusuario } = req.params;
   
    try {
      const user = await usuario.findOne({
        where: { idusuario },
        include: [
          {
            model: persona,
            as: 'persona',
          },
        ],
      });
  
      if (!user) {
        return res.status(404).json({
          message: 'Usuario no encontrado',
        });
      }
     
      res.status(200).json({
        message: 'Datos de la persona encontrados',
        persona: user.persona,
      });
    } catch (error) {
      console.error('Error al obtener la persona:', error);
      res.status(500).json({
        message: 'Error interno del servidor',
        error: error.message,
      });
    }
  };