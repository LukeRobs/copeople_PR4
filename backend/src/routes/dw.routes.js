const express = require('express');
const router = express.Router();

// Controllers
const { postDwPlanejado, getDwPlanejado } = require('../controllers/dwPlanejado.controller');
const { postDwReal, getDwReal } = require('../controllers/dwReal.controller');
const { getDwResumo } = require('../controllers/dwResumo.controller');
const { getDwLista } = require('../controllers/dwLista.controller');

// =====================
// DW Planejado (Manual)
// =====================
router.post('/planejado', postDwPlanejado);
router.get('/planejado', getDwPlanejado);

// =====================
// DW Real (Banco)
// =====================
router.post('/real', postDwReal);
router.get('/real', getDwReal);

// =====================
// DW Resumo / Lista
// =====================
router.get('/resumo', getDwResumo);
router.get('/lista', getDwLista);

module.exports = router;
