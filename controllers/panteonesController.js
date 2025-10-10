import sql from "../config/supabase.js";

export const obtenerPanteones = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const offset = parseInt(req.query.offset) || 0;
  const { descripcion, locacion } = req.query;

  try {
    let baseQuery = `
      SELECT p.*, l.loc_area
      FROM cem_panteones p
      LEFT JOIN cem_locacion l ON p.pan_locacion_id = l.loc_id
      WHERE 1=1
    `;
    let countQuery = `
      SELECT COUNT(*) 
      FROM cem_panteones p
      LEFT JOIN cem_locacion l ON p.pan_locacion_id = l.loc_id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (descripcion) {
      const descripcionBusqueda = `%${descripcion}%`;
      baseQuery += ` AND p.pan_descripcion ILIKE $${paramIndex}`;
      countQuery += ` AND p.pan_descripcion ILIKE $${paramIndex}`;
      params.push(descripcionBusqueda);
      paramIndex++;
    }

    if (locacion) {
      const locacionBusqueda = `%${locacion}%`;
      baseQuery += ` AND l.loc_area ILIKE $${paramIndex}`;
      countQuery += ` AND l.loc_area ILIKE $${paramIndex}`;
      params.push(locacionBusqueda);
      paramIndex++;
    }

    baseQuery += ` ORDER BY p.pan_id DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const panteones = await sql.unsafe(baseQuery, params);
    const total = await sql.unsafe(countQuery, params.slice(0, -2));

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