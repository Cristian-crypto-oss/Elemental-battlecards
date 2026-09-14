# Documento de Requisitos

## Introducción

Este documento describe los requisitos para la refactorización del backend de **Elemental Battlecards** como entregable del taller académico ADSO. El objetivo es migrar la arquitectura actual (Node.js / CommonJS, código monolítico) a una arquitectura en capas con TypeScript, aplicando los principios SOLID, los pilares de la POO (abstracción, encapsulamiento, herencia y polimorfismo) e inyección de dependencias mediante un único Composition Root. Los módulos a refactorizar son **Auth** (registro e inicio de sesión) y **Socket/Salas** (gestión de partidas en tiempo real con Socket.IO). El frontend no se modifica.

---

## Glosario

- **Sistema**: el backend Node.js/TypeScript de Elemental Battlecards en su totalidad.
- **Auth_Module**: conjunto de capas (entidades, repositorios, servicios, controladores) responsable del registro e inicio de sesión de usuarios.
- **Socket_Module**: conjunto de clases responsable de gestionar eventos Socket.IO de salas y partidas.
- **Controller**: clase TypeScript que recibe una petición HTTP, delega en un servicio y devuelve la respuesta. No contiene lógica de negocio.
- **Service**: clase TypeScript que contiene la lógica de negocio de un caso de uso. No accede directamente a la base de datos.
- **Repository**: clase TypeScript que encapsula todo el acceso a la base de datos para una entidad. No contiene lógica de negocio.
- **Entity**: clase TypeScript que modela un objeto de dominio con sus atributos y reglas de validación internas.
- **DTO**: objeto plano de transferencia de datos (Data Transfer Object) que define la forma de los datos de entrada o salida de un caso de uso.
- **Interface**: contrato TypeScript que define la firma pública de un servicio o repositorio.
- **Composition_Root**: único módulo del sistema (rutas/servidor) donde se instancian todas las implementaciones concretas y se inyectan en los constructores.
- **IUserRepository**: interfaz que define las operaciones de persistencia del usuario.
- **IAuthService**: interfaz que define las operaciones del caso de uso de autenticación.
- **IHashService**: interfaz que define las operaciones de hashing y verificación de contraseñas.
- **ITokenService**: interfaz que define las operaciones de generación y verificación de tokens JWT.
- **BaseEventHandler**: clase abstracta base de la jerarquía de manejadores de eventos Socket.IO.
- **RoomEventHandler**: clase concreta que hereda de `BaseEventHandler` y gestiona eventos de salas.
- **GameEventHandler**: clase concreta que hereda de `BaseEventHandler` y gestiona eventos de partida.
- **Sala**: espacio de juego identificado por un código de 6 dígitos que admite exactamente 2 jugadores.
- **JWT**: JSON Web Token usado como mecanismo de autenticación sin estado.
- **Sequelize**: ORM usado para la capa de acceso a datos (SQLite en desarrollo, PostgreSQL en producción).
- **RegisterDto**: DTO que contiene `username`, `email` y `password` para el registro.
- **LoginDto**: DTO que contiene `username` o `email`, y `password` para el inicio de sesión.

---

## Requisitos

---

### Requisito 1: Separación en Capas (SRP / Arquitectura)

**Historia de usuario:** Como desarrollador del taller ADSO, quiero que el backend esté organizado en capas independientes (Entidades → Repositorios → Servicios → Controladores), de modo que cada capa tenga una única responsabilidad y los cambios en una capa no afecten a las demás.

#### Criterios de aceptación

1. THE Sistema SHALL organizar el código fuente del Auth_Module bajo las carpetas `src/entities/`, `src/interfaces/`, `src/repositories/`, `src/services/`, `src/controllers/` y `src/dtos/`.
2. THE Sistema SHALL organizar el código fuente del Socket_Module bajo la carpeta `src/socket/`.
3. THE Controller SHALL delegar toda la lógica de negocio al Service mediante inyección de dependencias en constructor, sin contener sentencias de acceso a base de datos ni lógica de hashing.
4. THE Service SHALL delegar todo acceso a datos al Repository mediante inyección de dependencias en constructor, sin importar directamente ningún modelo Sequelize.
5. THE Repository SHALL ser la única capa que importe y use modelos Sequelize directamente.
6. WHEN una capa de nivel superior necesita una dependencia, THE Sistema SHALL recibir dicha dependencia mediante el constructor de la clase, no mediante `require()` inline dentro de métodos.

---

### Requisito 2: Interfaces y Abstracción (DIP / ISP)

**Historia de usuario:** Como desarrollador del taller ADSO, quiero que los controladores y servicios dependan de interfaces TypeScript en lugar de implementaciones concretas, de modo que sea posible sustituir implementaciones (p. ej., cambiar bcrypt por argon2, o SQLite por PostgreSQL) sin modificar el código de las capas superiores.

#### Criterios de aceptación

1. THE Sistema SHALL definir la interfaz `IUserRepository` con al menos los métodos `findByEmail(email: string)`, `findByUsername(username: string)` y `create(data: RegisterDto)`.
2. THE Sistema SHALL definir la interfaz `IAuthService` con al menos los métodos `register(dto: RegisterDto)` y `login(dto: LoginDto)`.
3. THE Sistema SHALL definir la interfaz `IHashService` con los métodos `hash(plain: string)` y `compare(plain: string, hashed: string)`.
4. THE Sistema SHALL definir la interfaz `ITokenService` con los métodos `sign(payload: object)` y `verify(token: string)`.
5. THE Controller SHALL recibir en su constructor una dependencia del tipo `IAuthService`, no del tipo `AuthService` concreto.
6. THE AuthService SHALL recibir en su constructor dependencias de los tipos `IUserRepository`, `IHashService` e `ITokenService`.
7. IF una interfaz agrupa métodos que pertenecen a responsabilidades distintas, THEN THE Sistema SHALL dividir dicha interfaz en interfaces más específicas para cumplir el principio de segregación de interfaces.

---

### Requisito 3: Encapsulamiento

**Historia de usuario:** Como desarrollador del taller ADSO, quiero que el estado interno de cada clase esté protegido y solo sea accesible a través de la interfaz pública definida, de modo que se eviten modificaciones accidentales al estado desde el exterior.

#### Criterios de aceptación

1. THE Entity `UserEntity` SHALL declarar sus atributos (`id`, `username`, `email`, `passwordHash`) con el modificador `private` o `readonly`.
2. THE Service `AuthService` SHALL declarar sus dependencias inyectadas (`repository`, `hashService`, `tokenService`) con el modificador `private readonly`.
3. THE Repository `SequelizeUserRepository` SHALL declarar el modelo Sequelize subyacente con el modificador `private readonly`.
4. THE BaseEventHandler SHALL declarar el objeto `io` de Socket.IO y el mapa `rooms` con el modificador `protected` para permitir el acceso desde subclases.
5. WHEN una propiedad interna de una clase no es parte de su contrato público, THE Sistema SHALL declararla con modificador `private` o `protected` según corresponda.

---

### Requisito 4: Herencia en la Capa Socket (OCP / Herencia)

**Historia de usuario:** Como desarrollador del taller ADSO, quiero que los manejadores de eventos Socket.IO estén organizados en una jerarquía de clases con una clase abstracta base, de modo que se comparta comportamiento común sin duplicar código y se puedan añadir nuevos tipos de manejadores sin modificar los existentes.

#### Criterios de aceptación

1. THE Sistema SHALL definir la clase abstracta `BaseEventHandler` con el método abstracto `registerEvents(socket: Socket): void` que todas las subclases deben implementar.
2. THE `BaseEventHandler` SHALL implementar los métodos `protected emitToRoom(code: string, event: string, data: unknown): void` y `protected getRoomOrFail(code: string): Room | null` como comportamiento compartido heredado por las subclases.
3. THE `RoomEventHandler` SHALL extender `BaseEventHandler` e implementar `registerEvents` con los manejadores de los eventos `create_room` y `join_room`.
4. THE `GameEventHandler` SHALL extender `BaseEventHandler` e implementar `registerEvents` con los manejadores de los eventos `game_event` y `end_turn`.
5. WHEN se añade un nuevo tipo de evento Socket.IO, THE Sistema SHALL implementarlo como una nueva subclase de `BaseEventHandler` sin modificar `BaseEventHandler`, `RoomEventHandler` ni `GameEventHandler`.
6. THE `RoomEventHandler` y THE `GameEventHandler` SHALL ser sustituibles por `BaseEventHandler` sin errores en tiempo de compilación ni comportamientos indefinidos (LSP).

---

### Requisito 5: Polimorfismo

**Historia de usuario:** Como desarrollador del taller ADSO, quiero que el sistema invoque el método `registerEvents` sobre cualquier instancia de `BaseEventHandler` sin conocer el tipo concreto en el punto de llamada, de modo que se demuestre polimorfismo de subtipo.

#### Criterios de aceptación

1. THE `server.ts` SHALL almacenar los manejadores de eventos en un array de tipo `BaseEventHandler[]` e invocar `handler.registerEvents(socket)` para cada elemento sin hacer casting ni comprobaciones de tipo concreto.
2. WHEN el sistema inicializa los manejadores Socket.IO, THE Sistema SHALL iterar sobre el array de `BaseEventHandler[]` e invocar `registerEvents` polimórficamente para registrar todos los eventos.
3. THE Sistema SHALL incluir al menos dos implementaciones concretas de `BaseEventHandler` (`RoomEventHandler` y `GameEventHandler`) que produzcan comportamientos distintos al invocar `registerEvents`.

---

### Requisito 6: Composition Root e Inyección de Dependencias

**Historia de usuario:** Como desarrollador del taller ADSO, quiero que todas las instancias concretas se construyan en un único lugar (Composition Root), de modo que el grafo de dependencias sea explícito y fácil de modificar o probar.

#### Criterios de aceptación

1. THE Sistema SHALL centralizar la construcción de todas las instancias concretas en `src/routes/authRoutes.ts` (para Auth) y en `src/server.ts` (para Socket), formando el Composition Root.
2. THE Composition_Root SHALL instanciar las dependencias en el orden correcto: primero `SequelizeUserRepository`, luego `BcryptHashService` y `JwtTokenService`, luego `AuthService`, finalmente `RegisterController` y `LoginController`.
3. WHEN una clase recibe sus dependencias, THE Sistema SHALL inyectarlas exclusivamente a través del constructor de la clase.
4. THE Sistema SHALL prohibir el uso de `require()` dinámico o imports de implementaciones concretas fuera del Composition_Root en las capas Controller, Service y Repository.

---

### Requisito 7: Registro de Usuario (Auth — Funcional)

**Historia de usuario:** Como jugador nuevo, quiero registrarme con un nombre de usuario, correo y contraseña, de modo que pueda acceder al juego con mis credenciales.

#### Criterios de aceptación

1. WHEN el cliente envía una petición `POST /api/auth/register` con `RegisterDto` válido, THE Auth_Module SHALL crear el usuario en la base de datos y devolver un token JWT y los datos del usuario con estado HTTP 201.
2. IF el `RegisterDto` no contiene `username`, `email` o `password`, THEN THE Auth_Module SHALL devolver estado HTTP 400 con un mensaje descriptivo del campo faltante.
3. IF el `email` del `RegisterDto` ya existe en la base de datos, THEN THE Auth_Module SHALL devolver estado HTTP 409 con el mensaje "El correo electrónico ya está en uso."
4. IF el `username` del `RegisterDto` ya existe en la base de datos, THEN THE Auth_Module SHALL devolver estado HTTP 409 con el mensaje "El nombre de usuario ya está en uso."
5. THE Auth_Module SHALL almacenar la contraseña como hash bcrypt con factor de coste 10, nunca en texto plano.
6. THE Auth_Module SHALL firmar el token JWT con el secreto definido en la variable de entorno `JWT_SECRET` y una expiración de 1 hora.
7. IF `JWT_SECRET` no está definido en las variables de entorno, THEN THE Sistema SHALL rechazar el inicio del servidor con un error explícito en lugar de usar un valor por defecto inseguro.

---

### Requisito 8: Inicio de Sesión (Auth — Funcional)

**Historia de usuario:** Como jugador registrado, quiero iniciar sesión con mi nombre de usuario o correo y mi contraseña, de modo que reciba un token JWT para autenticarme en el juego.

#### Criterios de aceptación

1. WHEN el cliente envía una petición `POST /api/auth/login` con `LoginDto` válido (usuario o correo + contraseña correcta), THE Auth_Module SHALL devolver un token JWT y los datos del usuario con estado HTTP 200.
2. IF el `LoginDto` no contiene ni `username` ni `email`, THEN THE Auth_Module SHALL devolver estado HTTP 400 con el mensaje "Proporciona username o email."
3. IF el `LoginDto` no contiene `password`, THEN THE Auth_Module SHALL devolver estado HTTP 400 con el mensaje "La contraseña es obligatoria."
4. IF el usuario no existe en la base de datos o la contraseña no coincide con el hash almacenado, THEN THE Auth_Module SHALL devolver estado HTTP 401 con el mensaje "Credenciales inválidas." sin revelar si el usuario existe.
5. THE Auth_Module SHALL firmar el token JWT con el mismo `JWT_SECRET` y la misma duración de expiración que el registro.

---

### Requisito 9: Gestión de Salas (Socket — Funcional)

**Historia de usuario:** Como jugador, quiero crear o unirme a una sala de juego identificada por un código de 6 dígitos, de modo que pueda enfrentarme a otro jugador en tiempo real.

#### Criterios de aceptación

1. WHEN un socket emite `create_room`, THE RoomEventHandler SHALL generar un código numérico único de exactamente 6 dígitos, registrar la sala en el mapa interno, unir al socket a la sala y emitir `room_created` con el código.
2. WHEN un socket emite `join_room` con un código válido de una sala con un solo jugador, THE RoomEventHandler SHALL añadir al socket como `guest`, emitir `player_joined` a todos los miembros de la sala y emitir `game_start` a ambos jugadores.
3. IF un socket emite `join_room` con un código que no corresponde a ninguna sala activa, THEN THE RoomEventHandler SHALL invocar el callback con `{ success: false, message: 'Sala no encontrada.' }`.
4. IF un socket emite `join_room` con el código de una sala que ya tiene 2 jugadores, THEN THE RoomEventHandler SHALL invocar el callback con `{ success: false, message: 'Sala llena.' }`.
5. WHEN un socket se desconecta, THE RoomEventHandler SHALL eliminar al jugador de la sala; IF la sala queda vacía, THEN THE RoomEventHandler SHALL eliminarla del mapa interno; IF queda un jugador, THEN THE RoomEventHandler SHALL emitir `player_left` al jugador restante.

---

### Requisito 10: Eventos de Partida (Socket — Funcional)

**Historia de usuario:** Como jugador en una sala activa, quiero enviar y recibir eventos de juego (jugadas y cambios de turno) en tiempo real, de modo que la partida se sincronice entre los dos participantes.

#### Criterios de aceptación

1. WHEN un socket emite `game_event` con un payload, THE GameEventHandler SHALL reenviar el payload al otro socket de la misma sala (todos menos el emisor) sin modificarlo.
2. WHEN un socket emite `end_turn`, THE GameEventHandler SHALL alternar el turno en el estado de la sala e incrementar `turnNumber` en 1, y SHALL emitir `turn_changed` a todos los sockets de la sala con `currentTurn` y `turnNumber` actualizados.
3. IF un socket emite `game_event` o `end_turn` sin estar unido a ninguna sala, THEN THE GameEventHandler SHALL ignorar el evento sin emitir respuesta ni lanzar error.

---

### Requisito 11: Migración a TypeScript

**Historia de usuario:** Como desarrollador del taller ADSO, quiero que el backend use TypeScript con configuración estricta, de modo que las interfaces y los tipos sean verificados en tiempo de compilación y se demuestren las abstracciones exigidas por el taller.

#### Criterios de aceptación

1. THE Sistema SHALL incluir un archivo `tsconfig.json` en `Backend/` con `"strict": true`, `"target": "ES2020"` y `"module": "commonjs"`.
2. THE Sistema SHALL compilar sin errores de TypeScript con el comando `tsc --noEmit`.
3. THE Sistema SHALL definir todas las interfaces en archivos `.ts` bajo `src/interfaces/` con el prefijo `I` en el nombre (p. ej., `IUserRepository.ts`).
4. THE Sistema SHALL mantener la compatibilidad de la API REST existente (`POST /api/auth/register`, `POST /api/auth/login`) y los eventos Socket.IO existentes (`create_room`, `join_room`, `game_event`, `end_turn`) para que el frontend no requiera cambios.
5. WHERE el entorno es desarrollo, THE Sistema SHALL leer la variable `DB_USE_SQLITE=true` y conectar con SQLite; WHERE el entorno es producción, THE Sistema SHALL leer las variables `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASS` y conectar con PostgreSQL.

---

### Requisito 12: Artefactos de Documentación (Entregables del Taller)

**Historia de usuario:** Como instructor del taller ADSO, quiero recibir diagramas de arquitectura y de clases UML junto con el código, de modo que pueda evaluar la aplicación de los principios SOLID y POO.

#### Criterios de aceptación

1. THE Sistema SHALL generar el archivo `Backend/ARQUITECTURA.md` con un diagrama de arquitectura en capas descrito mediante texto estructurado o sintaxis Mermaid que muestre las 4 capas (Entities, Repositories, Services, Controllers) más la capa Socket.
2. THE Sistema SHALL incluir en `Backend/ARQUITECTURA.md` un diagrama de clases UML en sintaxis Mermaid que muestre: las interfaces (`IUserRepository`, `IAuthService`, `IHashService`, `ITokenService`), las clases concretas que las implementan, la jerarquía `BaseEventHandler → RoomEventHandler / GameEventHandler`, y las relaciones de dependencia (flechas de uso) entre capas.
3. THE Sistema SHALL documentar en `Backend/ARQUITECTURA.md` el flujo de una petición de registro desde la ruta Express hasta la base de datos, nombrando explícitamente cada capa atravesada y el principio SOLID aplicado.

---

## Propiedades de Corrección (Property-Based Testing)

Las siguientes propiedades describen invariantes verificables mediante pruebas basadas en propiedades (p. ej., fast-check). Se aplican a la lógica pura de los servicios, aislada de la base de datos mediante mocks.

### Propiedad 1 — Round-Trip Hash/Verify (IHashService)

**Para todo `plain: string` no vacío**, el resultado de `hashService.compare(plain, await hashService.hash(plain))` DEBE ser `true`.

Justificación: garantiza que bcrypt no corrompe la representación de la contraseña durante el hash y que la verificación es consistente con el valor original.

### Propiedad 2 — Idempotencia del Login con Credenciales Inválidas (AuthService)

**Para toda combinación de `email` y `password` donde el usuario no existe en el repositorio**, `authService.login(dto)` DEBE lanzar una excepción (o devolver un error) sin importar cuántas veces se invoque, sin efectos secundarios en el repositorio.

Justificación: garantiza que intentos fallidos no crean usuarios fantasma ni modifican el estado persistido.

### Propiedad 3 — Unicidad de Códigos de Sala (RoomEventHandler)

**Tras N llamadas consecutivas a `create_room`**, el mapa de salas DEBE contener exactamente N entradas con códigos distintos entre sí. Cada código DEBE ser una cadena de exactamente 6 dígitos (`/^\d{6}$/`).

Justificación: garantiza el invariante de unicidad y el formato del identificador de sala.

### Propiedad 4 — Invariante de Capacidad de Sala

**Para toda sala creada**, el array `players` NUNCA debe superar longitud 2. Después de un `join_room` exitoso, `players.length` DEBE ser exactamente 2.

Justificación: garantiza que la restricción de 2 jugadores se mantiene incluso bajo secuencias de eventos arbitrarias.

### Propiedad 5 — Alternancia de Turno (GameEventHandler)

**Para toda secuencia de N llamadas a `end_turn` sobre la misma sala**, el valor de `currentTurn` tras cada llamada DEBE alternar entre `'host'` y `'guest'` de forma estricta, y `turnNumber` DEBE incrementarse exactamente en 1 por llamada.

Justificación: garantiza el invariante de turno del juego independientemente de la longitud de la partida.

### Propiedad 6 — Firma/Verificación JWT (ITokenService)

**Para todo payload de usuario `{ id, username, email }` con valores string no vacíos**, `tokenService.verify(tokenService.sign(payload))` DEBE devolver un objeto que contenga los mismos valores de `id`, `username` y `email` que el payload original.

Justificación: garantiza la integridad del token entre el momento de firma y el de verificación.
