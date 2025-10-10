import sql from "../config/supabase.js";

export const obtenerEspacios = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const offset = parseInt(req.query.offset) || 0;
  const { tipo, ocupado, locacion, noEspacio } = req.query;

  try {
    let baseQuery = `
      SELECT e.*, l.loc_area, p.pan_no_panteon
      FROM cem_espacios e
      JOIN cem_locacion l ON e.esp_locacion = l.loc_id
      LEFT JOIN cem_panteones p ON e.esp_panteon = p.pan_id
      WHERE 1=1
    `;
    let countQuery = `
      SELECT COUNT(*) 
      FROM cem_espacios e
      JOIN cem_locacion l ON e.esp_locacion = l.loc_id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (tipo) {
      baseQuery += ` AND e.esp_espacio = $${paramIndex}`;
      countQuery += ` AND e.esp_espacio = $${paramIndex}`;
      params.push(tipo);
      paramIndex++;
    }

    if (ocupado !== undefined && ocupado !== '') {
      const ocupadoBool = ocupado === 'true';
      baseQuery += ` AND e.esp_ocupado = $${paramIndex}`;
      countQuery += ` AND e.esp_ocupado = $${paramIndex}`;
      params.push(ocupadoBool);
      paramIndex++;
    }

    if (locacion) {
      const locacionBusqueda = `%${locacion}%`;
      baseQuery += ` AND l.loc_area ILIKE $${paramIndex}`;
      countQuery += ` AND l.loc_area ILIKE $${paramIndex}`;
      params.push(locacionBusqueda);
      paramIndex++;
    }

    if (noEspacio) {
      const noEspacioBusqueda = `%${noEspacio}%`;
      baseQuery += ` AND e.esp_no_espacio ILIKE $${paramIndex}`;
      countQuery += ` AND e.esp_no_espacio ILIKE $${paramIndex}`;
      params.push(noEspacioBusqueda);
      paramIndex++;
    }

    baseQuery += ` ORDER BY e.esp_id DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const espacios = await sql.unsafe(baseQuery, params);
    const total = await sql.unsafe(countQuery, params.slice(0, -2));

    res.json({
      data: espacios,
      total: Number(total[0].count),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const obtenerEspaciosDisponibles = async (req, res) => {
  try {
    const espacios = await sql`
      SELECT e.esp_id, e.esp_no_espacio, e.esp_espacio, l.loc_area
      FROM cem_espacios e
      JOIN cem_locacion l ON e.esp_locacion = l.loc_id
      WHERE e.esp_ocupado = false
      ORDER BY e.esp_no_espacio ASC
    `;
    res.json(espacios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const crearEspacio = async (req, res) => {
  const {
    esp_espacio,
    esp_panteon,
    esp_locacion,
    esp_no_espacio,
    esp_valor_total,
    esp_cuotas,
  } = req.body;
  try {
    const nuevoEspacio = await sql`
      INSERT INTO cem_espacios (
        esp_espacio, esp_panteon, esp_locacion, esp_no_espacio, 
        esp_valor_total, esp_cuotas, esp_cuotas_restantes
      ) VALUES (
        ${esp_espacio}, ${esp_panteon || null}, ${esp_locacion}, 
        ${esp_no_espacio}, ${esp_valor_total || 0}, ${esp_cuotas || 1}, ${esp_cuotas || 1}
      ) RETURNING *
    `;
    res.status(201).json(nuevoEspacio[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const editarEspacio = async (req, res) => {
  const { id } = req.params;
  const {
    esp_espacio,
    esp_panteon,
    esp_locacion,
    esp_no_espacio,
    esp_ocupado,
    esp_valor_total,
    esp_cuotas,
  } = req.body;
  try {
    const actualizado = await sql`
      UPDATE cem_espacios SET
        esp_espacio = ${esp_espacio},
        esp_panteon = ${esp_panteon || null},
        esp_locacion = ${esp_locacion},
        esp_no_espacio = ${esp_no_espacio},
        esp_ocupado = ${esp_ocupado || false},
        esp_valor_total = ${esp_valor_total || 0},
        esp_cuotas = ${esp_cuotas || 1},
        esp_update = now()
      WHERE esp_id = ${id}
      RETURNING *
    `;
    res.json(actualizado[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const eliminarEspacio = async (req, res) => {
  const { id } = req.params;
  try {
    await sql`DELETE FROM cem_espacios WHERE esp_id = ${id}`;
    res.json({ mensaje: "Espacio eliminado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};