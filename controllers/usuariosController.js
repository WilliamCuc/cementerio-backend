import sql from "../config/supabase.js";
import { hashPassword } from "../utils/hash.js";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "clave_secreta";

export const login = async (req, res) => {
  const { usu_usuario, usu_contrasenia } = req.body;
  if (!usu_usuario || !usu_contrasenia) {
    return res
      .status(400)
      .json({ error: "Usuario y contraseña son requeridos" });
  }
  const contraseniaCodificada = hashPassword(usu_contrasenia);
  try {
    const usuarios = await sql`
      SELECT * FROM cem_usuarios WHERE usu_usuario = ${usu_usuario} AND usu_contrasenia = ${contraseniaCodificada}
    `;
    if (usuarios.length === 0) {
      return res
        .status(401)
        .json({ error: "Usuario o contraseña incorrectos" });
    }
    const usuario = { ...usuarios[0] };
    delete usuario.usu_contrasenia;
    // Generar el token JWT
    const token = jwt.sign(usuario, SECRET_KEY, { expiresIn: "2h" });
    res.json({ mensaje: "Login exitoso", token, usuario });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error.message || error.toString() || "Error desconocido",
      detalle: error,
    });
  }
};

export const obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await sql`SELECT * FROM cem_usuarios`;
    res.json(usuarios);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error.message || error.toString() || "Error desconocido",
      detalle: error,
    });
  }
};

export const crearUsuario = async (req, res) => {
  const { usu_usuario, usu_contrasenia, usu_nombres, usu_apellidos, usu_rol } =
    req.body;
  const contraseniaCodificada = hashPassword(usu_contrasenia);
  try {
    const nuevoUsuario = await sql`
      INSERT INTO cem_usuarios 
      (usu_usuario, usu_contrasenia, usu_nombres, usu_apellidos, usu_rol)
      VALUES (${usu_usuario}, ${contraseniaCodificada}, ${usu_nombres}, ${usu_apellidos}, ${usu_rol})
      RETURNING *`;
    res.status(201).json(nuevoUsuario[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error.message || error.toString() || "Error desconocido",
      detalle: error,
    });
  }
};
