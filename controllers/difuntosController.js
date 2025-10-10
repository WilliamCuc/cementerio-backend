import sql from "../config/supabase.js";

export const obtenerDifuntos = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const offset = parseInt(req.query.offset) || 0;
  const { dpi, nombre, fechaDefuncionInicio, fechaDefuncionFin, fechaEntierroInicio, fechaEntierroFin } = req.query;

  try {
    let baseQuery = sql`SELECT * FROM cem_difuntos WHERE 1=1`;
    let countQuery = sql`SELECT COUNT(*) FROM cem_difuntos WHERE 1=1`;

    if (dpi) {
      baseQuery = sql`${baseQuery} AND dif_dpi = ${dpi}`;
      countQuery = sql`${countQuery} AND dif_dpi = ${dpi}`;
    }

    if (nombre && nombre.trim() !== '') {
      const nombreBusqueda = `%${nombre.trim().toLowerCase()}%`;
      baseQuery = sql`${baseQuery} AND (
        LOWER(dif_primer_nombre || ' ' || COALESCE(dif_segundo_nombre, '') || ' ' || 
        dif_primer_apellido || ' ' || COALESCE(dif_segundo_apellido, '')) 
        LIKE ${nombreBusqueda}
      )`;
      countQuery = sql`${countQuery} AND (
        LOWER(dif_primer_nombre || ' ' || COALESCE(dif_segundo_nombre, '') || ' ' || 
        dif_primer_apellido || ' ' || COALESCE(dif_segundo_apellido, '')) 
        LIKE ${nombreBusqueda}
      )`;
    }

    if (fechaDefuncionInicio && fechaDefuncionFin) {
      baseQuery = sql`${baseQuery} AND dif_fecha_defuncion BETWEEN ${fechaDefuncionInicio} AND ${fechaDefuncionFin}`;
      countQuery = sql`${countQuery} AND dif_fecha_defuncion BETWEEN ${fechaDefuncionInicio} AND ${fechaDefuncionFin}`;
    } else if (fechaDefuncionInicio) {
      baseQuery = sql`${baseQuery} AND dif_fecha_defuncion >= ${fechaDefuncionInicio}`;
      countQuery = sql`${countQuery} AND dif_fecha_defuncion >= ${fechaDefuncionInicio}`;
    } else if (fechaDefuncionFin) {
      baseQuery = sql`${baseQuery} AND dif_fecha_defuncion <= ${fechaDefuncionFin}`;
      countQuery = sql`${countQuery} AND dif_fecha_defuncion <= ${fechaDefuncionFin}`;
    }

    if (fechaEntierroInicio && fechaEntierroFin) {
      baseQuery = sql`${baseQuery} AND dif_fecha_entierro BETWEEN ${fechaEntierroInicio} AND ${fechaEntierroFin}`;
      countQuery = sql`${countQuery} AND dif_fecha_entierro BETWEEN ${fechaEntierroInicio} AND ${fechaEntierroFin}`;
    } else if (fechaEntierroInicio) {
      baseQuery = sql`${baseQuery} AND dif_fecha_entierro >= ${fechaEntierroInicio}`;
      countQuery = sql`${countQuery} AND dif_fecha_entierro >= ${fechaEntierroInicio}`;
    } else if (fechaEntierroFin) {
      baseQuery = sql`${baseQuery} AND dif_fecha_entierro <= ${fechaEntierroFin}`;
      countQuery = sql`${countQuery} AND dif_fecha_entierro <= ${fechaEntierroFin}`;
    }

    baseQuery = sql`${baseQuery} ORDER BY dif_id DESC LIMIT ${limit} OFFSET ${offset}`;

    const difuntos = await baseQuery;
    const totalResult = await countQuery;

    res.json({
      data: difuntos,
      total: Number(totalResult[0].count),
    });
  } catch (error) {
    console.error("Error en obtenerDifuntos:", error);
    res.status(500).json({ error: error.message });
  }
};

export const crearDifunto = async (req, res) => {
  const {
    dif_primer_nombre,
    dif_segundo_nombre,
    dif_primer_apellido,
    dif_segundo_apellido,
    dif_dpi,
    dif_espacios,
    dif_fecha_defuncion,
    dif_fecha_entierro,
  } = req.body;
  try {
    const nuevoDifunto = await sql`
      INSERT INTO cem_difuntos (
        dif_primer_nombre, dif_segundo_nombre, dif_primer_apellido, dif_segundo_apellido,
        dif_dpi, dif_espacios, dif_fecha_defuncion, dif_fecha_entierro
      ) VALUES (
        ${dif_primer_nombre}, ${dif_segundo_nombre}, ${dif_primer_apellido}, ${dif_segundo_apellido},
        ${dif_dpi}, ${dif_espacios}, ${dif_fecha_defuncion}, ${dif_fecha_entierro}
      ) RETURNING *`;
    res.status(201).json(nuevoDifunto[0]);
  } catch (error) {
    console.error("Error en crearDifunto:", error);
    res.status(500).json({ error: error.message });
  }
};

export const editarDifunto = async (req, res) => {
  const { id } = req.params;
  const {
    dif_primer_nombre,
    dif_segundo_nombre,
    dif_primer_apellido,
    dif_segundo_apellido,
    dif_dpi,
    dif_espacios,
    dif_fecha_defuncion,
    dif_fecha_entierro,
  } = req.body;
  try {
    const actualizado = await sql`
      UPDATE cem_difuntos SET
        dif_primer_nombre = ${dif_primer_nombre},
        dif_segundo_nombre = ${dif_segundo_nombre},
        dif_primer_apellido = ${dif_primer_apellido},
        dif_segundo_apellido = ${dif_segundo_apellido},
        dif_dpi = ${dif_dpi},
        dif_espacios = ${dif_espacios},
        dif_fecha_defuncion = ${dif_fecha_defuncion},
        dif_fecha_entierro = ${dif_fecha_entierro},
        dif_update = now()
      WHERE dif_id = ${id}
      RETURNING *`;
    res.json(actualizado[0]);
  } catch (error) {
    console.error("Error en editarDifunto:", error);
    res.status(500).json({ error: error.message });
  }
};

export const eliminarDifunto = async (req, res) => {
  const { id } = req.params;
  try {
    await sql`DELETE FROM cem_difuntos WHERE dif_id = ${id}`;
    res.json({ mensaje: "Difunto eliminado" });
  } catch (error) {
    console.error("Error en eliminarDifunto:", error);
    res.status(500).json({ error: error.message });
  }
};