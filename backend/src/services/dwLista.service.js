const { prisma } = require("../config/database");

const buscarDwLista = async ({ data, idTurno, idEmpresa }) => {

  /* ==========================
     1. EMPRESAS DO BANCO
  ========================== */
  const empresasDB = await prisma.empresa.findMany({
    where: { ativo: true },
    select: { idEmpresa: true, razaoSocial: true },
    orderBy: { razaoSocial: "asc" },
  });

  const empresaMap = {}; // idEmpresa → razaoSocial
  empresasDB.forEach((e) => { empresaMap[e.idEmpresa] = e.razaoSocial; });

  const idsEmpresas = empresasDB.map((e) => e.idEmpresa);

  /* ==========================
     2. WHERE BASE
  ========================== */
  const whereBase = {};

  if (data) whereBase.data = new Date(data);
  if (idTurno) whereBase.idTurno = Number(idTurno);

  if (idEmpresa && idsEmpresas.includes(Number(idEmpresa))) {
    whereBase.idEmpresa = Number(idEmpresa);
  } else {
    whereBase.idEmpresa = { in: idsEmpresas };
  }

  /* ==========================
     3. BUSCAR REAL E PLANEJADO
  ========================== */
  const [dwReais, dwPlanejados] = await Promise.all([
    prisma.dwReal.findMany({
      where: whereBase,
      orderBy: [{ data: "desc" }, { idTurno: "asc" }],
    }),
    prisma.dwPlanejado.findMany({
      where: whereBase,
      orderBy: [{ data: "desc" }, { idTurno: "asc" }],
    }),
  ]);

  /* ==========================
     4. AGRUPAR POR DATA + TURNO
  ========================== */
  const agrupado = {};
  const turnoMap = { 1: "T1", 2: "T2", 3: "T3" };

  const initEmpresas = () => {
    const obj = {};
    empresasDB.forEach((e) => { obj[e.razaoSocial] = 0; });
    return obj;
  };

  for (const r of dwReais) {
    const dataISO = r.data.toISOString().slice(0, 10);
    const chave = `${dataISO}_${r.idTurno}`;

    if (!agrupado[chave]) {
      agrupado[chave] = {
        data: dataISO,
        turno: turnoMap[r.idTurno] || `T${r.idTurno}`,
        planejado: 0,
        empresas: initEmpresas(),
        totalReal: 0,
      };
    }

    const nomeEmpresa = empresaMap[r.idEmpresa];
    if (!nomeEmpresa) continue;

    agrupado[chave].empresas[nomeEmpresa] = (agrupado[chave].empresas[nomeEmpresa] || 0) + r.quantidade;
    agrupado[chave].totalReal += r.quantidade;
  }

  for (const p of dwPlanejados) {
    const dataISO = p.data.toISOString().slice(0, 10);
    const chave = `${dataISO}_${p.idTurno}`;

    if (!agrupado[chave]) {
      agrupado[chave] = {
        data: dataISO,
        turno: turnoMap[p.idTurno] || `T${p.idTurno}`,
        planejado: 0,
        empresas: initEmpresas(),
        totalReal: 0,
      };
    }

    agrupado[chave].planejado += p.quantidade;
  }

  return Object.values(agrupado).sort(
    (a, b) => new Date(b.data) - new Date(a.data) || a.turno.localeCompare(b.turno)
  );
};

module.exports = { buscarDwLista };
