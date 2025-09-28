import sql from "../config/supabase.js";

export const obtenerEstados = async (req, res) => {
  try {
    const estados = await sql`
      SELECT * FROM cem_estados
      ORDER BY est_id ASC
    `;
    res.json({
      data: estados,
      total: estados.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};