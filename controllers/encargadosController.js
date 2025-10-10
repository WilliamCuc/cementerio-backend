import sql from "../config/supabase.js";

export const obtenerEncargados = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const offset = parseInt(req.query.offset) || 0;
  const { dpi, telefono, nombre } = req.query;

  try {
    let baseQuery = 'SELECT * FROM cem_encargado WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) FROM cem_encargado WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (dpi) {
      baseQuery += ` AND enc_dpi = $${paramIndex}`;
      countQuery += ` AND enc_dpi = $${paramIndex}`;
      params.push(dpi);
      paramIndex++;
    }

    if (telefono) {
      baseQuery += ` AND (enc_telefono_uno = $${paramIndex} OR enc_telefono_dos = $${paramIndex})`;
      countQuery += ` AND (enc_telefono_uno = $${paramIndex} OR enc_telefono_dos = $${paramIndex})`;
      params.push(telefono);
      paramIndex++;
    }

    if (nombre) {
      const nombreBusqueda = `%${nombre}%`;
      baseQuery += ` AND (CONCAT(enc_primer_nombre, ' ', COALESCE(enc_segundo_nombre, ''), ' ', enc_primer_apellido, ' ', COALESCE(enc_segundo_apellido, '')) ILIKE $${paramIndex})`;
      countQuery += ` AND (CONCAT(enc_primer_nombre, ' ', COALESCE(enc_segundo_nombre, ''), ' ', enc_primer_apellido, ' ', COALESCE(enc_segundo_apellido, '')) ILIKE $${paramIndex})`;
      params.push(nombreBusqueda);
      paramIndex++;
    }

    baseQuery += ` ORDER BY enc_id DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const encargados = await sql.unsafe(baseQuery, params);
    const total = await sql.unsafe(countQuery, params.slice(0, -2));

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