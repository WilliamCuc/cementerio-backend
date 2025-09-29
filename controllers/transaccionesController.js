import sql from "../config/supabase.js";

export const obtenerTransacciones = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const offset = parseInt(req.query.offset) || 0;
  try {
    const transacciones = await sql`
      SELECT t.*, e.esp_no_espacio, e.esp_espacio, l.loc_area
      FROM cem_transacciones t
      JOIN cem_espacios e ON t.tra_espacios = e.esp_id
      JOIN cem_locacion l ON e.esp_locacion = l.loc_id
      ORDER BY t.tra_id DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    const total = await sql`SELECT COUNT(*) FROM cem_transacciones`;
    res.json({
      data: transacciones,
      total: Number(total[0].count),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const obtenerTransaccionesPorEspacio = async (req, res) => {
  const { espacioId } = req.params;
  try {
    const transacciones = await sql`
      SELECT t.*, e.esp_no_espacio, e.esp_valor_total, e.esp_total_pagado, e.esp_restante_pago
      FROM cem_transacciones t
      JOIN cem_espacios e ON t.tra_espacios = e.esp_id
      WHERE t.tra_espacios = ${espacioId}
      ORDER BY t.tra_fecha_pago DESC
    `;
    res.json(transacciones);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const crearTransaccion = async (req, res) => {
  const {
    tra_fecha_pago,
    tra_abono,
    tra_documento,
    tra_espacios,
    tra_observaciones,
  } = req.body;
  
  try {
    const nuevaTransaccion = await sql`
      INSERT INTO cem_transacciones (
        tra_fecha_pago, tra_abono, tra_documento, tra_espacios, tra_observaciones
      ) VALUES (
        ${tra_fecha_pago || new Date().toISOString().split('T')[0]}, 
        ${tra_abono}, 
        ${tra_documento || null}, 
        ${tra_espacios}, 
        ${tra_observaciones || null}
      ) RETURNING *
    `;

    const espacioActualizado = await sql`
      SELECT esp_total_pagado, esp_restante_pago, esp_cuotas_restantes, esp_ocupado
      FROM cem_espacios
      WHERE esp_id = ${tra_espacios}
    `;
    
    res.status(201).json({
      transaccion: nuevaTransaccion[0],
      espacioActualizado: espacioActualizado[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const editarTransaccion = async (req, res) => {
  const { id } = req.params;
  const {
    tra_fecha_pago,
    tra_abono,
    tra_documento,
    tra_observaciones,
  } = req.body;
  
  try {
    const actualizada = await sql`
      UPDATE cem_transacciones SET
        tra_fecha_pago = ${tra_fecha_pago},
        tra_abono = ${tra_abono},
        tra_documento = ${tra_documento || null},
        tra_observaciones = ${tra_observaciones || null}
      WHERE tra_id = ${id}
      RETURNING *
    `;
    res.json(actualizada[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const eliminarTransaccion = async (req, res) => {
  const { id } = req.params;
  try {
    await sql`DELETE FROM cem_transacciones WHERE tra_id = ${id}`;
    res.json({ mensaje: "Transacción eliminada" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const resumenPagosEspacio = async (req, res) => {
  const { espacioId } = req.params;
  try {
    const resumen = await sql`
      SELECT 
        e.esp_id,
        e.esp_no_espacio,
        e.esp_valor_total,
        e.esp_total_pagado,
        e.esp_restante_pago,
        e.esp_cuotas,
        e.esp_cuotas_restantes,
        e.esp_ocupado,
        COUNT(t.tra_id) as total_transacciones,
        COALESCE(SUM(t.tra_abono), 0) as suma_abonos
      FROM cem_espacios e
      LEFT JOIN cem_transacciones t ON e.esp_id = t.tra_espacios
      WHERE e.esp_id = ${espacioId}
      GROUP BY e.esp_id
    `;
    res.json(resumen[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};