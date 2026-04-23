<h1 align="center">
  <img src="./assets/logo.svg" alt="GoBarber Logo" width="200px">
</h1>

## 📝 Índice

- [📌 Introdução](#introdução)
- [🧐 Sobre](#sobre)
- [🏗️ Arquitetura](#arquitetura)
- [🗂️ Estrutura do Projeto](#estrutura-do-projeto)
- [🏁 Começando](#começando-)
  - [Pré-requisitos](#pré-requisitos)
  - [Instalando](#instalando)
- [🎈 Uso](#uso)
- [🧪 Testes](#testes)
- [📑 Documentação da API](#documentação-da-api)
- [📝 Licença](#licença)

## 📌 Introdução <a name = "introdução"></a>

A API do **GoBarber** é uma aplicação robusta de backend responsável por gerenciar o fluxo completo de agendamentos entre clientes e prestadores de serviços. O sistema controla desde a autenticação e perfis de usuários até a disponibilidade de horários e notificações em tempo real.

Principais recursos:

- Autenticação JWT e recuperação de senha segura.
- Gestão de prestadores e listagem de horários disponíveis.
- Agendamento com validação de regras de negócio.
- Notificações instantâneas e cache de alto desempenho.

## 🧐 Sobre <a name = "sobre"></a>

A API é desenvolvida com **Node.js** e **TypeScript**, utilizando **Express** como framework base.

A arquitetura foi pensada para escalabilidade e manutenção, utilizando:

- **Persistência**: PostgreSQL (TypeORM), MongoDB (Notificações) e Redis (Cache).
- **Injeção de Dependência**: tsyringe para desacoplamento de serviços.
- **Segurança**: Rate limiting e validação rigorosa de dados (Celebrate/Joi).

## 🏗️ Arquitetura <a name = "arquitetura"></a>

O projeto segue uma **Arquitetura Modular** baseada em princípios de **DDD (Domain Driven Design)** e **Clean Architecture**, garantindo que as regras de negócio sejam independentes de ferramentas externas.

## 🗂️ Estrutura do Projeto <a name = "estrutura-do-projeto"></a>

A organização de pastas isola a infraestrutura do domínio da aplicação:

```text
src/
├── @types/              # Definições de tipos globais
├── config/              # Configurações (auth, upload, mail, cache)
├── modules/             # Módulos de domínio da aplicação (Appointments, Users, etc)
│   ├── [modulo]/
│   │   ├── dtos/        # Data Transfer Objects
│   │   ├── infra/       # Implementações específicas (TypeORM e HTTP)
│   │   ├── repositories/# Interfaces dos repositórios
│   │   │   └── fakes/   # Mocks para testes unitários
│   │   └── services/    # Regras de negócio core
├── shared/              # Código compartilhado entre módulos
│   ├── container/       # Configuração de Injeção de Dependência
│   ├── errors/          # Classes de erro personalizadas (AppError)
│   ├── infra/           # Infraestrutura global e conexão com bancos
│   └── providers/       # Provedores de serviços externos (Mail, Storage, Cache)
```

## 🏁 Começando <a name = "começando"></a>

### Pré-requisitos

- **Node.js** v14+
- **Docker** & **Docker Compose**
- **Yarn** ou **NPM**

### Instalando

1. Clone o repositório:

```bash
git clone https://github.com/leomoraiscam/gobarber-backend.git
cd gobarber-backend
```

2. Instale as dependências:

```bash
yarn install
```

3. Configure as variáveis de ambiente:

```bash
cp .env.example .env
```

4. Suba os containers de banco de dados:

```bash
docker-compose up -d
```

5. Execute as migrações:

```bash
yarn typeorm migration:run
```

## 🎈 Uso <a name="uso"></a>

Inicie o servidor em ambiente de desenvolvimento:

```bash
yarn dev:server
```

O servidor será iniciado em `http://localhost:3333`.

## 🧪 Testes <a name = "testes"></a>

O projeto possui uma suite completa de testes unitários focada nos serviços e regras de negócio:

```bash
# Executar todos os testes
yarn test

# Executar testes em modo watch
yarn test --watch
```

## 📑 Documentação da API <a name = "documentação-da-api"></a>

A documentação detalhada dos endpoints está disponível através do Swagger:
`http://localhost:3333/api-docs`

## 📝 Licença <a name = "licença"></a>

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
