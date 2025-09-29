import sql from "../config/supabase.js";

export const resumenGeneral = async (req, res) => {
  try {
    const [espacios] = await sql`
      SELECT 
        COUNT(*) as total_espacios,
        COUNT(*) FILTER (WHERE esp_ocupado = true) as espacios_ocupados,
        COUNT(*) FILTER (WHERE esp_ocupado = false) as espacios_disponibles,
        COUNT(*) FILTER (WHERE esp_espacio = 'NICHO') as total_nichos,
        COUNT(*) FILTER (WHERE esp_espacio = 'TIERRA') as total_tierra
      FROM cem_espacios
    `;

    const [difuntos] = await sql`
      SELECT COUNT(*) as total_difuntos
      FROM cem_difuntos
    `;

    const [financiero] = await sql`
      SELECT 
        COALESCE(SUM(esp_valor_total), 0) as valor_total_espacios,
        COALESCE(SUM(esp_total_pagado), 0) as total_recaudado,
        COALESCE(SUM(esp_restante_pago), 0) as total_por_cobrar
      FROM cem_espacios
    `;

    const [transacciones] = await sql`
      SELECT 
        COUNT(*) as total_transacciones,
        COALESCE(SUM(tra_abono), 0) as suma_transacciones
      FROM cem_transacciones
    `;

    res.json({
      espacios,
      difuntos,
      financiero,
      transacciones
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const ingresosPorPeriodo = async (req, res) => {
  const { fechaInicio, fechaFin } = req.query;
  try {
    const ingresos = await sql`
      SELECT 
        DATE(tra_fecha_pago) as fecha,
        COUNT(*) as num_transacciones,
        SUM(tra_abono) as total_ingresos
      FROM cem_transacciones
      WHERE tra_fecha_pago BETWEEN ${fechaInicio} AND ${fechaFin}
      GROUP BY DATE(tra_fecha_pago)
      ORDER BY fecha DESC
    `;

    const [resumen] = await sql`
      SELECT 
        COUNT(*) as total_transacciones,
        COALESCE(SUM(tra_abono), 0) as total_ingresos
      FROM cem_transacciones
      WHERE tra_fecha_pago BETWEEN ${fechaInicio} AND ${fechaFin}
    `;

    res.json({
      detalle: ingresos,
      resumen
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const cuentasPorCobrar = async (req, res) => {
  try {
    const cuentas = await sql`
      SELECT 
        e.esp_id,
        e.esp_no_espacio,
        e.esp_espacio,
        l.loc_area,
        e.esp_valor_total,
        e.esp_total_pagado,
        e.esp_restante_pago,
        e.esp_cuotas_restantes,
        CASE 
          WHEN e.esp_total_pagado = 0 THEN 'Sin Pagos'
          WHEN e.esp_restante_pago > 0 THEN 'Pago Parcial'
          ELSE 'Pagado'
        END as estado_pago
      FROM cem_espacios e
      JOIN cem_locacion l ON e.esp_locacion = l.loc_id
      WHERE e.esp_restante_pago > 0
      ORDER BY e.esp_restante_pago DESC
    `;

    const [totales] = await sql`
      SELECT 
        COUNT(*) as espacios_con_deuda,
        COALESCE(SUM(esp_restante_pago), 0) as total_por_cobrar
      FROM cem_espacios
      WHERE esp_restante_pago > 0
    `;

    res.json({
      cuentas,
      totales
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const ocupacionPorArea = async (req, res) => {
  try {
    const ocupacion = await sql`
      SELECT 
        l.loc_area,
        COUNT(e.esp_id) as total_espacios,
        COUNT(e.esp_id) FILTER (WHERE e.esp_ocupado = true) as ocupados,
        COUNT(e.esp_id) FILTER (WHERE e.esp_ocupado = false) as disponibles,
        ROUND(
          (COUNT(e.esp_id) FILTER (WHERE e.esp_ocupado = true)::numeric / 
          NULLIF(COUNT(e.esp_id), 0) * 100), 2
        ) as porcentaje_ocupacion
      FROM cem_locacion l
      LEFT JOIN cem_espacios e ON l.loc_id = e.esp_locacion
      GROUP BY l.loc_id, l.loc_area
      ORDER BY l.loc_area
    `;

    res.json(ocupacion);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const difuntosPorPeriodo = async (req, res) => {
  const { fechaInicio, fechaFin } = req.query;
  try {
    const difuntos = await sql`
      SELECT 
        d.dif_id,
        d.dif_primer_nombre,
        d.dif_segundo_nombre,
        d.dif_primer_apellido,
        d.dif_segundo_apellido,
        d.dif_fecha_defuncion,
        d.dif_fecha_entierro,
        e.esp_no_espacio,
        e.esp_espacio,
        l.loc_area
      FROM cem_difuntos d
      LEFT JOIN cem_espacios e ON d.dif_espacios = e.esp_id
      LEFT JOIN cem_locacion l ON e.esp_locacion = l.loc_id
      WHERE d.dif_fecha_entierro BETWEEN ${fechaInicio} AND ${fechaFin}
      ORDER BY d.dif_fecha_entierro DESC
    `;

    const [resumen] = await sql`
      SELECT COUNT(*) as total_difuntos
      FROM cem_difuntos
      WHERE dif_fecha_entierro BETWEEN ${fechaInicio} AND ${fechaFin}
    `;

    res.json({
      difuntos,
      resumen
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const estadoPanteones = async (req, res) => {
  try {
    const panteones = await sql`
      SELECT 
        p.pan_no_panteon,
        l.loc_area,
        p.pan_capacidad_maxima,
        COUNT(e.esp_id) as nichos_totales,
        COUNT(e.esp_id) FILTER (WHERE e.esp_ocupado = true) as nichos_ocupados,
        COUNT(e.esp_id) FILTER (WHERE e.esp_ocupado = false) as nichos_disponibles,
        p.pan_capacidad_maxima - COUNT(e.esp_id) as capacidad_restante
      FROM cem_panteones p
      LEFT JOIN cem_locacion l ON p.pan_locacion_id = l.loc_id
      LEFT JOIN cem_espacios e ON p.pan_id = e.esp_panteon
      GROUP BY p.pan_id, p.pan_no_panteon, p.pan_capacidad_maxima, l.loc_area
      ORDER BY p.pan_no_panteon
    `;

    res.json(panteones);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const movimientosRecientes = async (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  try {
    const movimientos = await sql`
      SELECT 
        m.mov_fecha,
        d.dif_primer_nombre,
        d.dif_segundo_nombre,
        d.dif_primer_apellido,
        d.dif_segundo_apellido,
        e.est_descripcion,
        m.mov_observaciones,
        es.esp_no_espacio,
        l.loc_area
      FROM cem_movimientos m
      JOIN cem_difuntos d ON m.mov_difuntos = d.dif_id
      JOIN cem_estados e ON m.mov_estados = e.est_id
      LEFT JOIN cem_espacios es ON d.dif_espacios = es.esp_id
      LEFT JOIN cem_locacion l ON es.esp_locacion = l.loc_id
      ORDER BY m.mov_fecha DESC, m.mov_id DESC
      LIMIT ${limit}
    `;

    res.json(movimientos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const espaciosDisponibles = async (req, res) => {
  try {
    const espacios = await sql`
      SELECT * FROM vw_espacios_disponibles
      ORDER BY loc_area, esp_no_espacio
    `;

    const [resumen] = await sql`
      SELECT 
        COUNT(*) as total_disponibles,
        COUNT(*) FILTER (WHERE esp_espacio = 'NICHO') as nichos_disponibles,
        COUNT(*) FILTER (WHERE esp_espacio = 'TIERRA') as tierra_disponible
      FROM vw_espacios_disponibles
    `;

    res.json({
      espacios,
      resumen
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const resumenFinancieroPorEspacio = async (req, res) => {
  try {
    const resumen = await sql`
      SELECT 
        esp_no_espacio,
        esp_espacio,
        esp_valor_total,
        esp_total_pagado,
        esp_restante_pago,
        esp_cuotas,
        esp_cuotas_restantes,
        estado_pago
      FROM vw_resumen_pagos
      ORDER BY esp_restante_pago DESC
    `;

    res.json(resumen);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const topDeudores = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  try {
    const top = await sql`
      SELECT 
        e.esp_no_espacio,
        e.esp_espacio,
        l.loc_area,
        e.esp_valor_total,
        e.esp_total_pagado,
        e.esp_restante_pago,
        ROUND((e.esp_total_pagado / NULLIF(e.esp_valor_total, 0) * 100), 2) as porcentaje_pagado
      FROM cem_espacios e
      JOIN cem_locacion l ON e.esp_locacion = l.loc_id
      WHERE e.esp_restante_pago > 0
      ORDER BY e.esp_restante_pago DESC
      LIMIT ${limit}
    `;

    res.json(top);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};