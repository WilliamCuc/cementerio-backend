import sql from "../config/supabase.js";

export const obtenerMovimientos = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const offset = parseInt(req.query.offset) || 0;
  const { fechaInicio, fechaFin, difunto } = req.query;

  try {
    let baseQuery = `
      SELECT m.*, 
             d.dif_id, d.dif_primer_nombre, d.dif_segundo_nombre, 
             d.dif_primer_apellido, d.dif_segundo_apellido,
             e.est_tipo
      FROM cem_movimientos m
      LEFT JOIN cem_difuntos d ON m.mov_difuntos = d.dif_id
      LEFT JOIN cem_estados e ON m.mov_estados = e.est_id
      WHERE 1=1
    `;
    let countQuery = `
      SELECT COUNT(*) 
      FROM cem_movimientos m
      LEFT JOIN cem_difuntos d ON m.mov_difuntos = d.dif_id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (fechaInicio) {
      baseQuery += ` AND m.mov_fecha >= $${paramIndex}`;
      countQuery += ` AND m.mov_fecha >= $${paramIndex}`;
      params.push(fechaInicio);
      paramIndex++;
    }

    if (fechaFin) {
      baseQuery += ` AND m.mov_fecha <= $${paramIndex}`;
      countQuery += ` AND m.mov_fecha <= $${paramIndex}`;
      params.push(fechaFin);
      paramIndex++;
    }

    if (difunto) {
      const difuntoNum = parseInt(difunto);
      if (!isNaN(difuntoNum)) {
        baseQuery += ` AND d.dif_id = $${paramIndex}`;
        countQuery += ` AND d.dif_id = $${paramIndex}`;
        params.push(difuntoNum);
        paramIndex++;
      } else {
        const difuntoBusqueda = `%${difunto}%`;
        baseQuery += ` AND (
          CONCAT(d.dif_primer_nombre, ' ', COALESCE(d.dif_segundo_nombre, ''), ' ', 
                 d.dif_primer_apellido, ' ', COALESCE(d.dif_segundo_apellido, '')) 
          ILIKE $${paramIndex}
        )`;
        countQuery += ` AND (
          CONCAT(d.dif_primer_nombre, ' ', COALESCE(d.dif_segundo_nombre, ''), ' ', 
                 d.dif_primer_apellido, ' ', COALESCE(d.dif_segundo_apellido, '')) 
          ILIKE $${paramIndex}
        )`;
        params.push(difuntoBusqueda);
        paramIndex++;
      }
    }

    baseQuery += ` ORDER BY m.mov_id DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const movimientos = await sql.unsafe(baseQuery, params);
    const total = await sql.unsafe(countQuery, params.slice(0, -2));

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
    const nuevoMovimiento = await sql`
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
    mov_observaciones,
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