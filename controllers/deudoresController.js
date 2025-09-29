import sql from "../config/supabase.js";

export const obtenerDeudores = async (req, res) => {
  const diasAtraso = parseInt(req.query.diasAtraso) || 30; 
  
  try {
    const deudores = await sql`
      WITH ultimo_pago AS (
        SELECT 
          t.tra_espacios,
          MAX(t.tra_fecha_pago) as ultima_fecha_pago,
          CURRENT_DATE - MAX(t.tra_fecha_pago) as dias_sin_pagar
        FROM cem_transacciones t
        GROUP BY t.tra_espacios
      )
      SELECT 
        enc.enc_id,
        enc.enc_primer_nombre,
        enc.enc_segundo_nombre,
        enc.enc_primer_apellido,
        enc.enc_segundo_apellido,
        enc.enc_telefono_uno,
        enc.enc_telefono_dos,
        enc.enc_direccion,
        p.pan_no_panteon,
        l.loc_area,
        e.esp_id,
        e.esp_no_espacio,
        e.esp_espacio,
        e.esp_valor_total,
        e.esp_total_pagado,
        e.esp_restante_pago,
        e.esp_cuotas,
        e.esp_cuotas_restantes,
        up.ultima_fecha_pago,
        COALESCE(up.dias_sin_pagar, 
          CURRENT_DATE - e.esp_creacion::date) as dias_sin_pagar,
        CASE 
          WHEN up.ultima_fecha_pago IS NULL THEN 'Sin Pagos'
          WHEN up.dias_sin_pagar >= 90 THEN 'Crítico'
          WHEN up.dias_sin_pagar >= 60 THEN 'Urgente'
          WHEN up.dias_sin_pagar >= 30 THEN 'Atrasado'
          ELSE 'Al día'
        END as estado_morosidad
      FROM cem_encargado enc
      INNER JOIN cem_panteones p ON enc.enc_panteones = p.pan_id
      INNER JOIN cem_espacios e ON p.pan_id = e.esp_panteon
      LEFT JOIN cem_locacion l ON p.pan_locacion_id = l.loc_id
      LEFT JOIN ultimo_pago up ON e.esp_id = up.tra_espacios
      WHERE e.esp_restante_pago > 0
        AND (up.dias_sin_pagar >= ${diasAtraso} OR up.ultima_fecha_pago IS NULL)
      ORDER BY 
        CASE 
          WHEN up.ultima_fecha_pago IS NULL THEN 999
          ELSE up.dias_sin_pagar 
        END DESC
    `;

    const [resumen] = await sql`
      WITH ultimo_pago AS (
        SELECT 
          t.tra_espacios,
          MAX(t.tra_fecha_pago) as ultima_fecha_pago,
          CURRENT_DATE - MAX(t.tra_fecha_pago) as dias_sin_pagar
        FROM cem_transacciones t
        GROUP BY t.tra_espacios
      )
      SELECT 
        COUNT(DISTINCT enc.enc_id) as total_deudores,
        COUNT(e.esp_id) as espacios_con_deuda,
        SUM(e.esp_restante_pago) as deuda_total,
        COUNT(*) FILTER (WHERE up.ultima_fecha_pago IS NULL) as sin_pagos,
        COUNT(*) FILTER (WHERE up.dias_sin_pagar >= 90) as critico,
        COUNT(*) FILTER (WHERE up.dias_sin_pagar >= 60 AND up.dias_sin_pagar < 90) as urgente,
        COUNT(*) FILTER (WHERE up.dias_sin_pagar >= 30 AND up.dias_sin_pagar < 60) as atrasado
      FROM cem_encargado enc
      INNER JOIN cem_panteones p ON enc.enc_panteones = p.pan_id
      INNER JOIN cem_espacios e ON p.pan_id = e.esp_panteon
      LEFT JOIN ultimo_pago up ON e.esp_id = up.tra_espacios
      WHERE e.esp_restante_pago > 0
    `;

    res.json({
      deudores,
      resumen
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const detalleDeudaEncargado = async (req, res) => {
  const { encargadoId } = req.params;
  
  try {
    const detalle = await sql`
      WITH ultimo_pago AS (
        SELECT 
          t.tra_espacios,
          MAX(t.tra_fecha_pago) as ultima_fecha_pago,
          COUNT(*) as total_pagos,
          SUM(t.tra_abono) as suma_pagos
        FROM cem_transacciones t
        GROUP BY t.tra_espacios
      )
      SELECT 
        e.esp_id,
        e.esp_no_espacio,
        e.esp_espacio,
        e.esp_valor_total,
        e.esp_total_pagado,
        e.esp_restante_pago,
        e.esp_cuotas,
        e.esp_cuotas_restantes,
        p.pan_no_panteon,
        l.loc_area,
        up.ultima_fecha_pago,
        up.total_pagos,
        CURRENT_DATE - up.ultima_fecha_pago as dias_sin_pagar
      FROM cem_encargado enc
      INNER JOIN cem_panteones p ON enc.enc_panteones = p.pan_id
      INNER JOIN cem_espacios e ON p.pan_id = e.esp_panteon
      LEFT JOIN cem_locacion l ON p.pan_locacion_id = l.loc_id
      LEFT JOIN ultimo_pago up ON e.esp_id = up.tra_espacios
      WHERE enc.enc_id = ${encargadoId}
        AND e.esp_restante_pago > 0
      ORDER BY e.esp_restante_pago DESC
    `;

    const [encargado] = await sql`
      SELECT 
        enc_primer_nombre,
        enc_segundo_nombre,
        enc_primer_apellido,
        enc_segundo_apellido,
        enc_telefono_uno,
        enc_telefono_dos,
        enc_direccion
      FROM cem_encargado
      WHERE enc_id = ${encargadoId}
    `;

    res.json({
      encargado: encargado || null,
      espacios: detalle
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const historialPagosEspacio = async (req, res) => {
  const { espacioId } = req.params;
  
  try {
    const historial = await sql`
      SELECT 
        tra_id,
        tra_fecha_pago,
        tra_abono,
        tra_documento,
        tra_observaciones
      FROM cem_transacciones
      WHERE tra_espacios = ${espacioId}
      ORDER BY tra_fecha_pago DESC
    `;

    const [espacio] = await sql`
      SELECT 
        e.esp_no_espacio,
        e.esp_valor_total,
        e.esp_total_pagado,
        e.esp_restante_pago,
        p.pan_no_panteon
      FROM cem_espacios e
      LEFT JOIN cem_panteones p ON e.esp_panteon = p.pan_id
      WHERE e.esp_id = ${espacioId}
    `;

    res.json({
      espacio: espacio || null,
      historial
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const exportarDeudores = async (req, res) => {
  try {
    const deudores = await sql`
      WITH ultimo_pago AS (
        SELECT 
          t.tra_espacios,
          MAX(t.tra_fecha_pago) as ultima_fecha_pago,
          CURRENT_DATE - MAX(t.tra_fecha_pago) as dias_sin_pagar
        FROM cem_transacciones t
        GROUP BY t.tra_espacios
      )
      SELECT 
        enc.enc_primer_nombre || ' ' || 
        COALESCE(enc.enc_segundo_nombre || ' ', '') ||
        enc.enc_primer_apellido || ' ' ||
        COALESCE(enc.enc_segundo_apellido, '') as nombre_completo,
        enc.enc_telefono_uno,
        enc.enc_telefono_dos,
        p.pan_no_panteon,
        e.esp_no_espacio,
        e.esp_restante_pago,
        e.esp_cuotas_restantes,
        up.ultima_fecha_pago,
        COALESCE(up.dias_sin_pagar, 999) as dias_sin_pagar
      FROM cem_encargado enc
      INNER JOIN cem_panteones p ON enc.enc_panteones = p.pan_id
      INNER JOIN cem_espacios e ON p.pan_id = e.esp_panteon
      LEFT JOIN ultimo_pago up ON e.esp_id = up.tra_espacios
      WHERE e.esp_restante_pago > 0
      ORDER BY dias_sin_pagar DESC
    `;

    res.json(deudores);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};