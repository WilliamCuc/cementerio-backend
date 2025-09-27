import sql from "../config/supabase.js";

export const obtenerPanteones = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const offset = parseInt(req.query.offset) || 0;
  try {
    const panteones = await sql`
      SELECT p.*, l.loc_area
      FROM cem_panteones p
      LEFT JOIN cem_locacion l ON p.pan_locacion_id = l.loc_id
      ORDER BY p.pan_id DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    const total = await sql`SELECT COUNT(*) FROM cem_panteones`;
    res.json({
      data: panteones,
      total: Number(total[0].count),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const obtenerTodosPanteones = async (req, res) => {
  try {
    const panteones = await sql`
      SELECT pan_id, pan_no_panteon, pan_capacidad_maxima
      FROM cem_panteones
      ORDER BY pan_no_panteon ASC
    `;
    res.json(panteones);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const crearPanteon = async (req, res) => {
  const {
    pan_no_panteon,
    pan_locacion_id,
    pan_capacidad_maxima,
    pan_descripcion,
  } = req.body;
  try {
    const nuevoPanteon = await sql`
      INSERT INTO cem_panteones (
        pan_no_panteon, pan_locacion_id, pan_capacidad_maxima, pan_descripcion
      ) VALUES (
        ${pan_no_panteon}, ${pan_locacion_id || null}, ${pan_capacidad_maxima || 6}, ${pan_descripcion || null}
      ) RETURNING *
    `;
    res.status(201).json(nuevoPanteon[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const editarPanteon = async (req, res) => {
  const { id } = req.params;
  const {
    pan_no_panteon,
    pan_locacion_id,
    pan_capacidad_maxima,
    pan_descripcion,
  } = req.body;
  try {
    const actualizado = await sql`
      UPDATE cem_panteones SET
        pan_no_panteon = ${pan_no_panteon},
        pan_locacion_id = ${pan_locacion_id || null},
        pan_capacidad_maxima = ${pan_capacidad_maxima || 6},
        pan_descripcion = ${pan_descripcion || null},
        pan_update = now()
      WHERE pan_id = ${id}
      RETURNING *
    `;
    res.json(actualizado[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const eliminarPanteon = async (req, res) => {
  const { id } = req.params;
  try {
    await sql`DELETE FROM cem_panteones WHERE pan_id = ${id}`;
    res.json({ mensaje: "Panteón eliminado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
