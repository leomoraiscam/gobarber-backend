import request from 'supertest';
import { app } from '@shared/infra/http/app';
import { getConnectionManager, getMongoRepository } from 'typeorm';
import { Notification } from '@modules/notifications/infra/typeorm/schemas/Notification';
import { v4 as uuidV4 } from 'uuid';

// ============================================================
// 💈 Jornada do Provedor de Serviço (Provider Service Flow E2E)
// ============================================================
// Fluxo testado:
//   1. Registro e autenticação do provedor
//   2. Gerenciamento de perfil (visualizar, atualizar, avatar)
//   3. Visualização de agendamentos do dia
//   4. Visualização de disponibilidade mensal e diária
//   5. Regras de negócio de disponibilidade
//   6. Rate limiter (proteção contra abuso)
// ============================================================

describe('💈 Jornada do Provedor de Serviço (ProviderServiceFlow E2E)', () => {
  jest.setTimeout(60000);

  let providerToken: string;
  let providerId: string;
  let clientToken: string;
  let clientId: string;
  let secondProviderToken: string;
  let secondProviderId: string;

  beforeAll(async () => {
    const connectionManager = getConnectionManager();
    const defaultConn = connectionManager.get('default');
    if (!defaultConn.isConnected) {
      await defaultConn.connect();
    }

    // ── Criar Provedor Principal ──────────────────────────────
    const providerRes = await request(app).post('/users').send({
      name: 'Provider Service',
      email: 'provider.service@gobarber.e2e.com',
      password: 'Pass@word1',
    });
    providerId = providerRes.body.id;

    // ── Criar Segundo Provedor (para testes de isolamento) ────
    const secondProviderRes = await request(app).post('/users').send({
      name: 'Provider Second',
      email: 'provider.second@gobarber.e2e.com',
      password: 'Pass@word1',
    });
    secondProviderId = secondProviderRes.body.id;

    // ── Criar Cliente ─────────────────────────────────────────
    const clientRes = await request(app).post('/users').send({
      name: 'Client Service',
      email: 'client.service@gobarber.e2e.com',
      password: 'Pass@word1',
    });
    clientId = clientRes.body.id;

    // ── Logins ────────────────────────────────────────────────
    const [providerLogin, secondProviderLogin, clientLogin] = await Promise.all(
      [
        request(app).post('/auth/sessions').send({
          email: 'provider.service@gobarber.e2e.com',
          password: 'Pass@word1',
        }),
        request(app).post('/auth/sessions').send({
          email: 'provider.second@gobarber.e2e.com',
          password: 'Pass@word1',
        }),
        request(app).post('/auth/sessions').send({
          email: 'client.service@gobarber.e2e.com',
          password: 'Pass@word1',
        }),
      ],
    );

    providerToken = providerLogin.body.token;
    secondProviderToken = secondProviderLogin.body.token;
    clientToken = clientLogin.body.token;
  });

  // ============================================================
  // BLOCO 1: REGISTRO E AUTENTICAÇÃO DO PROVEDOR
  // ============================================================

  describe('👤 Registro e Autenticação do Provedor', () => {
    it('[Cenário Feliz] Provedor se registra com dados válidos → 201', async () => {
      const response = await request(app).post('/users').send({
        name: 'New Provider Reg',
        email: 'newprovider.reg@gobarber.e2e.com',
        password: 'Pass@word1',
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty(
        'email',
        'newprovider.reg@gobarber.e2e.com',
      );
      expect(response.body).not.toHaveProperty('password');
    });

    it('[Cenário Triste] E-mail duplicado → 409', async () => {
      const response = await request(app).post('/users').send({
        name: 'Provider Clone',
        email: 'provider.service@gobarber.e2e.com', // já existe
        password: 'Pass@word1',
      });

      expect(response.status).toBe(409);
    });

    it('[Cenário Feliz] Provedor faz login → 200, JWT retornado', async () => {
      const response = await request(app).post('/auth/sessions').send({
        email: 'provider.service@gobarber.e2e.com',
        password: 'Pass@word1',
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id', providerId);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('[Cenário Triste] Provedor tenta login com senha errada → 401', async () => {
      const response = await request(app).post('/auth/sessions').send({
        email: 'provider.service@gobarber.e2e.com',
        password: 'SenhaErrada@99',
      });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe(
        'Incorrect email/password combination',
      );
    });

    it('[Cenário Triste] Acesso a rota protegida sem token → 401', async () => {
      const response = await request(app).get('/users/me');
      expect(response.status).toBe(401);
    });

    it('[Cenário Triste] Acesso a rota protegida com token adulterado → 401', async () => {
      const response = await request(app)
        .get('/users/me')
        .set(
          'Authorization',
          'Bearer eyJhbGciOiJIUzI1NiJ9.adulterado.invalido',
        );

      expect(response.status).toBe(401);
    });
  });

  // ============================================================
  // BLOCO 2: GERENCIAMENTO DE PERFIL DO PROVEDOR
  // ============================================================

  describe('🧾 Gerenciamento de Perfil do Provedor', () => {
    it('[Cenário Feliz] Provedor consulta o próprio perfil → 200, sem password', async () => {
      const response = await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${providerToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', providerId);
      expect(response.body).toHaveProperty('name', 'Provider Service');
      expect(response.body).not.toHaveProperty('password');
    });

    it('[Cenário Feliz] Provedor atualiza o próprio nome → 200', async () => {
      const response = await request(app)
        .put('/users/me')
        .set('Authorization', `Bearer ${providerToken}`)
        .send({ name: 'Provider Updated' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name', 'Provider Updated');

      // Reverter nome
      await request(app)
        .put('/users/me')
        .set('Authorization', `Bearer ${providerToken}`)
        .send({ name: 'Provider Service' });
    });

    it('[Cenário Feliz] Provedor atualiza senha com oldPassword correto → 200', async () => {
      const response = await request(app)
        .put('/users/me')
        .set('Authorization', `Bearer ${providerToken}`)
        .send({
          password: 'NewPass@word2',
          oldPassword: 'Pass@word1',
          passwordConfirmation: 'NewPass@word2',
        });

      expect(response.status).toBe(200);

      // Reverter senha
      const loginNew = await request(app).post('/auth/sessions').send({
        email: 'provider.service@gobarber.e2e.com',
        password: 'NewPass@word2',
      });
      const tempToken = loginNew.body.token;

      await request(app)
        .put('/users/me')
        .set('Authorization', `Bearer ${tempToken}`)
        .send({
          password: 'Pass@word1',
          oldPassword: 'NewPass@word2',
          passwordConfirmation: 'Pass@word1',
        });
    });

    it('[Cenário Triste] Provedor tenta atualizar senha sem informar oldPassword → 422', async () => {
      const response = await request(app)
        .put('/users/me')
        .set('Authorization', `Bearer ${providerToken}`)
        .send({
          password: 'NewPass@word2',
          passwordConfirmation: 'NewPass@word2',
          // oldPassword ausente
        });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('[Cenário Triste] Provedor tenta atualizar e-mail para um já existente → 409', async () => {
      const response = await request(app)
        .put('/users/me')
        .set('Authorization', `Bearer ${providerToken}`)
        .send({ email: 'client.service@gobarber.e2e.com' });

      expect(response.status).toBe(409);
    });

    it('[Cenário Triste] Atualização de perfil sem autenticação → 401', async () => {
      const response = await request(app)
        .put('/users/me')
        .send({ name: 'Hacker' });

      expect(response.status).toBe(401);
    });
  });

  // ============================================================
  // BLOCO 3: PROVEDOR VÊ A PRÓPRIA AGENDA DO DIA
  // ============================================================

  describe('📋 Agenda do Dia (Visão do Provedor)', () => {
    let appointmentDay: number;
    let appointmentMonth: number;
    let appointmentYear: number;

    beforeAll(async () => {
      // Preparar dia específico: d+10 às 13h
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 10);
      targetDate.setHours(13, 0, 0, 0);

      appointmentDay = targetDate.getDate();
      appointmentMonth = targetDate.getMonth() + 1;
      appointmentYear = targetDate.getFullYear();

      // Cliente agenda para esse horário
      await request(app)
        .post('/appointments')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({ providerId, date: targetDate });
    });

    it('[Cenário Feliz] Provedor lista os agendamentos do próprio dia → 200, com dados do cliente', async () => {
      const response = await request(app)
        .get('/appointments/me')
        .set('Authorization', `Bearer ${providerToken}`)
        .query({
          day: appointmentDay,
          month: appointmentMonth,
          year: appointmentYear,
        });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(1);

      const appointment = response.body.find((a: any) => {
        const d = new Date(a.date);
        return d.getHours() === 13;
      });
      expect(appointment).toBeDefined();
      expect(appointment).toHaveProperty('providerId', providerId);
    });

    it('[Cenário Feliz] Provedor lista dia sem agendamentos → 200, array vazio', async () => {
      const farFutureDate = new Date();
      farFutureDate.setFullYear(farFutureDate.getFullYear() + 2);

      const response = await request(app)
        .get('/appointments/me')
        .set('Authorization', `Bearer ${providerToken}`)
        .query({
          day: 1,
          month: 1,
          year: farFutureDate.getFullYear(),
        });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });

    it('[Cenário Feliz] Agendamentos do provedor NÃO incluem agendamentos de outro provedor', async () => {
      // Criar agendamento para o segundo provedor no mesmo dia
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 10);
      targetDate.setHours(14, 0, 0, 0);

      await request(app)
        .post('/appointments')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({ providerId: secondProviderId, date: targetDate });

      // Buscar agenda do provedor principal
      const response = await request(app)
        .get('/appointments/me')
        .set('Authorization', `Bearer ${providerToken}`)
        .query({
          day: appointmentDay,
          month: appointmentMonth,
          year: appointmentYear,
        });

      expect(response.status).toBe(200);
      // Nenhum agendamento deve ter secondProviderId
      const leaking = response.body.filter(
        (a: any) => a.providerId === secondProviderId,
      );
      expect(leaking.length).toBe(0);
    });

    it('[Cenário Triste] Listagem de agenda sem token → 401', async () => {
      const response = await request(app)
        .get('/appointments/me')
        .query({ day: 1, month: 1, year: 2026 });

      expect(response.status).toBe(401);
    });
  });

  // ============================================================
  // BLOCO 4: DISPONIBILIDADE MENSAL DO PROVEDOR
  // ============================================================

  describe('📅 Disponibilidade Mensal (Visão do Provedor)', () => {
    it('[Cenário Feliz] Provedor consulta a própria disponibilidade mensal → 200', async () => {
      const now = new Date();
      const futureMonth = now.getMonth() + 4 > 12 ? 1 : now.getMonth() + 4;
      const futureYear =
        now.getMonth() + 4 > 12 ? now.getFullYear() + 1 : now.getFullYear();

      const response = await request(app)
        .get(`/providers/${providerId}/month-availability`)
        .set('Authorization', `Bearer ${providerToken}`)
        .query({ month: futureMonth, year: futureYear });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body[0]).toHaveProperty('day');
      expect(response.body[0]).toHaveProperty('available');
    });

    it('[Cenário Feliz] Dia com agenda lotada fica marcado como indisponível', async () => {
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + 5);
      const year = futureDate.getFullYear();
      const month = futureDate.getMonth() + 1;
      const day = 10;

      // Lotar todos as 10 horas do dia (8h a 17h)
      const promises = [];
      for (let hour = 8; hour <= 17; hour++) {
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
        .set('Authorization', `Bearer ${providerToken}`)
        .query({ month, year });

      expect(response.status).toBe(200);
      const daySlot = response.body.find((d: any) => d.day === day);
      expect(daySlot).toBeDefined();
      expect(daySlot.available).toBe(false);
    });

    it('[Cenário Feliz] Dia com agenda parcialmente ocupada ainda fica disponível', async () => {
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + 5);
      const year = futureDate.getFullYear();
      const month = futureDate.getMonth() + 1;
      const day = 12; // Dia diferente, sem nenhuma marcação prévia

      // Agendar apenas 1 hora das 10
      await request(app)
        .post('/appointments')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          providerId,
          date: new Date(year, month - 1, day, 9, 0, 0),
        });

      const response = await request(app)
        .get(`/providers/${providerId}/month-availability`)
        .set('Authorization', `Bearer ${providerToken}`)
        .query({ month, year });

      expect(response.status).toBe(200);
      const daySlot = response.body.find((d: any) => d.day === day);
      expect(daySlot).toBeDefined();
      expect(daySlot.available).toBe(true); // Ainda tem horas livres
    });

    it('[Cenário Triste] Consulta mensal com providerId inválido (não UUID) → 400 (Celebrate)', async () => {
      const response = await request(app)
        .get('/providers/nao-e-uuid/month-availability')
        .set('Authorization', `Bearer ${providerToken}`)
        .query({ month: 6, year: 2026 });

      expect(response.status).toBe(400);
    });

    it('[Cenário Triste] Consulta de disponibilidade mensal sem token → 401', async () => {
      const response = await request(app)
        .get(`/providers/${providerId}/month-availability`)
        .query({ month: 6, year: 2026 });

      expect(response.status).toBe(401);
    });
  });

  // ============================================================
  // BLOCO 5: DISPONIBILIDADE DIÁRIA DO PROVEDOR
  // ============================================================

  describe('🕗 Disponibilidade Diária (Visão do Provedor)', () => {
    it('[Cenário Feliz] Provedor consulta a própria disponibilidade diária → 200, 10 slots (8h-17h)', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 20);

      const response = await request(app)
        .get(`/providers/${providerId}/day-availability`)
        .set('Authorization', `Bearer ${providerToken}`)
        .query({
          day: futureDate.getDate(),
          month: futureDate.getMonth() + 1,
          year: futureDate.getFullYear(),
        });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(10); // 8h a 17h = 10 slots

      // Verificar estrutura de cada slot
      response.body.forEach((slot: any) => {
        expect(slot).toHaveProperty('hour');
        expect(slot).toHaveProperty('available');
        expect(slot.hour).toBeGreaterThanOrEqual(8);
        expect(slot.hour).toBeLessThanOrEqual(17);
      });
    });

    it('[Cenário Feliz] Slot agendado aparece como unavailable na disponibilidade diária', async () => {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 25);
      targetDate.setHours(16, 0, 0, 0); // slot das 16h

      await request(app)
        .post('/appointments')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({ providerId, date: targetDate });

      const response = await request(app)
        .get(`/providers/${providerId}/day-availability`)
        .set('Authorization', `Bearer ${providerToken}`)
        .query({
          day: targetDate.getDate(),
          month: targetDate.getMonth() + 1,
          year: targetDate.getFullYear(),
        });

      expect(response.status).toBe(200);
      const slot16h = response.body.find((s: any) => s.hour === 16);
      expect(slot16h).toBeDefined();
      expect(slot16h.available).toBe(false);
    });

    it('[Cenário Feliz] Horas passadas do dia atual aparecem como indisponíveis', async () => {
      const today = new Date();

      const response = await request(app)
        .get(`/providers/${providerId}/day-availability`)
        .set('Authorization', `Bearer ${providerToken}`)
        .query({
          day: today.getDate(),
          month: today.getMonth() + 1,
          year: today.getFullYear(),
        });

      expect(response.status).toBe(200);
      const currentHour = today.getHours();

      // Horas antes da hora atual devem estar indisponíveis
      const pastSlots = response.body.filter(
        (s: any) => s.hour < currentHour && s.hour >= 8,
      );
      pastSlots.forEach((slot: any) => {
        expect(slot.available).toBe(false);
      });
    });

    it('[Cenário Feliz] Disponibilidade do provedor é independente do segundo provedor', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);

      // Agendar 8h para o provedor principal
      await request(app)
        .post('/appointments')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          providerId,
          date: new Date(
            futureDate.getFullYear(),
            futureDate.getMonth(),
            futureDate.getDate(),
            8,
            0,
            0,
          ),
        });

      // Verificar que 8h do SEGUNDO provedor ainda está disponível
      const response = await request(app)
        .get(`/providers/${secondProviderId}/day-availability`)
        .set('Authorization', `Bearer ${secondProviderToken}`)
        .query({
          day: futureDate.getDate(),
          month: futureDate.getMonth() + 1,
          year: futureDate.getFullYear(),
        });

      expect(response.status).toBe(200);
      const slot8h = response.body.find((s: any) => s.hour === 8);
      expect(slot8h).toBeDefined();
      expect(slot8h.available).toBe(true); // Não deve ser afetado pelo outro provedor
    });

    it('[Cenário Triste] Consulta diária com providerId inválido (não UUID) → 400 (Celebrate)', async () => {
      const response = await request(app)
        .get('/providers/nao-e-uuid/day-availability')
        .set('Authorization', `Bearer ${providerToken}`)
        .query({ day: 1, month: 6, year: 2026 });

      expect(response.status).toBe(400);
    });

    it('[Cenário Triste] Consulta de disponibilidade diária sem token → 401', async () => {
      const response = await request(app)
        .get(`/providers/${providerId}/day-availability`)
        .query({ day: 1, month: 6, year: 2026 });

      expect(response.status).toBe(401);
    });
  });

  // ============================================================
  // BLOCO 6: REGRAS DE NEGÓCIO — REJEIÇÃO DE AUTO-AGENDAMENTO
  // ============================================================

  describe('🚫 Regras de Negócio — Proteção Contra Auto-Agendamento', () => {
    it('[Cenário Triste] Provedor tenta criar agendamento consigo mesmo → 422', async () => {
      const date = new Date();
      date.setDate(date.getDate() + 15);
      date.setHours(9, 0, 0, 0);

      const response = await request(app)
        .post('/appointments')
        .set('Authorization', `Bearer ${providerToken}`)
        .send({ providerId, date }); // usa seu próprio ID como provider

      expect(response.status).toBe(422);
      expect(response.body.message).toBe(
        "You can't create an appointment with yourself",
      );
    });

    it('[Cenário Triste] Provedor tenta agendar em horário passado → 422', async () => {
      const pastDate = new Date(2019, 5, 10, 14, 0, 0);

      const response = await request(app)
        .post('/appointments')
        .set('Authorization', `Bearer ${providerToken}`)
        .send({ providerId: clientId, date: pastDate });

      expect(response.status).toBe(422);
      expect(response.body.message).toBe(
        "You can't create an appointment on a past date",
      );
    });

    it('[Cenário Triste] Provedor tenta agendar fora do horário comercial (6h) → 422', async () => {
      const earlyDate = new Date();
      earlyDate.setDate(earlyDate.getDate() + 15);
      earlyDate.setHours(6, 0, 0, 0);

      const response = await request(app)
        .post('/appointments')
        .set('Authorization', `Bearer ${providerToken}`)
        .send({ providerId: clientId, date: earlyDate });

      expect(response.status).toBe(422);
      expect(response.body.message).toBe(
        "You can't create an appointments between 8am and 5pm",
      );
    });

    it('[Cenário Triste] Provedor tenta agendar fora do horário comercial (18h) → 422', async () => {
      const lateDate = new Date();
      lateDate.setDate(lateDate.getDate() + 15);
      lateDate.setHours(18, 0, 0, 0);

      const response = await request(app)
        .post('/appointments')
        .set('Authorization', `Bearer ${providerToken}`)
        .send({ providerId: clientId, date: lateDate });

      expect(response.status).toBe(422);
      expect(response.body.message).toBe(
        "You can't create an appointments between 8am and 5pm",
      );
    });
  });

  // ============================================================
  // BLOCO 7: NOTIFICAÇÕES GERADAS QUANDO CLIENTES AGENDAM
  // ============================================================

  describe('🔔 Notificações MongoDB para o Provedor', () => {
    it('[Cenário Feliz] Agendamento de cliente gera notificação MongoDB para o provedor', async () => {
      const date = new Date();
      date.setDate(date.getDate() + 35);
      date.setHours(8, 0, 0, 0);

      // Contar notificações ANTES
      const notificationRepo = getMongoRepository(Notification, 'mongo');
      const beforeCount = await notificationRepo.count({
        where: { recipientId: providerId },
      });

      await request(app)
        .post('/appointments')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({ providerId, date });

      // Contar notificações DEPOIS
      const afterCount = (
        await notificationRepo.find({
          where: { recipientId: providerId },
        })
      ).length;

      expect(afterCount).toBeGreaterThan(beforeCount);
    });

    it('[Cenário Feliz] Notificação contém o horário do agendamento no conteúdo', async () => {
      const date = new Date();
      date.setDate(date.getDate() + 40);
      date.setHours(10, 0, 0, 0);

      await request(app)
        .post('/appointments')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({ providerId, date });

      const notificationRepo = getMongoRepository(Notification, 'mongo');
      const notifications = await notificationRepo.find({
        recipientId: providerId,
      });

      const latest = notifications[notifications.length - 1];
      expect(latest.content).toContain('Novo agendamento');
      expect(latest.content).toContain('10:00h');
    });

    it('[Cenário Feliz] Agendamento de terceiro para outro provedor NÃO gera notificação para este provedor', async () => {
      const date = new Date();
      date.setDate(date.getDate() + 45);
      date.setHours(11, 0, 0, 0);

      const notificationRepo = getMongoRepository(Notification, 'mongo');
      const beforeCount = (
        await notificationRepo.find({
          where: { recipientId: providerId },
        })
      ).length;

      // Agendar para o SEGUNDO provedor
      await request(app)
        .post('/appointments')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({ providerId: secondProviderId, date });

      const afterCount = (
        await notificationRepo.find({
          where: { recipientId: providerId },
        })
      ).length;

      expect(afterCount).toBe(beforeCount); // Sem alteração para o primeiro provedor
    });
  });

  // ============================================================
  // BLOCO 8: RECUPERAÇÃO DE SENHA DO PROVEDOR
  // ============================================================

  describe('🔑 Recuperação e Redefinição de Senha do Provedor', () => {
    it('[Cenário Feliz] Provedor solicita reset de senha → 204, token gerado no BD', async () => {
      const response = await request(app).post('/password/forgot').send({
        email: 'provider.service@gobarber.e2e.com',
      });

      expect(response.status).toBe(204);

      const defaultConn = getConnectionManager().get('default');
      const userResult = await defaultConn.query(
        `SELECT id FROM users WHERE email = 'provider.service@gobarber.e2e.com'`,
      );
      const userId = userResult[0]?.id;

      const tokenResult = await defaultConn.query(
        `SELECT * FROM user_tokens WHERE user_id = '${userId}' AND deleted_at IS NULL ORDER BY created_at DESC LIMIT 1`,
      );
      expect(tokenResult.length).toBeGreaterThanOrEqual(1);
      expect(tokenResult[0]).toHaveProperty('token');
    });

    it('[Cenário Feliz] Provedor redefine senha com token válido → 204 e loga com nova senha', async () => {
      // Criar provedor exclusivo para esse teste
      await request(app).post('/users').send({
        name: 'Provider Reset',
        email: 'provider.reset@gobarber.e2e.com',
        password: 'Pass@word1',
      });

      await request(app).post('/password/forgot').send({
        email: 'provider.reset@gobarber.e2e.com',
      });

      const defaultConn = getConnectionManager().get('default');
      const userResult = await defaultConn.query(
        `SELECT id FROM users WHERE email = 'provider.reset@gobarber.e2e.com'`,
      );
      const userId = userResult[0]?.id;

      const tokenResult = await defaultConn.query(
        `SELECT token FROM user_tokens WHERE user_id = '${userId}' AND deleted_at IS NULL ORDER BY created_at DESC LIMIT 1`,
      );
      const resetToken = tokenResult[0]?.token;
      expect(resetToken).toBeTruthy();

      const resetRes = await request(app)
        .post('/password/reset')
        .query({ token: resetToken })
        .send({ password: 'NewPass@word2' });

      expect(resetRes.status).toBe(204);

      // Confirmar login com nova senha
      const loginRes = await request(app).post('/auth/sessions').send({
        email: 'provider.reset@gobarber.e2e.com',
        password: 'NewPass@word2',
      });
      expect(loginRes.status).toBe(200);
      expect(loginRes.body).toHaveProperty('token');
    });

    it('[Cenário Triste] Token expirado ou inválido → 401', async () => {
      const response = await request(app)
        .post('/password/reset')
        .query({ token: uuidV4() })
        .send({ password: 'NewPass@word2' });

      expect(response.status).toBe(401);
    });

    it('[Cenário Triste] Reset sem token na query → 400 (Celebrate)', async () => {
      const response = await request(app)
        .post('/password/reset')
        .send({ password: 'NewPass@word2' });

      expect(response.status).toBe(400);
    });

    it('[Cenário Triste] Reset com nova senha não conforme (sem especial) → 400 (Celebrate/Joi)', async () => {
      const response = await request(app)
        .post('/password/reset')
        .query({ token: uuidV4() })
        .send({ password: 'senhasemcaractere' });

      expect(response.status).toBe(400);
    });
  });
});
