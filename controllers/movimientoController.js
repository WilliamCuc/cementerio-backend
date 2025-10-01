import sql from "../config/supabase.js";

export const obtenerMovimientos = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const offset = parseInt(req.query.offset) || 0;
  try {
    const movimientos = await sql`
      SELECT * FROM cem_movimientos
      ORDER BY mov_id DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    const total = await sql`SELECT COUNT(*) FROM cem_movimientos`;
    res.json({
      data: movimientos,
      total: Number(total[0].count),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const crearMovimiento = async (req, res) => {
  const {
  mov_fecha = null,
  mov_estados = null,
  mov_difuntos = null,
  mov_observaciones = null,
} = req.body;
  try {
    const nuevoMovimiento  = await sql`
      INSERT INTO cem_movimientos (
        mov_fecha, mov_estados, mov_difuntos, mov_observaciones
      ) VALUES (
        ${mov_fecha}, ${mov_estados}, ${mov_difuntos}, ${mov_observaciones}
      ) RETURNING *`;
    res.status(201).json(nuevoMovimiento[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const editarMovimiento = async (req, res) => {
  const { id } = req.params;
  const {
    mov_fecha,
    mov_estados,
    mov_difuntos,
    mov_observaciones
  } = req.body;
  try {
    const actualizado = await sql`
      UPDATE cem_movimientos SET
        mov_fecha = ${mov_fecha},
        mov_estados = ${mov_estados},
        mov_difuntos = ${mov_difuntos},
        mov_observaciones = ${mov_observaciones}
      WHERE mov_id = ${id}
      RETURNING *`;
    res.json(actualizado[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const eliminarMovimiento = async (req, res) => {
  const { id } = req.params;
  try {
    await sql`DELETE FROM cem_movimientos WHERE mov_id = ${id}`;
    res.json({ mensaje: "Movimiento eliminado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
