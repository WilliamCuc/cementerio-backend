import sql from "../config/supabase.js";

export const obtenerLocaciones = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const offset = parseInt(req.query.offset) || 0;
  try {
    const locaciones = await sql`
      SELECT * FROM cem_locacion
      ORDER BY loc_id DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    const total = await sql`SELECT COUNT(*) FROM cem_locacion`;
    res.json({
      data: locaciones,
      total: Number(total[0].count),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const obtenerTodasLocaciones = async (req, res) => {
  try {
    const locaciones = await sql`
      SELECT loc_id, loc_area, loc_descripcion 
      FROM cem_locacion
      ORDER BY loc_area ASC
    `;
    res.json(locaciones);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const crearLocacion = async (req, res) => {
  const { loc_area, loc_descripcion } = req.body;
  try {
    const nuevaLocacion = await sql`
      INSERT INTO cem_locacion (loc_area, loc_descripcion)
      VALUES (${loc_area}, ${loc_descripcion})
      RETURNING *
    `;
    res.status(201).json(nuevaLocacion[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const editarLocacion = async (req, res) => {
  const { id } = req.params;
  const { loc_area, loc_descripcion } = req.body;
  try {
    const actualizada = await sql`
      UPDATE cem_locacion SET
        loc_area = ${loc_area},
        loc_descripcion = ${loc_descripcion},
        loc_update = now()
      WHERE loc_id = ${id}
      RETURNING *
    `;
    res.json(actualizada[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const eliminarLocacion = async (req, res) => {
  const { id } = req.params;
  try {
    await sql`DELETE FROM cem_locacion WHERE loc_id = ${id}`;
    res.json({ mensaje: "Locación eliminada" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
