import sql from "../config/supabase.js";

export const obtenerEspacios = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const offset = parseInt(req.query.offset) || 0;
  try {
    const espacios = await sql`
      SELECT e.*, l.loc_area, p.pan_no_panteon
      FROM cem_espacios e
      JOIN cem_locacion l ON e.esp_locacion = l.loc_id
      LEFT JOIN cem_panteones p ON e.esp_panteon = p.pan_id
      ORDER BY e.esp_id DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    const total = await sql`SELECT COUNT(*) FROM cem_espacios`;
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
