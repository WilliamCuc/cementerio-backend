import sql from "../config/supabase.js";
import { formatFecha } from "../utils/fechas.js";

export const obtenerDifuntos = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const offset = parseInt(req.query.offset) || 0;
  try {
    const difuntos = await sql`
      SELECT * FROM cem_difuntos
      ORDER BY dif_id DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    const total = await sql`SELECT COUNT(*) FROM cem_difuntos`;
    res.json({
      data: difuntos,
      total: Number(total[0].count),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const crearDifunto = async (req, res) => {
  const {
    dif_primer_nombre,
    dif_segundo_nombre,
    dif_primer_apellido,
    dif_segundo_apellido,
    dif_dpi,
    dif_espacios,
    dif_fecha_defuncion,
    dif_fecha_entierro,
  } = req.body;
  try {
    const nuevoDifunto = await sql`
      INSERT INTO cem_difuntos (
        dif_primer_nombre, dif_segundo_nombre, dif_primer_apellido, dif_segundo_apellido,
        dif_dpi, dif_espacios, dif_fecha_defuncion, dif_fecha_entierro
      ) VALUES (
        ${dif_primer_nombre}, ${dif_segundo_nombre}, ${dif_primer_apellido}, ${dif_segundo_apellido},
        ${dif_dpi}, ${dif_espacios}, ${dif_fecha_defuncion}, ${dif_fecha_entierro}
      ) RETURNING *`;
    res.status(201).json(nuevoDifunto[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const editarDifunto = async (req, res) => {
  const { id } = req.params;
  const {
    dif_primer_nombre,
    dif_segundo_nombre,
    dif_primer_apellido,
    dif_segundo_apellido,
    dif_dpi,
    dif_espacios,
    dif_fecha_defuncion,
    dif_fecha_entierro,
  } = req.body;
  try {
    const actualizado = await sql`
      UPDATE cem_difuntos SET
        dif_primer_nombre = ${dif_primer_nombre},
        dif_segundo_nombre = ${dif_segundo_nombre},
        dif_primer_apellido = ${dif_primer_apellido},
        dif_segundo_apellido = ${dif_segundo_apellido},
        dif_dpi = ${dif_dpi},
        dif_espacios = ${dif_espacios},
        dif_fecha_defuncion = ${dif_fecha_defuncion},
        dif_fecha_entierro = ${dif_fecha_entierro},
        dif_update = now()
      WHERE dif_id = ${id}
      RETURNING *`;
    res.json(actualizado[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const eliminarDifunto = async (req, res) => {
  const { id } = req.params;
  try {
    await sql`DELETE FROM cem_difuntos WHERE dif_id = ${id}`;
    res.json({ mensaje: "Difunto eliminado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
