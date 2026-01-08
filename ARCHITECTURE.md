# Arquitetura da API - Climb Bookings

## 📐 Visão Geral

Esta API segue os princípios de **Clean Architecture** e **Domain-Driven Design (DDD)**, garantindo:

- ✅ Separação clara de responsabilidades
- ✅ Testabilidade
- ✅ Independência de frameworks e infraestrutura
- ✅ Regras de negócio encapsuladas no domínio
- ✅ Facilidade de manutenção e evolução

## 🏗️ Camadas da Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                  PRESENTATION LAYER                      │
│  (Controllers, DTOs de Request/Response, Gateways)       │
└───────────────────┬─────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────┐
│                  APPLICATION LAYER                       │
│         (Use Cases, DTOs, Application Services)          │
└───────────────────┬─────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────┐
│                   DOMAIN LAYER                           │
│  (Entities, Value Objects, Domain Services, Interfaces)  │
└───────────────────┬─────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────┐
│                 INFRASTRUCTURE LAYER                     │
│    (Repositories, External Services, Database, Cache)    │
└─────────────────────────────────────────────────────────┘
```

## 📁 Estrutura de Diretórios

```
src/
├── common/                    # Recursos compartilhados
│   ├── decorators/           # Decorators customizados (@CurrentUser, @Public)
│   ├── filters/              # Exception filters (HTTP error handling)
│   ├── guards/               # Guards de autenticação e autorização
│   ├── interceptors/         # Interceptors (Logging, Transform)
│   ├── pipes/                # Pipes de validação e transformação
│   ├── exceptions/           # Exceções customizadas de domínio
│   └── constants/            # Constantes da aplicação
│
├── config/                    # Configurações
│   ├── database.config.ts
│   ├── redis.config.ts
│   └── app.config.ts
│
├── infrastructure/           # Camada de Infraestrutura
│   ├── database/
│   │   └── supabase/
│   │       ├── supabase.service.ts
│   │       └── repositories/  # Implementações concretas dos repositórios
│   │           ├── booking.repository.ts
│   │           ├── club.repository.ts
│   │           └── court.repository.ts
│   ├── cache/
│   │   └── redis/
│   │       └── redis.service.ts
│   ├── messaging/
│   │   ├── websocket/
│   │   └── push-notifications/
│   └── external-apis/
│
├── domain/                   # Camada de Domínio
│   ├── bookings/
│   │   ├── entities/         # Entidades com regras de negócio
│   │   │   └── booking.entity.ts
│   │   ├── repositories/     # Interfaces dos repositórios
│   │   │   └── booking.repository.interface.ts
│   │   ├── services/         # Domain services (lógica complexa)
│   │   └── value-objects/    # Value Objects (TimeSlot, DateRange)
│   │       ├── time-slot.vo.ts
│   │       └── date-range.vo.ts
│   ├── clubs/
│   │   ├── entities/
│   │   │   └── club.entity.ts
│   │   ├── repositories/
│   │   │   └── club.repository.interface.ts
│   │   └── value-objects/
│   │       └── location.vo.ts
│   ├── courts/
│   │   ├── entities/
│   │   │   └── court.entity.ts
│   │   └── repositories/
│   │       └── court.repository.interface.ts
│   └── auctions/
│       ├── entities/
│       │   └── auction.entity.ts
│       └── repositories/
│           └── auction.repository.interface.ts
│
├── application/             # Camada de Aplicação
│   ├── bookings/
│   │   ├── use-cases/       # Casos de uso (orquestração)
│   │   │   ├── create-booking.use-case.ts
│   │   │   └── check-availability.use-case.ts
│   │   └── dto/             # DTOs de entrada
│   │       ├── create-booking.dto.ts
│   │       └── check-availability.dto.ts
│   ├── clubs/
│   │   ├── use-cases/
│   │   │   ├── create-club.use-case.ts
│   │   │   └── list-clubs.use-case.ts
│   │   └── dto/
│   │       └── create-club.dto.ts
│   └── courts/
│       ├── use-cases/
│       │   └── add-court-to-club.use-case.ts
│       └── dto/
│           └── create-court.dto.ts
│
└── presentation/            # Camada de Apresentação
    ├── http/                # Controllers HTTP
    │   ├── bookings/
    │   │   ├── bookings.controller.ts
    │   │   └── bookings.module.ts
    │   ├── clubs/
    │   │   ├── clubs.controller.ts
    │   │   └── clubs.module.ts
    │   └── courts/
    │       ├── courts.controller.ts
    │       └── courts.module.ts
    └── websocket/           # WebSocket Gateways
```

## 🎯 Responsabilidades de Cada Camada

### 1. Domain Layer (Domínio)

**Responsabilidade:** Contém a lógica de negócio pura e as regras fundamentais da aplicação.

**Componentes:**
- **Entities:** Objetos com identidade única e ciclo de vida (Court, Club, Booking)
- **Value Objects:** Objetos imutáveis sem identidade (TimeSlot, DateRange, Location)
- **Repository Interfaces:** Contratos para persistência (não implementações)
- **Domain Services:** Lógica de negócio que não pertence a uma entidade específica

**Exemplo - Court Entity:**
```typescript
export class Court {
  // Regras de negócio encapsuladas
  canBeBooked(): boolean {
    return this._isActive;
  }

  updatePrice(price: number): void {
    if (price < 0) {
      throw new ValidationException('Price cannot be negative');
    }
    this._basePrice = price;
  }
}
```

### 2. Application Layer (Aplicação)

**Responsabilidade:** Orquestra os casos de uso da aplicação.

**Componentes:**
- **Use Cases:** Implementam casos de uso específicos (CreateBookingUseCase)
- **DTOs:** Definem contratos de entrada/saída
- **Application Services:** Coordenam entidades e serviços de domínio

**Exemplo - CreateBookingUseCase:**
```typescript
@Injectable()
export class CreateBookingUseCase {
  async execute(userId: string, dto: CreateBookingDto): Promise<Booking> {
    // 1. Validar quadra existe
    const court = await this.courtRepository.findById(dto.court_id);

    // 2. Verificar conflitos
    const overlapping = await this.bookingRepository.findOverlapping(...);

    // 3. Criar entidade de domínio
    const booking = Booking.create({ ... });

    // 4. Persistir
    return await this.bookingRepository.save(booking);
  }
}
```

### 3. Infrastructure Layer (Infraestrutura)

**Responsabilidade:** Implementa detalhes técnicos e integração com serviços externos.

**Componentes:**
- **Repository Implementations:** Implementações concretas usando Supabase
- **External Services:** Integração com OneSignal, Redis, etc.
- **Database Clients:** Configuração de conexões

**Exemplo - BookingRepository:**
```typescript
@Injectable()
export class BookingRepository implements IBookingRepository {
  async save(booking: Booking): Promise<Booking> {
    const data = this.mapToDatabase(booking);
    const { data: saved } = await this.supabase.from('reservations').insert(data);
    return this.mapToDomain(saved);
  }
}
```

### 4. Presentation Layer (Apresentação)

**Responsabilidade:** Gerencia a comunicação com o mundo externo (HTTP, WebSocket).

**Componentes:**
- **Controllers:** Recebem requisições HTTP
- **DTOs de Request/Response:** Validação com class-validator
- **WebSocket Gateways:** Comunicação em tempo real

**Exemplo - BookingsController:**
```typescript
@Controller('bookings')
export class BookingsController {
  @Post()
  @UseGuards(AuthGuard)
  async createBooking(@CurrentUser() user, @Body() dto: CreateBookingDto) {
    const booking = await this.createBookingUseCase.execute(user.id, dto);
    return booking.toPlainObject();
  }
}
```

## 🔄 Fluxo de Dados

### Criação de Reserva (Booking)

```
1. HTTP Request (POST /bookings)
   └─> BookingsController.createBooking()
       └─> CreateBookingUseCase.execute()
           ├─> CourtRepository.findById()  // Busca quadra
           ├─> BookingRepository.findOverlapping()  // Verifica conflitos
           ├─> Booking.create()  // Cria entidade
           └─> BookingRepository.save()  // Persiste
               └─> SupabaseService.insert()  // Database
```

## 🔒 Segurança e Validação

### 1. Autenticação
- **AuthGuard:** Valida tokens JWT do Supabase
- **@Public Decorator:** Marca rotas públicas
- **@CurrentUser Decorator:** Injeta usuário autenticado

### 2. Validação de Dados
- **DTOs com class-validator:** Validação de entrada
- **Entities:** Validação de regras de negócio
- **Global ValidationPipe:** Validação automática

### 3. Tratamento de Erros
- **Domain Exceptions:** Exceções específicas do domínio
- **HttpExceptionFilter:** Converte exceções em respostas HTTP
- **Logging Interceptor:** Log de requisições e erros

## 📊 Padrões Implementados

### 1. Repository Pattern
Abstrai o acesso a dados, permitindo trocar a implementação sem afetar o domínio.

```typescript
// Interface (Domain)
export interface IBookingRepository {
  save(booking: Booking): Promise<Booking>;
  findById(id: string): Promise<Booking | null>;
}

// Implementação (Infrastructure)
@Injectable()
export class BookingRepository implements IBookingRepository { ... }
```

### 2. Use Case Pattern
Cada caso de uso é uma classe independente e testável.

```typescript
@Injectable()
export class CreateBookingUseCase {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly courtRepository: ICourtRepository,
  ) {}

  async execute(userId: string, dto: CreateBookingDto): Promise<Booking> { ... }
}
```

### 3. Value Object Pattern
Objetos imutáveis sem identidade que encapsulam validação.

```typescript
export class TimeSlot {
  private constructor(
    private readonly _start: string,
    private readonly _end: string,
    private readonly _available: boolean,
  ) {
    this.validate();
  }
}
```

## 🧪 Testabilidade

A arquitetura facilita testes em todas as camadas:

### Testes de Domínio
```typescript
describe('Booking Entity', () => {
  it('should not allow overlapping bookings', () => {
    const booking1 = Booking.create({ ... });
    const booking2 = Booking.create({ ... });

    expect(booking1.overlaps(booking2)).toBe(true);
  });
});
```

### Testes de Use Cases
```typescript
describe('CreateBookingUseCase', () => {
  it('should create a booking', async () => {
    const mockCourtRepo = { findById: jest.fn() };
    const mockBookingRepo = { save: jest.fn() };

    const useCase = new CreateBookingUseCase(mockBookingRepo, mockCourtRepo);
    // ...
  });
});
```

## 📚 Documentação da API

A API possui documentação automática com Swagger:

- **URL:** `http://localhost:3000/api/docs`
- **Endpoints documentados:** Todos os controllers
- **Autenticação:** Bearer Token (JWT)

## 🚀 Próximos Passos

### Módulos a Migrar
- [ ] Auction Module → Nova arquitetura
- [ ] Notifications Module → Nova arquitetura

### Melhorias Futuras
- [ ] Eventos de domínio (Domain Events)
- [ ] CQRS para operações de leitura otimizadas
- [ ] Event Sourcing para auditoria
- [ ] Testes E2E completos
- [ ] Healthcheck endpoints
- [ ] Rate limiting
- [ ] API versioning

## 📖 Referências

- [Clean Architecture - Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Domain-Driven Design - Eric Evans](https://www.domainlanguage.com/ddd/)
- [NestJS Documentation](https://docs.nestjs.com/)
