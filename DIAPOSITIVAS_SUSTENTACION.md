# DIAPOSITIVAS DE SUSTENTACIÓN: BACKEND POO Y SOLID
**Programa:** Análisis y Desarrollo de Software (ADSO) — Ficha: 3172526  
**Instructor Evaluador:** Andrés Moreno Collazos  
**Proyecto:** Elemental Battlecards  
**Duración Total:** 20 Minutos  

---

## ÍNDICE RÁPIDO DE DIAPOSITIVAS

1. [Diapositiva 1: Portada y Ficha Técnica](#diapositiva-1-portada-y-ficha-técnica)
2. [Diapositiva 2: Estructura de la Sustentación y Objetivos](#diapositiva-2-estructura-de-la-sustentación-y-objetivos)
3. [Diapositiva 3: Fase 1 — Arquitectura de Software en Capas](#diapositiva-3-fase-1--arquitectura-de-software-en-capas)
4. [Diapositiva 4: Fase 1 — Diagrama de Clases UML y Contratos](#diapositiva-4-fase-1--diagrama-de-clases-uml-y-contratos)
5. [Diapositiva 5: Pilares POO 1 y 2 — Abstracción y Encapsulamiento](#diapositiva-5-pilares-poo-1-y-2--abstracción-y-encapsulamiento)
6. [Diapositiva 6: Pilares POO 3 y 4 — Herencia y Polimorfismo Dinámico](#diapositiva-6-pilares-poo-3-y-4--herencia-y-polimorfismo-dinámico)
7. [Diapositiva 7: Fase 2 (Auditoría) — Principio SRP (Responsabilidad Única)](#diapositiva-7-fase-2-auditoría--principio-srp-responsabilidad-única)
8. [Diapositiva 8: Fase 2 (Auditoría) — Principio DIP y Composition Root](#diapositiva-8-fase-2-auditoría--principio-dip-y-composition-root)
9. [Diapositiva 9: Principios OCP, LSP e ISP en Código](#diapositiva-9-principios-ocp-lsp-e-isp-en-código)
10. [Diapositiva 10: Fase 3 — Escenarios de Escalabilidad (OCP sin Colapsar)](#diapositiva-10-fase-3--escenarios-de-escalabilidad-ocp-sin-colapsar)
11. [Diapositiva 11: Batería de Pruebas Unitarias y Garantía LSP](#diapositiva-11-batería-de-pruebas-unitarias-y-garantía-lsp)
12. [Diapositiva 12: Conclusiones y Cumplimiento de Criterios SENA](#diapositiva-12-conclusiones-y-cumplimiento-de-criterios-sena)

---

### DIAPOSITIVA 1: Portada y Ficha Técnica
**Título:** Arquitectura Empresarial de Backend con POO y Principios SOLID  
**Subtítulo:** Refactorización Modular del Proyecto Formativo *Elemental Battlecards*  

- **Entidad:** Servicio Nacional de Aprendizaje (SENA)
- **Programa:** Análisis y Desarrollo de Software (ADSO)
- **Ficha:** 3172526
- **Instructor Asignado:** Andrés Moreno Collazos
- **Stack Técnico:** Node.js, TypeScript, Express, Socket.IO, Sequelize (SQLite / PostgreSQL), Jest.

> 🗣️ **Qué decir (30 seg):**  
> *"Buenos días / tardes instructor. Hoy presentamos la refactorización arquitectónica del backend de Elemental Battlecards. Aplicamos de forma rigurosa los cuatro pilares de la programación orientada a objetos y los cinco principios SOLID, organizando el sistema en capas desacopladas, utilizando inyección de dependencias en el constructor y aislando los puntos de composición para garantizar escalabilidad, testeabilidad y bajo acoplamiento."*

---

### DIAPOSITIVA 2: Estructura de la Sustentación y Objetivos
**Título:** Protocolo Oficial de la Sustentación (20 Minutos)  
**Subtítulo:** Distribución del Tiempo y Criterios de Evaluación

| Bloque | Tiempo | Enfoque Evaluativo | Evidencia a Presentar |
|---|---|---|---|
| **Fase 1** | **5 min** | **Defensa de Arquitectura** | Diagrama de Arquitectura + Diagrama de Clases UML + Estructura de carpetas |
| **Fase 2** | **10 min** | **Auditoría de Código en Vivo** | Polimorfismo en ejecución, SRP en capas y DIP en constructor |
| **Fase 3** | **5 min** | **Resolución de Escenarios OCP** | Simulación de requerimientos de cambio sin modificar código existente |

- **Criterios Clave de Aprobación:**
  1. **Alineación UML-Código:** Correspondencia milimétrica entre diagramas y TypeScript.
  2. **Bajo Acoplamiento:** Ausencia de operadores `new` en módulos de alto nivel.
  3. **Dominio Técnico:** Uso de vocabulario formal (*contratos, abstracción, cohesión, sustitución*).

> 🗣️ **Qué decir (45 seg):**  
> *"Nuestra exposición no es teórica: es una auditoría técnica basada en el protocolo establecido. En los primeros 5 minutos defenderemos la arquitectura y el diagrama UML; en los siguientes 10 minutos navegaremos directamente por el código fuente en el IDE auditando líneas exactas de Polimorfismo, SRP y DIP; y cerraremos en 5 minutos respondiendo los escenarios de escalabilidad demostrando que la arquitectura no colapsa."*

---

### DIAPOSITIVA 3: Fase 1 — Arquitectura de Software en Capas
**Título:** Defensa de la Arquitectura en Capas Verticales  
**Subtítulo:** Flujo Unidireccional y Puntos de Composición

```
[ Cliente HTTP / REST ]                    [ Clientes WebSocket ]
           │                                          │
           ▼                                          ▼
┌──────────────────────┐                   ┌──────────────────────┐
│  routes/authRoutes   │ (Composition      │      server.ts       │ (Composition
│  (Enrutamiento)      │  Root Auth)       │  (Servidor + Sockets)│  Root Sockets)
└──────────┬───────────┘                   └──────────┬───────────┘
           │ Inyecta dependencias                     │ Instancia polimórfica
           ▼                                          ▼
┌──────────────────────┐                   ┌──────────────────────┐
│     Controllers      │ (IController)     │   BaseEventHandler   │ (Clase Abstracta)
└──────────┬───────────┘                   └──────────┬───────────┘
           │ Usa abstracciones                        │ Herencia "es-un"
           ▼                                    ┌─────┴──────────────┐
┌──────────────────────┐                        ▼                    ▼
│       Services       │ (IAuthService)    RoomEventHandler  GameEventHandler
└──────────┬───────────┘
           │ Usa interfaces (DIP)
           ▼
┌──────────────────────┐
│     Repositories     │ (IUserRepository -> Sequelize)
└──────────┬───────────┘
           │ Mapea y protege
           ▼
┌──────────────────────┐
│       Entities       │ (UserEntity - Encapsulamiento puro)
└──────────────────────┘
```

- **Puntos Fuertes de la Arquitectura:**
  - **Dirección única de dependencias:** Los controladores conocen servicios; los servicios conocen contratos de repositorios; nunca a la inversa.
  - **Composition Roots aislados:** `authRoutes.ts` y `server.ts` son los únicos lugares donde se instancian clases concretas.
  - **Dos subsistemas integrados:** Módulo Auth (arquitectura multicapa para HTTP) y Módulo Socket (herencia polimórfica en tiempo real).

> 🗣️ **Qué decir (1 min):**  
> *"Organizamos el backend en capas verticales con responsabilidades estrictas: `entities`, `interfaces`, `dtos`, `repositories`, `services`, `controllers` y `socket`. Las dependencias fluyen siempre hacia adentro hacia las abstracciones. Si la base de datos cambia, el servicio no se entera. Si el protocolo web cambia de Express a Fastify, el servicio tampoco se entera. Todo el acoplamiento está confinado en los Composition Roots."*

---

### DIAPOSITIVA 4: Fase 1 — Diagrama de Clases UML y Contratos
**Título:** Diagrama de Clases (UML) del Backend  
**Subtítulo:** Modelado de Interfaces, Implementaciones y Jerarquías

- **5 Interfaces Segregadas (Contratos Puros):**
  - `IUserRepository`: `findByEmail`, `findByUsername`, `create`.
  - `IAuthService`: `register`, `login`.
  - `IHashService`: `hash`, `compare`.
  - `ITokenService`: `sign`, `verify`.
  - `IController`: `handle(req, res)`.
- **Relaciones Clave:**
  - `SequelizeUserRepository` ..|> `IUserRepository` (*realización*).
  - `AuthService` ..|> `IAuthService` (*realización*).
  - `AuthService` ──> `IUserRepository`, `IHashService`, `ITokenService` (*asociación con interfaces*).
  - `RegisterController` / `LoginController` ..|> `IController` (*realización*).
  - `RoomEventHandler` / `GameEventHandler` ──|> `BaseEventHandler` (*herencia pura*).

> 🗣️ **Qué decir (1 min):**  
> *"En el diagrama UML evidenciamos que ninguna clase concreta de negocio depende de otra clase concreta. `AuthService` solo tiene flechas de asociación hacia interfaces: `IUserRepository`, `IHashService` e `ITokenService`. Por otro lado, en la capa de WebSockets, `RoomEventHandler` y `GameEventHandler` extienden a `BaseEventHandler`, reutilizando lógica compartida y cumpliendo el principio de Sustitución de Liskov."*

---

### DIAPOSITIVA 5: Pilares POO 1 y 2 — Abstracción y Encapsulamiento
**Título:** Pilares POO: Abstracción y Encapsulamiento en el Código  
**Subtítulo:** Ocultamiento de Detalles y Contratos Desacoplados

#### 1. Abstracción: Definir el "QUÉ" sin atarse al "CÓMO"
- **Archivo:** `src/interfaces/IHashService.ts`
```typescript
export interface IHashService {
  hash(plain: string): Promise<string>;
  compare(plain: string, hashed: string): Promise<boolean>;
}
```
- *Justificación:* No menciona `bcrypt`, ni número de salt rounds, ni algoritmos criptográficos. El servicio solo sabe que puede hashear y comparar.

#### 2. Encapsulamiento: Protección Inmutable del Estado
- **Archivo:** `src/entities/UserEntity.ts` (Líneas 2–19)
```typescript
export class UserEntity {
  private readonly _id: number;
  private readonly _username: string;
  private readonly _email: string;
  private readonly _passwordHash: string;

  constructor(id: number, username: string, email: string, passwordHash: string) {
    this._id = id;
    this._username = username;
    this._email = email;
    this._passwordHash = passwordHash;
  }

  get id(): number { return this._id; }
  get username(): string { return this._username; }
  get email(): string { return this._email; }
  get passwordHash(): string { return this._passwordHash; }
}
```
- *Justificación:* Modificadores `private readonly` y exclusividad de getters. Nadie puede mutar ni sobreescribir la entidad una vez instanciada.

> 🗣️ **Qué decir (1 min):**  
> *"Aplicamos Abstracción en `IHashService` definiendo un contrato puro de qué operaciones existen sin acoplarnos a ninguna librería. Y aplicamos Encapsulamiento estricto en `UserEntity`: sus campos son `private readonly`, impidiendo que agentes externos alteren el estado del usuario en memoria; la entidad es completamente inmutable."*

---

### DIAPOSITIVA 6: Pilares POO 3 y 4 — Herencia y Polimorfismo Dinámico
**Título:** Pilares POO: Herencia y Polimorfismo en Tiempo Real  
**Subtítulo:** Reutilización de Código y Resolución Dinámica de Tipos

#### 3. Herencia: Relación Lógica "Es-Un"
- **Archivo Base:** `src/socket/BaseEventHandler.ts`
- **Subclases:** `RoomEventHandler.ts` y `GameEventHandler.ts`
```typescript
export class RoomEventHandler extends BaseEventHandler { ... }
export class GameEventHandler extends BaseEventHandler { ... }
```
- *Justificación:* Reutilizan el constructor (`io`, `rooms`) y métodos utilitarios compartidos (`emitToRoom`, `getRoomOrFail`) sin duplicar ni una sola línea.

#### 4. Polimorfismo de Subtipo en Ejecución
- **Archivo:** `src/server.ts` (Líneas 63–72)
```typescript
// Tipo estático: BaseEventHandler[] (TypeScript solo ve la abstracción base)
const handlers: BaseEventHandler[] = [
  new RoomEventHandler(io, rooms),   // Objeto concreto 1
  new GameEventHandler(io, rooms),   // Objeto concreto 2
];

io.on('connection', (socket: Socket) => {
  // Invocación polimórfica: el runtime despacha el método de la subclase correspondiente
  handlers.forEach((handler) => handler.registerEvents(socket));
});
```

> 🗣️ **Qué decir (1 min 15 seg):**  
> *"Aquí está la prueba contundente de Polimorfismo de subtipo. El array `handlers` se tipa como `BaseEventHandler[]`. Cuando un jugador se conecta, ejecutamos `handlers.forEach(h => h.registerEvents(socket))`. No usamos ningún `if` ni `switch` para preguntar qué tipo de handler es. El motor de JavaScript resuelve en runtime la implementación concreta: `RoomEventHandler` registra salas y `GameEventHandler` registra turnos. Mismo método, comportamiento completamente distinto."*

---

### DIAPOSITIVA 7: Fase 2 (Auditoría) — Principio SRP (Responsabilidad Única)
**Título:** Principio SOLID: Responsabilidad Única (SRP)  
**Subtítulo:** Una Sola Razón para Cambiar por Cada Capa

```
        HTTP Request
             │
             ▼
┌───────────────────────────┐  Razón de cambio: El protocolo de transporte HTTP.
│    RegisterController     │  (Solo valida formato HTTP y delega inmediatamente al servicio)
└────────────┬──────────────┘
             │ DTO limpio
             ▼
┌───────────────────────────┐  Razón de cambio: Reglas de negocio del dominio.
│        AuthService        │  (Valida existencia, pide hash, crea usuario, genera token)
└────────────┬──────────────┘
             │ DTO con hash
             ▼
┌───────────────────────────┐  Razón de cambio: La tecnología de persistencia / base de datos.
│ SequelizeUserRepository   │  (Única clase que importa Sequelize y ejecuta consultas SQL)
└───────────────────────────┘
```

- **Demostración en Vivo en el IDE:**
  1. `src/controllers/RegisterController.ts` (Líneas 14–26): Solo llama a `this.authService.register(req.body)` y responde códigos HTTP (201 / 400 / 500). Cero lógica de hash, cero SQL.
  2. `src/services/AuthService.ts` (Líneas 35–64): No sabe qué es `req` ni `res`. Si migramos a gRPC o WebSockets, el servicio permanece intacto.
  3. `src/repositories/SequelizeUserRepository.ts`: Es la única clase que sabe cómo interactuar con `UserAttributes` de la base de datos.

> 🗣️ **Qué decir (1 min 30 seg):**  
> *"Demostramos SRP abriendo estos tres archivos en secuencia: `RegisterController` solo tiene una razón para cambiar: el protocolo web. Si Express cambia a Fastify, solo tocamos el controlador. `AuthService` solo cambia si cambia una regla de negocio (ej. exigir contraseñas de 12 caracteres). Y `SequelizeUserRepository` solo cambia si cambiamos la base de datos. Ninguna clase invade la responsabilidad de la otra."*

---

### DIAPOSITIVA 8: Fase 2 (Auditoría) — Principio DIP y Composition Root
**Título:** Principio SOLID: Inversión de Dependencias (DIP)  
**Subtítulo:** Inyección por Constructor y Aislamiento del Operador `new`

#### 1. Inyección de Dependencias por Constructor
- **Archivo:** `src/services/AuthService.ts` (Líneas 20–33)
```typescript
export class AuthService implements IAuthService {
  private readonly repository: IUserRepository;  // Tipo interfaz
  private readonly hashService: IHashService;    // Tipo interfaz
  private readonly tokenService: ITokenService;  // Tipo interfaz

  constructor(
    repository: IUserRepository,
    hashService: IHashService,
    tokenService: ITokenService,
  ) {
    this.repository = repository;
    this.hashService = hashService;
    this.tokenService = tokenService;
  }
```
- *Regla:* Los módulos de alto nivel (`AuthService`) dependen de abstracciones (`interfaces`), nunca de módulos de bajo nivel (`BcryptHashService`, `SequelizeUserRepository`).

#### 2. Composition Root: El Único Lugar donde Existen los `new`
- **Archivo:** `src/routes/authRoutes.ts` (Líneas 14–19)
```typescript
// Ensamblaje del grafo de dependencias
const userRepo     = new SequelizeUserRepository(db.User);
const hashService  = new BcryptHashService(10);
const tokenService = new JwtTokenService(process.env.JWT_SECRET!);
const authService  = new AuthService(userRepo, hashService, tokenService);
const registerCtrl = new RegisterController(authService);
const loginCtrl    = new LoginController(authService);
```

> 🗣️ **Qué decir (1 min 30 seg):**  
> *"Miren los imports de `AuthService.ts`: todos apuntan a la carpeta `interfaces/`. No hay ningún import de Sequelize ni de Bcrypt. El servicio recibe todas sus dependencias ya instanciadas en su constructor. ¿Y dónde se construyen? En el Composition Root: `src/routes/authRoutes.ts`. Cumplimos al 100% el criterio de bajo acoplamiento: no hay instanciación manual (`new`) en las clases de alto nivel."*

---

### DIAPOSITIVA 9: Principios OCP, LSP e ISP en Código
**Título:** Principios OCP, LSP e ISP Garantizados  
**Subtítulo:** Extensibilidad, Sustituibilidad y Segregación de Interfaces

- **Open/Closed Principle (OCP):**
  - Para cambiar el motor de hashing de `bcrypt` a `Argon2`, no modificamos `AuthService`.
  - Simplemente creamos `Argon2HashService implements IHashService` y en `authRoutes.ts` cambiamos una sola línea:
    `const hashService = new Argon2HashService();`.
  - El sistema está **abierto para extensión pero cerrado para modificación**.
- **Liskov Substitution Principle (LSP):**
  - Cualquier subtipo puede sustituir al supertipo sin romper el sistema.
  - En nuestros tests unitarios, `SequelizeUserRepository` es sustituido por un objeto mock que implementa `IUserRepository`. El servicio funciona exactamente igual y pasa los 38 tests sin quejarse.
- **Interface Segregation Principle (ISP):**
  - Disponemos de 5 interfaces pequeñas y especializadas en vez de una interfaz monolítica "Dios":
    `IAuthService`, `IHashService`, `ITokenService`, `IUserRepository`, `IController`.
  - `BcryptHashService` no se ve obligado a conocer tokens ni bases de datos.

> 🗣️ **Qué decir (1 min):**  
> *"OCP se evidencia porque podemos agregar un nuevo algoritmo de cifrado sin alterar `AuthService`. LSP queda matemáticamente comprobado en nuestra suite de pruebas: sustituimos el repositorio real de base de datos por un mock en memoria y `AuthService` jamás rompe su comportamiento. E ISP se evidencia en nuestras 5 interfaces independientes: cada clase implementa exclusivamente los métodos que requiere."*

---

### DIAPOSITIVA 10: Fase 3 — Escenarios de Escalabilidad (OCP sin Colapsar)
**Título:** Resolución de Escenarios de Escalabilidad (Fase 3)  
**Subtítulo:** Respuestas Técnicas Inmediatas a las Preguntas del Instructor

#### Pregunta 1: "¿Si el cliente solicita integrar login con Google OAuth, qué clases se modifican?"
- **Respuesta:** Ninguna clase existente se altera. Creamos una clase nueva `GoogleAuthService implements IAuthService`. En `authRoutes.ts` montamos la ruta `/google` e inyectamos el nuevo servicio en el controlador. Los controladores existentes y el modelo de usuario permanecen intactos.

#### Pregunta 2: "¿Si el cliente pide cambiar de SQLite a PostgreSQL o MongoDB en producción?"
- **Respuesta:** Para PostgreSQL, nuestro `SequelizeUserRepository` ya está listo: solo cambiamos la variable `DB_USE_SQLITE=false` en el `.env`. Si el cliente pide MongoDB, creamos una nueva clase `MongoUserRepository implements IUserRepository`. Cambiamos una línea en `authRoutes.ts` (`new MongoUserRepository()`). `AuthService` ni siquiera sabe qué motor de base de datos guarda la información.

#### Pregunta 3: "¿Cómo agregamos un sistema de Chat en tiempo real o Torneos?"
- **Respuesta:** Creamos `ChatEventHandler extends BaseEventHandler` y `TournamentEventHandler extends BaseEventHandler`. Implementamos `registerEvents(socket)` y en `server.ts` agregamos una sola línea al array `handlers`. El ciclo `forEach` polimórfico lo registrará automáticamente sin tocar los handlers existentes de sala ni de partida.

> 🗣️ **Qué decir (1 min 30 seg):**  
> *"Nuestra arquitectura está diseñada para absorber cambios de requerimientos sin colapsar. Si el cliente pide un nuevo proveedor de autenticación, una nueva base de datos o nuevos eventos de juego en tiempo real, la solución siempre es la misma: crear una nueva clase que implemente o extienda el contrato existente, e inyectarla en el Composition Root. Cero regresiones, cero modificaciones a la lógica de negocio ya probada."*

---

### DIAPOSITIVA 11: Batería de Pruebas Unitarias y Garantía LSP
**Título:** Verificación con Pruebas Automatizadas  
**Subtítulo:** Testeabilidad Gracias a la Inversión de Dependencias

- **Suite de Pruebas con Jest:** 38 pruebas unitarias ejecutadas.
- **Cobertura de la Arquitectura:**
  - Pruebas de `AuthService`: Registro exitoso, validación de campos obligatorios, detección de correos duplicados, nombres de usuario duplicados, manejo de errores y emisión de tokens.
  - Pruebas de `RegisterController` y `LoginController`: Mapeo de códigos HTTP 201, 200, 400 y 500 ante excepciones de dominio (`AuthError`).
  - Pruebas de `SequelizeUserRepository`: Creación y búsqueda de usuarios.
  - Pruebas de `BcryptHashService` y `JwtTokenService`: Contratos criptográficos.
- **Por qué fue posible testear el 100% de la lógica:**
  - Como `AuthService` no llama a `new SequelizeUserRepository()`, pudimos inyectarle un mock en milisegundos sin levantar un servidor de base de datos.

> 🗣️ **Qué decir (1 min):**  
> *"La mejor prueba de que una arquitectura cumple SOLID y POO es su testeabilidad. Gracias a la Inversión de Dependencias, pudimos escribir 38 pruebas unitarias donde testeamos cada regla de negocio aislando la base de datos mediante mocks de interfaces. Esto garantiza que el software es confiable y libre de efectos secundarios."*

---

### DIAPOSITIVA 12: Conclusiones y Cumplimiento de Criterios SENA
**Título:** Conclusiones y Cumplimiento de Criterios de Evaluación  
**Subtítulo:** Resumen Final de la Sustentación

| Criterio Evaluado en Guía | Cómo se Cumple en el Código | Estado |
|---|---|:---:|
| **Alineación UML-Código** | Diagrama de clases y arquitectura reflejan con precisión de 100% cada interfaz, clase y método. | ✅ Cumplido |
| **4 Pilares de POO** | Abstracción (`interfaces`), Encapsulamiento (`UserEntity`), Herencia (`BaseEventHandler`), Polimorfismo (`server.ts`). | ✅ Cumplido |
| **5 Principios SOLID** | SRP (capas), OCP (extensión), LSP (sustitución), ISP (5 interfaces), DIP (inyección constructor). | ✅ Cumplido |
| **Bajo Acoplamiento** | Ausencia absoluta de `new` en servicios y controladores; centralizado en Composition Roots. | ✅ Cumplido |
| **Defensa Técnica y Fluidez** | Dominio del vocabulario técnico y navegación instantánea a las líneas de código en el IDE. | ✅ Cumplido |

> 🗣️ **Frase de Cierre:**  
> *"Instructor Andrés Moreno, queda demostrado que el backend de Elemental Battlecards no solo cumple con las funcionalidades de negocio requeridas, sino que implementa una arquitectura limpia, profesional y alineada a los estándares de la industria del software. Quedamos a su disposición para cualquier pregunta técnica en el IDE."*
