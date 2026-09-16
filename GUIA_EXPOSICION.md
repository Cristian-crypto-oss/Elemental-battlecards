# Guía Completa de Exposición — Backend POO y SOLID
**Taller ADSO · Ficha 3172526 · Instructor: Andrés Moreno Collazos**
**Fecha de sustentación: Lunes 14 de septiembre de 2026**

---

## Estructura de la sustentación (20 minutos)

| Fase | Duración | Qué evalúan |
|---|---|---|
| **Fase 1** — Defensa de Arquitectura | 5 min | Diagramas + decisiones de diseño |
| **Fase 2** — Auditoría de Código en Vivo | 10 min | Polimorfismo, SRP, DIP en líneas exactas |
| **Fase 3** — Escenarios de Escalabilidad | 5 min | OCP — "¿qué cambian si el cliente pide X?" |

---

## FASE 1 — Defensa de Arquitectura (5 minutos)

### Qué abrir en el IDE
Abre `Backend/ARQUITECTURA.md` — tiene los tres diagramas Mermaid listos. Luego navega a `Backend/src/` y muestra la estructura de carpetas.

### Qué decir

**Sobre la estructura de carpetas:**
> "Organizamos el backend en capas verticales: `entities`, `interfaces`, `dtos`, `repositories`, `services`, `controllers`, `routes` y `socket`. Cada carpeta tiene una única responsabilidad. Las dependencias siempre fluyen hacia abajo — los controladores conocen a los servicios, los servicios conocen a los repositorios, pero nunca al revés."

**Sobre el patrón arquitectónico:**
> "Usamos Arquitectura en Capas con Inversión de Control. El patrón concreto en el punto de entrada es el **Composition Root** — el único lugar donde se instancian las clases concretas. Todo lo demás trabaja con interfaces."

**Sobre los dos módulos refactorizados:**
> "El backend tiene dos módulos: el módulo **Auth**, que maneja registro y login vía HTTP REST, y el módulo **Socket**, que maneja las partidas en tiempo real con Socket.IO. El Auth usa la cadena Controlador → Servicio → Repositorio. El Socket usa herencia con una clase abstracta base."

---

## FASE 2 — Auditoría de Código en Vivo (10 minutos)

> El instructor va a pedir exactamente estas tres cosas. Practica ir directo al archivo y la línea sin buscar.

---

### POLIMORFISMO
**Archivo:** `src/server.ts` — líneas 57–65

```typescript
// Tipo estático: BaseEventHandler[] — TypeScript solo ve la abstracción
const handlers: BaseEventHandler[] = [
  new RoomEventHandler(io, rooms),   // en runtime: objeto concreto 1
  new GameEventHandler(io, rooms),   // en runtime: objeto concreto 2
];

io.on('connection', (socket: Socket) => {
  // Invocación polimórfica — el runtime decide qué registerEvents ejecutar
  handlers.forEach((handler) => handler.registerEvents(socket));
});
```

**Qué decir:**
> "El array `handlers` tiene tipo estático `BaseEventHandler[]` — TypeScript solo sabe que son handlers abstractos. En tiempo de ejecución hay dos objetos distintos. Cuando llamamos `handler.registerEvents(socket)` en el `forEach`, no elegimos qué método llamar — el runtime lo resuelve según el tipo real. `RoomEventHandler` registra `create_room`, `join_room` y `disconnect`. `GameEventHandler` registra `game_event` y `end_turn`. Mismo nombre de método, comportamientos completamente distintos. Eso es **polimorfismo de subtipo**."

**Muestra también** `src/socket/BaseEventHandler.ts` — línea 28:
```typescript
abstract registerEvents(socket: Socket): void;
```
> "Aquí está la raíz del polimorfismo — el método abstracto. La clase base obliga a que cada subclase implemente su propia versión. TypeScript no te deja instanciar `BaseEventHandler` directamente."

---

### SEPARACIÓN DE RESPONSABILIDADES — SRP
**Muestra los tres archivos en secuencia.** El argumento es que cada uno tiene una sola razón para cambiar.

**Primero — `src/controllers/RegisterController.ts` — líneas 14–26:**
```typescript
async handle(req: Request, res: Response): Promise<void> {
  try {
    const result = await this.authService.register(req.body); // delega TODO al servicio
    res.status(201).json(result);
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: 'Error en el servidor.' });
  }
}
```
> "El controlador tiene una sola responsabilidad: traducir entre HTTP y el servicio. No hashea, no valida reglas de negocio, no toca la base de datos. Si mañana cambiamos de Express a Fastify, solo tocamos este archivo."

**Segundo — `src/services/AuthService.ts` — métodos `register` y `login`:**
```typescript
async register(dto: RegisterDto): Promise<AuthResponseDto> {
  // Solo lógica de negocio:
  if (!dto.username || !dto.email || !dto.password) { ... }    // validación
  const byEmail = await this.repository.findByEmail(dto.email); // duplicados
  const hashedPassword = await this.hashService.hash(dto.password); // hash
  const user = await this.repository.create({ ...dto, password: hashedPassword });
  const token = this.tokenService.sign({ id: user.id, ... });
  return { token, user, message: 'Usuario registrado exitosamente.' };
}
```
> "El servicio tiene una sola responsabilidad: la lógica de negocio de autenticación. No sabe que existe HTTP — no importa `Request` ni `Response`. Si cambia una regla de negocio, solo cambia este archivo."

**Tercero — `src/repositories/SequelizeUserRepository.ts` — línea 9:**
```typescript
export class SequelizeUserRepository implements IUserRepository {
  private readonly userModel: ModelDefined<UserAttributes, UserCreationAttributes>;
  // Solo métodos de acceso a datos:
  async findByEmail(email: string): Promise<UserEntity | null> { ... }
  async findByUsername(username: string): Promise<UserEntity | null> { ... }
  async create(dto: RegisterDto): Promise<UserEntity> { ... }
}
```
> "El repositorio tiene una sola responsabilidad: el acceso a datos. Es la única clase en todo el codebase que importa Sequelize. Si cambiamos de SQLite a MongoDB, solo cambiamos este archivo — o creamos uno nuevo."

---

### INVERSIÓN DE DEPENDENCIAS — DIP
**Archivo:** `src/services/AuthService.ts` — líneas 19–32:

```typescript
export class AuthService implements IAuthService {
  private readonly repository: IUserRepository;  // interfaz, no clase concreta
  private readonly hashService: IHashService;    // interfaz, no clase concreta
  private readonly tokenService: ITokenService;  // interfaz, no clase concreta

  constructor(
    repository: IUserRepository,   // recibe abstracción por constructor
    hashService: IHashService,     // recibe abstracción por constructor
    tokenService: ITokenService,   // recibe abstracción por constructor
  ) {
    this.repository = repository;
    this.hashService = hashService;
    this.tokenService = tokenService;
  }
```
> "`AuthService` es el módulo de alto nivel — contiene lógica de negocio. No crea ninguna dependencia con `new`. No sabe si el hash es bcrypt o argon2. No sabe si el repositorio usa SQLite o PostgreSQL. Recibe todo por constructor como interfaces. Esto es **inyección de dependencias en el constructor**."

**Luego muestra `src/routes/authRoutes.ts` — líneas 14–22:**
```typescript
// El ÚNICO lugar en todo el codebase donde existen los 'new'
const userRepo     = new SequelizeUserRepository(db.User);
const hashService  = new BcryptHashService(10);
const tokenService = new JwtTokenService(process.env.JWT_SECRET!);
const authService  = new AuthService(userRepo, hashService, tokenService);
const registerCtrl = new RegisterController(authService);
const loginCtrl    = new LoginController(authService);
```
> "El `new` solo aparece aquí — en el Composition Root. Este archivo es el ensamblador. Construye el grafo completo de dependencias y se las inyecta a cada clase. Las capas superiores no saben cómo se construyeron sus dependencias, solo saben el contrato que cumplen."

---

## Los 4 Pilares de POO — código exacto

### 1. ABSTRACCIÓN — definir el QUÉ sin decir el CÓMO

**Ejemplo 1 — Interfaz:** `src/interfaces/IHashService.ts`
```typescript
export interface IHashService {
  hash(plain: string): Promise<string>;
  compare(plain: string, hashed: string): Promise<boolean>;
}
// No menciona bcrypt, saltRounds ni ningún algoritmo.
```
> "Esta interfaz es una abstracción pura. Define el contrato — qué operaciones existen y qué tipos manejan — sin ningún detalle de implementación. `AuthService` trabaja con esta abstracción, no con bcrypt."

**Ejemplo 2 — Clase abstracta:** `src/socket/BaseEventHandler.ts`
```typescript
export abstract class BaseEventHandler {
  protected readonly io: Server;
  protected readonly rooms: RoomMap;

  constructor(io: Server, rooms: RoomMap) { ... }

  abstract registerEvents(socket: Socket): void; // contrato SIN implementación

  protected emitToRoom(...): void { ... }        // comportamiento concreto compartido
  protected getRoomOrFail(...): Room | null { ... } // comportamiento concreto compartido
}
```
> "La clase abstracta combina abstracción en `registerEvents` — obliga a cada subclase a implementarlo — con comportamiento concreto reutilizable en `emitToRoom` y `getRoomOrFail`. Nadie puede instanciar `BaseEventHandler` directamente."

---

### 2. ENCAPSULAMIENTO — proteger el estado interno

**Archivo:** `src/entities/UserEntity.ts`
```typescript
export class UserEntity {
  private readonly _id: number;           // privado e inmutable
  private readonly _username: string;
  private readonly _email: string;
  private readonly _passwordHash: string;

  constructor(id: number, username: string, email: string, passwordHash: string) {
    this._id = id;
    this._username = username;
    this._email = email;
    this._passwordHash = passwordHash;
  }

  // Solo getters — no hay setters
  get id(): number { return this._id; }
  get username(): string { return this._username; }
  get email(): string { return this._email; }
  get passwordHash(): string { return this._passwordHash; }
}
```
> "Todos los atributos son `private readonly` — privados e inmutables. Nadie fuera de la clase puede leer directamente `_id` ni sobreescribirlo. Una vez que se crea un `UserEntity`, sus datos no cambian. Los getters exponen solo lo necesario. Eso es encapsulamiento estricto."

**También en servicios** — `BcryptHashService.ts` línea 6:
```typescript
private readonly saltRounds: number; // detalle de implementación oculto
```
> "El número de rounds de bcrypt es un detalle interno de `BcryptHashService`. El resto del sistema no sabe cuántos rounds usa, ni necesita saberlo."

---

### 3. HERENCIA — reutilizar comportamiento sin duplicar código

**Archivos:** `src/socket/RoomEventHandler.ts` y `src/socket/GameEventHandler.ts`
```typescript
// RoomEventHandler.ts — línea 4
export class RoomEventHandler extends BaseEventHandler {
  // Hereda gratis: constructor con io y rooms, emitToRoom, getRoomOrFail
  private generateCode(): string { ... } // método PROPIO

  registerEvents(socket: Socket): void {
    socket.on('create_room', ...);  // comportamiento específico de sala
    socket.on('join_room', ...);
    socket.on('disconnect', ...);
  }
}

// GameEventHandler.ts — línea 4
export class GameEventHandler extends BaseEventHandler {
  // Hereda gratis: constructor con io y rooms, emitToRoom, getRoomOrFail

  registerEvents(socket: Socket): void {
    socket.on('game_event', ...);  // comportamiento específico de partida
    socket.on('end_turn', ...);
  }
}
```
> "Ambas clases heredan de `BaseEventHandler`. Obtienen gratis el constructor, `emitToRoom` y `getRoomOrFail` — sin duplicar código. Cada subclase solo implementa lo suyo. Relación 'es-un': un `RoomEventHandler` **es un** `BaseEventHandler`."

---

### 4. POLIMORFISMO — mismo método, comportamiento distinto

Ya cubierto en Fase 2. Segundo ejemplo adicional:

**`RegisterController` y `LoginController`** — ambos implementan `IController`:
```typescript
// RegisterController.ts — línea 7
export class RegisterController implements IController {
  async handle(req, res): Promise<void> {
    const result = await this.authService.register(req.body);
    res.status(201).json(result); // HTTP 201 Created
  }
}

// LoginController.ts — línea 7
export class LoginController implements IController {
  async handle(req, res): Promise<void> {
    const result = await this.authService.login(req.body);
    res.status(200).json(result); // HTTP 200 OK
  }
}
```
> "Los dos controladores implementan la misma interfaz `IController` con el mismo método `handle`. Express los trata igual — ambos son manejadores de rutas. Mismo contrato, comportamiento distinto. **Polimorfismo de interfaz**."

---

## Los 5 Principios SOLID — código exacto

### S — Single Responsibility (Responsabilidad Única)
Cubierto en Fase 2. Frase clave:
> "Cada clase tiene exactamente una razón para cambiar. `RegisterController` cambia si cambia el protocolo HTTP. `AuthService` cambia si cambia una regla de negocio. `SequelizeUserRepository` cambia si cambia la base de datos. Nunca las tres a la vez."

---

### O — Open/Closed (Abierto para extensión, Cerrado para modificación)

**Escenario: cambiar bcrypt por Argon2**

```typescript
// 1. Creamos una clase NUEVA — no tocamos BcryptHashService
export class Argon2HashService implements IHashService {
  async hash(plain: string): Promise<string> { /* lógica argon2 */ }
  async compare(plain: string, hashed: string): Promise<boolean> { /* lógica argon2 */ }
}

// 2. En authRoutes.ts cambiamos UNA línea
const hashService = new Argon2HashService(); // antes: new BcryptHashService(10)
```
> "`AuthService`, `RegisterController`, todos los tests — no se toca ninguno. El sistema estuvo abierto para extensión y cerrado para modificación."

**Segundo ejemplo — agregar handler de chat:**
> "Creamos `ChatEventHandler extends BaseEventHandler`, implementamos `registerEvents`, y en `server.ts` agregamos una línea al array `handlers`. El resto del servidor no cambia."

---

### L — Liskov Substitution (Sustitución de Liskov)

**Evidencia en los tests unitarios** — el mock del repositorio:
```typescript
// En los tests, SequelizeUserRepository se sustituye por un mock
const mockRepo: IUserRepository = {
  findByEmail: jest.fn().mockResolvedValue(null),
  findByUsername: jest.fn().mockResolvedValue(null),
  create: jest.fn().mockResolvedValue(new UserEntity(1, 'user', 'email@test.com', 'hash')),
};
const service = new AuthService(mockRepo, mockHash, mockToken); // funciona igual
```
> "`AuthService` recibe un repositorio falso en lugar de `SequelizeUserRepository`. Funciona exactamente igual porque el mock cumple el mismo contrato `IUserRepository`. Si el LSP no se cumpliera, los 38 tests fallarían. Como todos pasan, el LSP está garantizado."

---

### I — Interface Segregation (Segregación de Interfaces)

**Muestra la carpeta `interfaces/` — 5 archivos separados:**

```
interfaces/
├── IAuthService.ts     — register y login
├── IHashService.ts     — hash y compare
├── ITokenService.ts    — sign y verify
├── IUserRepository.ts  — findByEmail, findByUsername, create
└── IController.ts      — handle
```

> "Cinco interfaces, cada una mínima y enfocada. Si hubiéramos puesto todo en una `IAuthModule` gigante, `BcryptHashService` tendría que implementar `register` y `login` aunque no tiene relación con eso. En cambio, cada clase implementa solo la interfaz que le corresponde. Ninguna interfaz tiene métodos que no uses."

---

### D — Dependency Inversion (Inversión de Dependencias)

**Evidencia más directa** — abre `src/services/AuthService.ts` y mira los imports:
```typescript
import { IAuthService }    from '../interfaces/IAuthService';
import { IUserRepository } from '../interfaces/IUserRepository';
import { IHashService }    from '../interfaces/IHashService';
import { ITokenService }   from '../interfaces/ITokenService';
```
> "Cuatro imports — todos de la carpeta `interfaces/`. Ninguno de `repositories/`, ninguno de `BcryptHashService`, ninguno de `bcryptjs` directamente. `AuthService` vive en el mundo de las abstracciones. El módulo de alto nivel no conoce los de bajo nivel. Los dos dependen de las interfaces que están en el medio."

---

## FASE 3 — Escenarios de Escalabilidad (5 minutos)

### Escenario 1: "Integrar login con Google OAuth"
> "Creamos `GoogleAuthService implements IAuthService` con sus propios métodos `register` y `login` que hablan con la API de Google. En `authRoutes.ts` creamos una ruta nueva e inyectamos el `GoogleAuthService`. Los controladores no cambian — siguen recibiendo un `IAuthService` por constructor. **OCP cumplido**."

### Escenario 2: "Cambiar de SQLite a PostgreSQL en producción"
> "Ya lo soportamos. En `config/db.ts` leemos la variable `DB_USE_SQLITE`. Si es `false`, usamos PostgreSQL. `SequelizeUserRepository` funciona igual con cualquier motor porque Sequelize lo abstrae. Si quisiéramos MongoDB, crearíamos `MongoUserRepository implements IUserRepository` y lo inyectaríamos en `authRoutes.ts`. `AuthService` no sabe nada del cambio. **LSP + DIP en acción**."

### Escenario 3: "Agregar torneos con nuevas salas especiales"
> "Creamos `TournamentEventHandler extends BaseEventHandler`, implementamos `registerEvents` con los eventos del torneo, y lo agregamos al array `handlers` en `server.ts`. Dos líneas de cambio. `RoomEventHandler` y `GameEventHandler` no se modifican. **OCP + Herencia**."

### Escenario 4: "Añadir un nuevo método de pago / facturación electrónica"
> "Creamos una interfaz `IPaymentService` con los métodos necesarios, luego una clase concreta `NequiPaymentService implements IPaymentService`. La inyectamos por constructor donde sea necesaria. Si mañana el cliente cambia a PSE, creamos `PSEPaymentService` — cero modificaciones en las capas superiores."

---

## Tabla resumen para memorizar

| Concepto | Archivo | Qué señalar |
|---|---|---|
| **Abstracción** (interfaz) | `interfaces/IHashService.ts` | Todo el archivo — el contrato sin implementación |
| **Abstracción** (clase abstracta) | `socket/BaseEventHandler.ts` | `abstract registerEvents(socket: Socket): void` |
| **Encapsulamiento** | `entities/UserEntity.ts` | `private readonly _id`, `_username`, `_email`, `_passwordHash` |
| **Herencia** | `socket/RoomEventHandler.ts` | `extends BaseEventHandler` |
| **Polimorfismo** | `server.ts` | `handlers.forEach((handler) => handler.registerEvents(socket))` |
| **SRP** | `controllers/RegisterController.ts` | Una sola llamada: `this.authService.register(req.body)` |
| **OCP** | `interfaces/IHashService.ts` | Nueva implementación = nueva clase, sin modificar las existentes |
| **LSP** | Tests unitarios | Mock sustituye `SequelizeUserRepository` sin errores |
| **ISP** | Carpeta `interfaces/` | 5 interfaces separadas, cada una con mínimo de métodos |
| **DIP** | `services/AuthService.ts` | Imports solo de `interfaces/`, atributos de tipo interfaz |
| **Composition Root** | `routes/authRoutes.ts` | Todos los `new` en un solo lugar |
| **Inyección por constructor** | `services/AuthService.ts` | Constructor recibe `IUserRepository`, `IHashService`, `ITokenService` |

---

## Vocabulario técnico — úsalo durante la exposición

| Término | Cuándo usarlo |
|---|---|
| **Contrato** | Cuando hablas de una interfaz — "esta interfaz es el contrato que cualquier hash service debe cumplir" |
| **Inyección de dependencias** | Cuando señales el constructor de AuthService — "las dependencias se inyectan, no se crean" |
| **Composition Root** | Cuando abras `authRoutes.ts` — "este es el único lugar donde se ensamblan las dependencias" |
| **Acoplamiento** | Lo que evitamos — "si AuthService hiciera `new BcryptHashService()`, estaría acoplado a esa implementación" |
| **Cohesión** | Lo que logramos — "cada clase hace una sola cosa bien, alta cohesión" |
| **Abstracción** | Cuando hablas de interfaces o clases abstractas — "define el qué, no el cómo" |
| **Sustitución** | LSP — "cualquier implementación de `IUserRepository` puede reemplazar a `SequelizeUserRepository`" |
| **Módulo de alto nivel** | AuthService, controllers — los que contienen lógica o coordinación |
| **Módulo de bajo nivel** | Repositorios, hash service — los que hacen el trabajo concreto |

---

## Lo más importante para el día de la sustentación

1. **Todos los integrantes deben poder navegar el código.** El instructor pregunta a cualquiera.
2. **Practica ir directo al archivo**, sin buscar. Abre el IDE, ve a `server.ts`, señala el `forEach` y di la explicación en 30 segundos.
3. **No memorices definiciones de libro.** Explica con el código enfrente: *"aquí, en esta línea, porque..."*
4. **La frase más poderosa que puedes decir:** *"El único `new` de esta clase está en el Composition Root — en `authRoutes.ts`. El resto del sistema trabaja con interfaces."*
