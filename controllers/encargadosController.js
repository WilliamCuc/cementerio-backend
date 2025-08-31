// controllers/encargadosController.js
import sql from "../config/supabase.js";

export const obtenerEncargados = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const offset = parseInt(req.query.offset) || 0;
  try {
    const encargados = await sql`
      SELECT * FROM cem_encargado
      ORDER BY enc_id DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    const total = await sql`SELECT COUNT(*) FROM cem_encargado`;
    res.json({
      data: encargados,
      total: Number(total[0].count),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const crearEncargado = async (req, res) => {
  const {
    enc_primer_nombre,
    enc_segundo_nombre,
    enc_primer_apellido,
    enc_segundo_apellido,
    enc_telefono_uno,
    enc_telefono_dos,
    enc_dpi,
    enc_direccion,
    enc_panteones,
  } = req.body;
  try {
    const nuevoEncargado = await sql`
      INSERT INTO cem_encargado (
        enc_primer_nombre, enc_segundo_nombre, enc_primer_apellido, enc_segundo_apellido,
        enc_telefono_uno, enc_telefono_dos, enc_dpi, enc_direccion, enc_panteones
      ) VALUES (
        ${enc_primer_nombre}, ${enc_segundo_nombre}, ${enc_primer_apellido}, ${enc_segundo_apellido},
        ${enc_telefono_uno}, ${enc_telefono_dos}, ${enc_dpi}, ${enc_direccion}, ${enc_panteones}
      ) RETURNING *`;
    res.status(201).json(nuevoEncargado[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const editarEncargado = async (req, res) => {
  const { id } = req.params;
  const {
    enc_primer_nombre,
    enc_segundo_nombre,
    enc_primer_apellido,
    enc_segundo_apellido,
    enc_telefono_uno,
    enc_telefono_dos,
    enc_dpi,
    enc_direccion,
    enc_panteones,
  } = req.body;
  try {
    const actualizado = await sql`
      UPDATE cem_encargado SET
        enc_primer_nombre = ${enc_primer_nombre},
        enc_segundo_nombre = ${enc_segundo_nombre},
        enc_primer_apellido = ${enc_primer_apellido},
        enc_segundo_apellido = ${enc_segundo_apellido},
        enc_telefono_uno = ${enc_telefono_uno},
        enc_telefono_dos = ${enc_telefono_dos},
        enc_dpi = ${enc_dpi},
        enc_direccion = ${enc_direccion},
        enc_panteones = ${enc_panteones},
        enc_update = now()
      WHERE enc_id = ${id}
      RETURNING *`;
    res.json(actualizado[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const eliminarEncargado = async (req, res) => {
  const { id } = req.params;
  try {
    await sql`DELETE FROM cem_encargado WHERE enc_id = ${id}`;
    res.json({ mensaje: "Encargado eliminado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
