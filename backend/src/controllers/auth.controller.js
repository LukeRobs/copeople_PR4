/**
 * Controller de Autenticação - COMPLETO E CORRIGIDO
 */

const { prisma } = require('../config/database');
const { hashPassword, comparePassword } = require('../utils/hash');
const { generateToken } = require('../utils/jwt');
const {
  successResponse,
  errorResponse,
  createdResponse,
} = require('../utils/response');

/**
 * REGISTRO
 */
/**
 * REGISTRO
 */
const register = async (req, res) => {
  console.log("🔥 ARQUIVO AUTH.CONTROLLER CARREGADO");
  try {
    const { name, email, password, opsId } = req.body;

    // 🔒 Validação
    if (!name || !email || !password || !opsId) {
      return errorResponse(res, 'Nome, email, senha e opsId são obrigatórios', 400);
    }

    const emailFormatted = email.trim().toLowerCase();

    // 🔍 Verifica se já existe
    const existing = await prisma.user.findUnique({
      where: { email: emailFormatted },
    });

    if (existing) {
      return errorResponse(res, 'Email já cadastrado', 409);
    }

    // 🔐 Hash da senha
    const hashedPassword = await hashPassword(password);

    console.log("🔥 ROLE FIXA:", 'LIDERANCA');
    // 👤 Criação do usuário
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: emailFormatted,
        password: hashedPassword,
        role: 'LIDERANCA', // 🔥 FORÇADO
        opsId: opsId.trim(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        opsId: true,
        isActive: true,
        createdAt: true,
      },
    });

    // 🔑 Geração do token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return createdResponse(res, { user, token }, 'Usuário registrado com sucesso');
    
  } catch (error) {
    console.error('❌ Erro ao registrar usuário:', error);
    return errorResponse(res, 'Erro interno ao registrar usuário', 500);
  }
};

/**
 * LOGIN
 */
const login = async (req, res) => {
  const email = req.body.email?.trim().toLowerCase();
  const { password } = req.body;

  console.log("📩 Login recebido:", { email, password });

  const user = await prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } }
  });

  console.log("📌 Usuário buscado no banco:", user);

  if (!user || !user.password)
    return errorResponse(res, 'Email ou senha incorretos', 401);

  if (!user.isActive)
    return errorResponse(res, 'Usuário inativo', 401);

  const isValid = await comparePassword(password, user.password);

  if (!isValid)
    return errorResponse(res, 'Email ou senha incorretos', 401);

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role
  });

  const { password: _, ...safeUser } = user;

  return successResponse(res, { user: safeUser, token }, 'Login realizado com sucesso');
};

/**
 * GET USER LOGADO
 */
const getMe = async (req, res) => {
  if (!req.user)
    return errorResponse(res, 'Nenhuma sessão válida encontrada', 401);

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return successResponse(res, user);
};

/**
 * UPDATE PROFILE
 */
const updateMe = async (req, res) => {
  if (!req.user)
    return errorResponse(res, 'Nenhuma sessão válida encontrada', 401);

  const { name, avatar } = req.body;

  const updated = await prisma.user.update({
    where: { id: req.user.id },
    data: { name, avatar },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
      updatedAt: true,
    },
  });

  return successResponse(res, updated, 'Perfil atualizado');
};

/**
 * ALTERA SENHA
 */
const changePassword = async (req, res) => {
  if (!req.user)
    return errorResponse(res, 'Nenhuma sessão válida encontrada', 401);

  const { senhaAtual, novaSenha } = req.body;

  const user = await prisma.user.findUnique({
    where: { id: req.user.id }
  });

  const isMatch = await comparePassword(senhaAtual, user.password);
  if (!isMatch)
    return errorResponse(res, 'Senha atual incorreta', 401);

  const hashed = await hashPassword(novaSenha);

  await prisma.user.update({
    where: { id: req.user.id },
    data: { password: hashed },
  });

  return successResponse(res, null, 'Senha alterada com sucesso');
};

module.exports = {
  register,
  login,
  getMe,
  updateMe,
  changePassword,
};
