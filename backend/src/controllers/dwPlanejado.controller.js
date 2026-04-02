// src/controllers/dwPlanejado.controller.js
const { prisma } = require("../config/database");

/* =====================================================
   POST /dw/planejado
   Salva ou atualiza DW Planejado por empresa/turno/data
===================================================== */
const postDwPlanejado = async (req, res) => {
  try {
    const { data, idTurno, idEmpresa, quantidade, observacao } = req.body;

    if (!data || !idTurno || !idEmpresa || quantidade === undefined) {
      return res.status(400).json({
        success: false,
        message: "data, idTurno, idEmpresa e quantidade são obrigatórios",
      });
    }

    const registro = await prisma.dwPlanejado.upsert({
      where: {
        data_idTurno_idEmpresa: {
          data: new Date(data),
          idTurno: Number(idTurno),
          idEmpresa: Number(idEmpresa),
        },
      },
      update: {
        quantidade: Number(quantidade),
        observacao: observacao || null,
      },
      create: {
        data: new Date(data),
        idTurno: Number(idTurno),
        idEmpresa: Number(idEmpresa),
        quantidade: Number(quantidade),
        observacao: observacao || null,
      },
    });

    return res.status(200).json({
      success: true,
      message: "DW Planejado salvo com sucesso",
      data: registro,
    });
  } catch (error) {
    console.error("Erro postDwPlanejado:", error);
    return res.status(500).json({
      success: false,
      message: "Erro ao salvar DW Planejado",
    });
  }
};

/* =====================================================
   GET /dw/planejado?data=YYYY-MM-DD&idTurno=1
   Retorna registros planejados por data + turno
===================================================== */
const getDwPlanejado = async (req, res) => {
  try {
    const { data, idTurno } = req.query;

    if (!data || !idTurno) {
      return res.status(400).json({
        success: false,
        message: "data e idTurno são obrigatórios",
      });
    }

    const registros = await prisma.dwPlanejado.findMany({
      where: {
        data: new Date(data),
        idTurno: Number(idTurno),
      },
    });

    return res.status(200).json({
      success: true,
      data: registros,
    });
  } catch (error) {
    console.error("Erro getDwPlanejado:", error);
    return res.status(500).json({
      success: false,
      message: "Erro ao buscar DW Planejado",
    });
  }
};

module.exports = { postDwPlanejado, getDwPlanejado };
