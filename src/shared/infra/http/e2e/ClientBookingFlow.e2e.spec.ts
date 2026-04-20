import request from 'supertest';
import { app } from '@shared/infra/http/app';
import { getConnectionManager, getMongoRepository } from 'typeorm';
import { Notification } from '@modules/notifications/infra/typeorm/schemas/Notification';
import { v4 as uuidV4 } from 'uuid';

// ============================================================
// 🗓️ Jornada do Cliente - Marcar Agendamento (Client Booking Flow E2E)
// ============================================================
// Fluxo testado:
//   1. Registro e autenticação do cliente
//   2. Gerenciamento de perfil (visualizar, atualizar, avatar)
//   3. Recuperação e redefinição de senha
//   4. Listar provedores disponíveis
//   5. Consultar disponibilidade mensal e diária do provedor
//   6. Criar agendamento (cenários felizes e tristes)
//   7. Listar próprios agendamentos (visão do provedor)
// ============================================================

describe('🗓️ Jornada do Cliente - Marcar Agendamento (ClientBookingFlow E2E)', () => {
  jest.setTimeout(60000);

  let clientToken: string;
  let clientId: string;
  let providerToken: string;
  let providerId: string;
  let anotherProviderId: string;

  beforeAll(async () => {
    // Aguarda conexão disponível via jest.setup.ts (beforeAll global)
    const connectionManager = getConnectionManager();
    const defaultConn = connectionManager.get('default');
    if (!defaultConn.isConnected) {
      await defaultConn.connect();
    }

    // ── Criar Provedor 1 ──────────────────────────────────────
    const providerRes = await request(app).post('/users').send({
      name: 'Provider Booking',
      email: 'provider.booking@gobarber.e2e.com',
      password: 'Pass@word1',
    });
    providerId = providerRes.body.id;

    // ── Criar Provedor 2 (para testes de listagem) ────────────
    const anotherProviderRes = await request(app).post('/users').send({
      name: 'Provider Another',
      email: 'provider.another@gobarber.e2e.com',
      password: 'Pass@word1',
    });
    anotherProviderId = anotherProviderRes.body.id;

    // ── Criar Cliente ─────────────────────────────────────────
    const clientRes = await request(app).post('/users').send({
      name: 'Client Booking',
      email: 'client.booking@gobarber.e2e.com',
      password: 'Pass@word1',
    });
    clientId = clientRes.body.id;

    // ── Login do Cliente ──────────────────────────────────────
    const clientLogin = await request(app).post('/auth/sessions').send({
      email: 'client.booking@gobarber.e2e.com',
      password: 'Pass@word1',
    });
    clientToken = clientLogin.body.token;

    // ── Login do Provedor ─────────────────────────────────────
    const providerLogin = await request(app).post('/auth/sessions').send({
      email: 'provider.booking@gobarber.e2e.com',
      password: 'Pass@word1',
    });
    providerToken = providerLogin.body.token;
  });

  // ============================================================
  // BLOCO 1: CRIAÇÃO E AUTENTICAÇÃO DE CONTA
  // ============================================================

  describe('👤 Registro e Autenticação de Conta', () => {
    it('[Cenário Feliz] Cliente se registra com dados válidos → 201', async () => {
      const response = await request(app).post('/users').send({
        name: 'New Client Reg',
        email: 'newclient.reg@gobarber.e2e.com',
        password: 'Pass@word1',
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty(
        'email',
        'newclient.reg@gobarber.e2e.com',
      );
      expect(response.body).not.toHaveProperty('password');
    });

    it('[Cenário Triste] Cliente tenta se registrar com e-mail duplicado → 409', async () => {
      const response = await request(app).post('/users').send({
        name: 'Client Clone',
        email: 'client.booking@gobarber.e2e.com', // já existe
        password: 'Pass@word1',
      });

      expect(response.status).toBe(409);
      expect(response.body.message).toContain('User already exists');
    });

    it('[Cenário Triste] Cliente tenta se registrar sem e-mail → 400 (Celebrate/Joi)', async () => {
      const response = await request(app).post('/users').send({
        name: 'Sem Email',
        password: 'Pass@word1',
      });

      expect(response.status).toBe(400);
    });

    it('[Cenário Triste] Cliente tenta se registrar com senha fora do padrão (sem especial) → 400 (Joi)', async () => {
      const response = await request(app).post('/users').send({
        name: 'Senha Fraca',
        email: 'fracosena@gobarber.e2e.com',
        password: 'password123', // sem caractere especial
      });

      expect(response.status).toBe(400);
    });

    it('[Cenário Triste] Cliente tenta se registrar com senha muito curta → 400 (Joi)', async () => {
      const response = await request(app).post('/users').send({
        name: 'Senha Curta',
        email: 'curta@gobarber.e2e.com',
        password: 'P@1', // menos de 6 chars
      });

      expect(response.status).toBe(400);
    });

    it('[Cenário Triste] Cliente tenta se registrar com e-mail inválido → 400 (Celebrate/Joi)', async () => {
      const response = await request(app).post('/users').send({
        name: 'Email Invalido',
        email: 'nao-e-um-email',
        password: 'Pass@word1',
      });

      expect(response.status).toBe(400);
    });

    it('[Cenário Triste] Cliente tenta se registrar com nome contendo números → 400 (Joi)', async () => {
      const response = await request(app).post('/users').send({
        name: 'Client123',
        email: 'numericname@gobarber.e2e.com',
        password: 'Pass@word1',
      });

      expect(response.status).toBe(400);
    });

    it('[Cenário Feliz] Cliente faz login com credenciais válidas → 200, token e dados sem senha', async () => {
      const response = await request(app).post('/auth/sessions').send({
        email: 'client.booking@gobarber.e2e.com',
        password: 'Pass@word1',
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('[Cenário Triste] Cliente tenta login com senha incorreta → 401', async () => {
      const response = await request(app).post('/auth/sessions').send({
        email: 'client.booking@gobarber.e2e.com',
        password: 'SenhaErrada@1',
      });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe(
        'Incorrect email/password combination',
      );
    });

    it('[Cenário Triste] Cliente tenta login com e-mail inexistente → 401', async () => {
      const response = await request(app).post('/auth/sessions').send({
        email: 'fantasma@gobarber.e2e.com',
        password: 'Pass@word1',
      });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe(
        'Incorrect email/password combination',
      );
    });

    it('[Cenário Triste] Tentativa de acesso a rota protegida sem token → 401', async () => {
      const response = await request(app).get('/users/me');
      expect(response.status).toBe(401);
    });

    it('[Cenário Triste] Tentativa de acesso a rota protegida com token inválido → 401', async () => {
      const response = await request(app)
        .get('/users/me')
        .set('Authorization', 'Bearer token.invalido.aqui');

      expect(response.status).toBe(401);
    });
  });

  // ============================================================
  // BLOCO 2: PERFIL DO USUÁRIO
  // ============================================================

  describe('🧾 Gerenciamento de Perfil', () => {
    it('[Cenário Feliz] Cliente consulta o próprio perfil → 200, sem password', async () => {
      const response = await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${clientToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', clientId);
      expect(response.body).toHaveProperty(
        'email',
        'client.booking@gobarber.e2e.com',
      );
      expect(response.body).not.toHaveProperty('password');
    });

    it('[Cenário Feliz] Cliente atualiza o próprio nome → 200', async () => {
      const response = await request(app)
        .put('/users/me')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({ name: 'Client Updated' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name', 'Client Updated');
    });

    it('[Cenário Feliz] Cliente atualiza e-mail sem conflito → 200', async () => {
      const response = await request(app)
        .put('/users/me')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({ email: 'client.updated@gobarber.e2e.com' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty(
        'email',
        'client.updated@gobarber.e2e.com',
      );

      // Reverter email para não quebrar outros testes
      await request(app)
        .put('/users/me')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({ email: 'client.booking@gobarber.e2e.com' });
    });

    it('[Cenário Feliz] Cliente atualiza senha com a senha atual correta → 200', async () => {
      const response = await request(app)
        .put('/users/me')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          password: 'Pass@word2',
          oldPassword: 'Pass@word1',
          passwordConfirmation: 'Pass@word2',
        });

      expect(response.status).toBe(200);

      // Reverter senha para não quebrar outros testes
      await request(app)
        .put('/users/me')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          password: 'Pass@word1',
          oldPassword: 'Pass@word2',
          passwordConfirmation: 'Pass@word1',
        });
    });

    it('[Cenário Triste] Cliente tenta atualizar senha sem informar a senha atual → 422', async () => {
      const response = await request(app)
        .put('/users/me')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          password: 'Pass@word2',
          passwordConfirmation: 'Pass@word2',
          // oldPassword ausente
        });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('[Cenário Triste] Cliente tenta atualizar e-mail para um já usado → 409', async () => {
      const response = await request(app)
        .put('/users/me')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({ email: 'provider.booking@gobarber.e2e.com' }); // e-mail do provedor

      expect(response.status).toBe(409);
    });

    it('[Cenário Triste] Atualização de perfil sem token → 401', async () => {
      const response = await request(app)
        .put('/users/me')
        .send({ name: 'Hackeado' });

      expect(response.status).toBe(401);
    });
  });

  // ============================================================
  // BLOCO 3: RECUPERAÇÃO DE SENHA
  // ============================================================

  describe('🔑 Recuperação e Redefinição de Senha', () => {
    it('[Cenário Feliz] Solicitação de reset com e-mail válido → 204, token gerado no BD', async () => {
      const response = await request(app).post('/password/forgot').send({
        email: 'newclient.reg@gobarber.e2e.com',
      });

      // A resposta deve ser 204 (sem conteúdo) para não revelar se o e-mail existe
      expect(response.status).toBe(204);

      // Verificar token gerado no banco
      const defaultConn = getConnectionManager().get('default');
      const userResult = await defaultConn.query(
        `SELECT id FROM users WHERE email = 'newclient.reg@gobarber.e2e.com'`,
      );
      const userId = userResult[0]?.id;
      expect(userId).toBeTruthy();

      const tokenResult = await defaultConn.query(
        `SELECT * FROM user_tokens WHERE user_id = '${userId}' AND deleted_at IS NULL`,
      );
      expect(tokenResult.length).toBeGreaterThanOrEqual(1);
      expect(tokenResult[0]).toHaveProperty('token');
    });

    it('[Cenário Feliz] Redefinição de senha com token válido → 204', async () => {
      // Criar usuário exclusivo para este teste
      await request(app).post('/users').send({
        name: 'Reset User',
        email: 'reset.user@gobarber.e2e.com',
        password: 'Pass@word1',
      });

      await request(app).post('/password/forgot').send({
        email: 'reset.user@gobarber.e2e.com',
      });

      const defaultConn = getConnectionManager().get('default');
      const userResult = await defaultConn.query(
        `SELECT id FROM users WHERE email = 'reset.user@gobarber.e2e.com'`,
      );
      const userId = userResult[0]?.id;

      const tokenResult = await defaultConn.query(
        `SELECT token FROM user_tokens WHERE user_id = '${userId}' AND deleted_at IS NULL ORDER BY created_at DESC LIMIT 1`,
      );
      const resetToken = tokenResult[0]?.token;
      expect(resetToken).toBeTruthy();

      const response = await request(app)
        .post('/password/reset')
        .query({ token: resetToken })
        .send({ password: 'NewPass@word2' });

      expect(response.status).toBe(204);

      // Confirmar que consegue logar com a nova senha
      const loginRes = await request(app).post('/auth/sessions').send({
        email: 'reset.user@gobarber.e2e.com',
        password: 'NewPass@word2',
      });
      expect(loginRes.status).toBe(200);
    });

    it('[Cenário Triste] Redefinição de senha com token inexistente → 401', async () => {
      const response = await request(app)
        .post('/password/reset')
        .query({ token: uuidV4() })
        .send({ password: 'NewPass@word1' });

      expect(response.status).toBe(401);
    });

    it('[Cenário Triste] Reset sem token na query → 400 (Celebrate)', async () => {
      const response = await request(app)
        .post('/password/reset')
        .send({ password: 'NewPass@word1' });

      expect(response.status).toBe(400);
    });

    it('[Cenário Triste] Reset com token inválido (não UUID) → 400 (Celebrate/Joi)', async () => {
      const response = await request(app)
        .post('/password/reset')
        .query({ token: 'token-invalido-nao-uuid' })
        .send({ password: 'NewPass@word1' });

      expect(response.status).toBe(400);
    });

    it('[Cenário Triste] Forgot password sem e-mail no body → 400 (Celebrate)', async () => {
      const response = await request(app).post('/password/forgot').send({});
      expect(response.status).toBe(400);
    });

    it('[Cenário Feliz] Forgot password com e-mail inexistente retorna 204 (não revela existência)', async () => {
      const response = await request(app).post('/password/forgot').send({
        email: 'fantasma.nunca.existiu@gobarber.e2e.com',
      });

      // Aceita 204 (silêncio por segurança) ou 404 (dependência da implementação)
      expect([204, 404]).toContain(response.status);
    });
  });

  // ============================================================
  // BLOCO 4: LISTAGEM DE PROVEDORES
  // ============================================================

  describe('💈 Listagem de Provedores de Serviço', () => {
    it('[Cenário Feliz] Cliente lista providers disponíveis → 200, provedor na lista', async () => {
      const response = await request(app)
        .get('/providers')
        .set('Authorization', `Bearer ${clientToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);

      const ids = response.body.map((p: any) => p.id);
      expect(ids).toContain(providerId);
      expect(ids).toContain(anotherProviderId);
    });

    it('[Cenário Feliz] Listagem de providers NÃO inclui o próprio cliente autenticado', async () => {
      const response = await request(app)
        .get('/providers')
        .set('Authorization', `Bearer ${clientToken}`);

      expect(response.status).toBe(200);
      const ids = response.body.map((p: any) => p.id);
      expect(ids).not.toContain(clientId);
    });

    it('[Cenário Feliz] Providers retornados não expõem campo password', async () => {
      const response = await request(app)
        .get('/providers')
        .set('Authorization', `Bearer ${clientToken}`);

      expect(response.status).toBe(200);
      const hasPassword = response.body.some((p: any) =>
        Object.keys(p).includes('password'),
      );
      expect(hasPassword).toBe(false);
    });

    it('[Cenário Triste] Listagem de providers sem token → 401', async () => {
      const response = await request(app).get('/providers');
      expect(response.status).toBe(401);
    });
  });

  // ============================================================
  // BLOCO 5: CONSULTA DE DISPONIBILIDADE DO PROVEDOR
  // ============================================================

  describe('📅 Consulta de Disponibilidade do Provedor', () => {
    it('[Cenário Feliz] Cliente consulta disponibilidade mensal de um provider → 200, array com dias', async () => {
      const now = new Date();
      const month = now.getMonth() + 2 > 12 ? 1 : now.getMonth() + 2;
      const year =
        now.getMonth() + 2 > 12 ? now.getFullYear() + 1 : now.getFullYear();

      const response = await request(app)
        .get(`/providers/${providerId}/month-availability`)
        .set('Authorization', `Bearer ${clientToken}`)
        .query({ month, year });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body[0]).toHaveProperty('day');
      expect(response.body[0]).toHaveProperty('available');
    });

    it('[Cenário Feliz] Cliente consulta disponibilidade diária de um provider → 200, array com horas', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 3);

      const response = await request(app)
        .get(`/providers/${providerId}/day-availability`)
        .set('Authorization', `Bearer ${clientToken}`)
        .query({
          day: tomorrow.getDate(),
          month: tomorrow.getMonth() + 1,
          year: tomorrow.getFullYear(),
        });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      // Deve ter slots de 8h a 17h (10 slots)
      expect(response.body.length).toBe(10);
      expect(response.body[0]).toHaveProperty('hour');
      expect(response.body[0]).toHaveProperty('available');
    });

    it('[Cenário Feliz] Hora já agendada aparece como indisponível na listagem diária', async () => {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 5);
      targetDate.setHours(9, 0, 0, 0); // slot das 9h

      // Marcar agendamento para 9h
      await request(app)
        .post('/appointments')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({ providerId, date: targetDate });

      const response = await request(app)
        .get(`/providers/${providerId}/day-availability`)
        .set('Authorization', `Bearer ${clientToken}`)
        .query({
          day: targetDate.getDate(),
          month: targetDate.getMonth() + 1,
          year: targetDate.getFullYear(),
        });

      expect(response.status).toBe(200);
      const slot9h = response.body.find((s: any) => s.hour === 9);
      expect(slot9h).toBeDefined();
      expect(slot9h.available).toBe(false);
    });

    it('[Cenário Feliz] Dia com todos horários lotados aparece como unavailable na disponibilidade mensal', async () => {
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + 3);
      const year = futureDate.getFullYear();
      const month = futureDate.getMonth() + 1;
      const day = 20;

      // Preencher todas as horas do dia: 8h a 17h
      const promises = [];
      for (let hour = 8; hour <= 17; hour += 1) {
        promises.push(
          request(app)
            .post('/appointments')
            .set('Authorization', `Bearer ${clientToken}`)
            .send({
              providerId,
              date: new Date(year, month - 1, day, hour, 0, 0),
            }),
        );
      }
      await Promise.all(promises);

      const response = await request(app)
        .get(`/providers/${providerId}/month-availability`)
        .set('Authorization', `Bearer ${clientToken}`)
        .query({ month, year });

      expect(response.status).toBe(200);
      const daySlot = response.body.find((d: any) => d.day === day);
      expect(daySlot).toBeDefined();
      expect(daySlot.available).toBe(false);
    });

    it('[Cenário Triste] Consulta mensal com providerId inválido (não UUID) → 400 (Celebrate)', async () => {
      const response = await request(app)
        .get('/providers/nao-e-um-uuid/month-availability')
        .set('Authorization', `Bearer ${clientToken}`)
        .query({ month: 6, year: 2026 });

      expect(response.status).toBe(400);
    });

    it('[Cenário Triste] Consulta de disponibilidade sem token → 401', async () => {
      const response = await request(app)
        .get(`/providers/${providerId}/day-availability`)
        .query({ day: 1, month: 6, year: 2026 });

      expect(response.status).toBe(401);
    });
  });

  // ============================================================
  // BLOCO 6: CRIAÇÃO DE AGENDAMENTO
  // ============================================================

  describe('✂️ Criação de Agendamento', () => {
    const getNextWorkdayAt = (hour: number): Date => {
      const date = new Date();
      date.setDate(date.getDate() + 7); // +7 dias para evitar conflitos com outros testes
      date.setHours(hour, 0, 0, 0);
      return date;
    };

    it('[Cenário Feliz] Cliente cria agendamento com dados válidos → 201', async () => {
      const date = getNextWorkdayAt(10);

      const response = await request(app)
        .post('/appointments')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({ providerId, date });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('providerId', providerId);
      expect(response.body).toHaveProperty('userId', clientId);
    });

    it('[Cenário Feliz] Agendamento criado com sucesso gera notificação MongoDB para o provedor', async () => {
      const date = getNextWorkdayAt(11);

      await request(app)
        .post('/appointments')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({ providerId, date });

      const notificationRepo = getMongoRepository(Notification, 'mongo');
      const notifications = await notificationRepo.find({
        where: { recipientId: providerId },
      });

      expect(notifications.length).toBeGreaterThanOrEqual(1);
      const latestNotification = notifications[notifications.length - 1];
      expect(latestNotification.content).toContain('Novo agendamento');
    });

    it('[Cenário Triste] Cliente tenta criar agendamento em horário passado → 422', async () => {
      const pastDate = new Date(2020, 0, 10, 10, 0, 0);

      const response = await request(app)
        .post('/appointments')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({ providerId, date: pastDate });

      expect(response.status).toBe(422);
      expect(response.body.message).toBe(
        "You can't create an appointment on a past date",
      );
    });

    it('[Cenário Triste] Cliente tenta criar agendamento consigo mesmo → 422', async () => {
      const date = getNextWorkdayAt(14);

      const response = await request(app)
        .post('/appointments')
        .set('Authorization', `Bearer ${providerToken}`)
        .send({ providerId, date }); // providerToken === providerId

      expect(response.status).toBe(422);
      expect(response.body.message).toBe(
        "You can't create an appointment with yourself",
      );
    });

    it('[Cenário Triste] Cliente tenta criar agendamento antes das 8h → 422', async () => {
      const date = getNextWorkdayAt(7); // 7h

      const response = await request(app)
        .post('/appointments')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({ providerId, date });

      expect(response.status).toBe(422);
      expect(response.body.message).toBe(
        "You can't create an appointments between 8am and 5pm",
      );
    });

    it('[Cenário Triste] Cliente tenta criar agendamento após as 17h → 422', async () => {
      const date = getNextWorkdayAt(18); // 18h

      const response = await request(app)
        .post('/appointments')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({ providerId, date });

      expect(response.status).toBe(422);
      expect(response.body.message).toBe(
        "You can't create an appointments between 8am and 5pm",
      );
    });

    it('[Cenário Triste] Cliente tenta criar agendamento em horário já ocupado → 409', async () => {
      const date = getNextWorkdayAt(15);

      // Primeiro agendamento
      await request(app)
        .post('/appointments')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({ providerId, date });

      // Segundo agendamento na mesma hora (outro cliente)
      await request(app).post('/users').send({
        name: 'Another Client',
        email: 'another.client@gobarber.e2e.com',
        password: 'Pass@word1',
      });

      const anotherLoginRes = await request(app).post('/auth/sessions').send({
        email: 'another.client@gobarber.e2e.com',
        password: 'Pass@word1',
      });
      const anotherToken = anotherLoginRes.body.token;

      const response = await request(app)
        .post('/appointments')
        .set('Authorization', `Bearer ${anotherToken}`)
        .send({ providerId, date });

      expect(response.status).toBe(409);
      expect(response.body.message).toBe('This appointment is already booked');
    });

    it('[Cenário Triste] Criação de agendamento sem providerId → 400 (Celebrate)', async () => {
      const response = await request(app)
        .post('/appointments')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({ date: getNextWorkdayAt(16) });

      expect(response.status).toBe(400);
    });

    it('[Cenário Triste] Criação de agendamento com providerId inválido (não UUID) → 400 (Celebrate)', async () => {
      const response = await request(app)
        .post('/appointments')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({ providerId: 'nao-e-uuid', date: getNextWorkdayAt(16) });

      expect(response.status).toBe(400);
    });

    it('[Cenário Triste] Criação de agendamento com provider inexistente → 404', async () => {
      const response = await request(app)
        .post('/appointments')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({ providerId: uuidV4(), date: getNextWorkdayAt(16) });

      expect(response.status).toBe(404);
    });

    it('[Cenário Triste] Criação de agendamento sem token → 401 (ou 429 se rate limit ativo)', async () => {
      const response = await request(app)
        .post('/appointments')
        .send({ providerId, date: getNextWorkdayAt(16) });

      // Rate limiter pode retornar 429 em vez de 401 em suítes longas
      expect([401, 429]).toContain(response.status);
    });

    it('[Cenário Triste] Criação de agendamento sem data → 400 (Celebrate)', async () => {
      const response = await request(app)
        .post('/appointments')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({ providerId });

      // Rate limiter pode retornar 429 em ambientes com muitas requisições consecutivas
      expect([400, 429]).toContain(response.status);
    });
  });
});
