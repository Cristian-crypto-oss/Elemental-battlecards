# Plan de Implementación: Backend SOLID Refactor

## Resumen

Migración del backend de Elemental Battlecards de CommonJS monolítico a una arquitectura en capas TypeScript con principios SOLID, inyección de dependencias y property-based testing con fast-check. El frontend no se modifica en ninguna tarea.

---

## Tareas

- [x] 1. Configurar TypeScript y actualizar package.json
  - [x] 1.1 Crear `Backend/tsconfig.json` con `"strict": true`, `"target": "ES2020"`, `"module": "commonjs"`, `"outDir": "./dist"`, `"rootDir": "./src"` y las demás opciones del diseño
    - Verificar que `tsc --noEmit` no arroja errores tras la configuración inicial
    - _Requisitos: 11.1, 11.2_
  - [x] 1.2 Agregar dependencias TypeScript y de testing a `Backend/package.json`
    - Agregar a `dependencies`: `"typescript": "5.4.5"`
    - Agregar a `devDependencies`: `ts-node@10.9.2`, `ts-node-dev@2.0.0`, `@types/node@20.14.0`, `@types/express@4.17.21`, `@types/bcryptjs@2.4.6`, `@types/jsonwebtoken@9.0.6`, `@types/cors@2.8.17`, `jest@29.7.0`, `ts-jest@29.1.4`, `@types/jest@29.5.12`, `fast-check@3.19.0`
    - Agregar scripts: `"build"`, `"start"`, `"dev"`, `"typecheck"`, `"test"`, `"test:run"` según el diseño
    - Ejecutar `pnpm install` en el directorio `Backend/` para instalar las nuevas dependencias
    - _Requisitos: 11.1, 11.2_
  - [x] 1.3 Crear el archivo de configuración de Jest `Backend/jest.config.js` con preset `ts-jest`, `testEnvironment: "node"` y `testMatch` apuntando a `**/__tests__/**/*.test.ts`
    - _Requisitos: 11.2_

- [x] 2. Crear DTOs
  - [x] 2.1 Crear `Backend/src/dtos/RegisterDto.ts` con la interfaz `RegisterDto { username, email, password }`
    - _Requisitos: 1.1_
  - [x] 2.2 Crear `Backend/src/dtos/LoginDto.ts` con la interfaz `LoginDto { username?, email?, password }`
    - _Requisitos: 1.1_
  - [x] 2.3 Crear `Backend/src/dtos/AuthResponseDto.ts` con las interfaces `UserPublicDto` y `AuthResponseDto { token, user, message? }`
    - _Requisitos: 1.1_

- [x] 3. Crear interfaces
  - [x] 3.1 Crear `Backend/src/interfaces/IUserRepository.ts` con los métodos `findByEmail`, `findByUsername` y `create`
    - _Requisitos: 2.1_
  - [x] 3.2 Crear `Backend/src/interfaces/IAuthService.ts` con los métodos `register` y `login`
    - _Requisitos: 2.2_
  - [x] 3.3 Crear `Backend/src/interfaces/IHashService.ts` con los métodos `hash` y `compare`
    - _Requisitos: 2.3_
  - [x] 3.4 Crear `Backend/src/interfaces/ITokenService.ts` con `TokenPayload` y los métodos `sign` y `verify`
    - _Requisitos: 2.4_
  - [x] 3.5 Crear `Backend/src/interfaces/IController.ts` con el método `handle(req: Request, res: Response): Promise<void>`
    - _Requisitos: 2.5_

- [x] 4. Crear `UserEntity`
  - [x] 4.1 Crear `Backend/src/entities/UserEntity.ts` con atributos `private readonly _id`, `_username`, `_email`, `_passwordHash` y sus getters públicos `id`, `username`, `email`, `passwordHash`
    - Verificar que ningún atributo tiene modificador `public` ni puede ser reasignado desde fuera de la clase
    - _Requisitos: 3.1_

- [x] 5. Migrar configuración de base de datos a TypeScript
  - [x] 5.1 Crear `Backend/src/config/db.ts` que exporte la función `connectDB(): Promise<Sequelize | null>` leyendo `DB_USE_SQLITE` para elegir SQLite o PostgreSQL según las variables de entorno
    - Mantener comportamiento idéntico al `Backend/config/db.js` actual para no romper el servidor
    - _Requisitos: 11.5_

- [x] 6. Migrar modelos Sequelize a TypeScript
  - [x] 6.1 Crear `Backend/src/models/user.ts` usando `ModelDefined<UserAttributes, UserCreationAttributes>` de Sequelize con los campos `id`, `username`, `email`, `password`, `createdAt`, `updatedAt`
    - _Requisitos: 1.5_
  - [x] 6.2 Crear `Backend/src/models/index.ts` que inicialice el modelo `User` con la instancia de Sequelize y lo exporte como `db.User`
    - La firma de exportación debe ser compatible con la que usa `SequelizeUserRepository`
    - _Requisitos: 1.5_

- [x] 7. Implementar `SequelizeUserRepository`
  - [x] 7.1 Crear `Backend/src/repositories/SequelizeUserRepository.ts` implementando `IUserRepository`
    - Declarar `userModel` como `private readonly`; recibirlo por constructor
    - Implementar `findByEmail`, `findByUsername` y `create` devolviendo instancias de `UserEntity`
    - _Requisitos: 1.5, 2.1, 3.3_
  - [x] 7.2 Escribir tests unitarios para `SequelizeUserRepository` en `Backend/src/__tests__/unit/sequelizeUserRepository.unit.test.ts`
    - Mockear el modelo Sequelize para probar los tres métodos sin base de datos real
    - _Requisitos: 1.5_

- [x] 8. Implementar `BcryptHashService`
  - [x] 8.1 Crear `Backend/src/services/BcryptHashService.ts` implementando `IHashService`
    - Declarar `saltRounds` como `private readonly`; recibirlo por constructor (default 10)
    - _Requisitos: 2.3, 3.2, 7.5_

- [x] 9. Implementar `JwtTokenService`
  - [x] 9.1 Crear `Backend/src/services/JwtTokenService.ts` implementando `ITokenService`
    - Declarar `secret` y `expiresIn` como `private readonly`
    - Lanzar `Error` en el constructor si `secret` está vacío o indefinido (validación de `JWT_SECRET`)
    - _Requisitos: 2.4, 3.2, 7.6, 7.7_
  - [x] 9.2 Escribir test unitario para el arranque fallido en `Backend/src/__tests__/unit/jwtTokenService.unit.test.ts`
    - Verificar que `new JwtTokenService('')` lanza error con mensaje descriptivo
    - _Requisitos: 7.7_

- [x] 10. Implementar `AuthService`
  - [x] 10.1 Crear `Backend/src/services/AuthService.ts` implementando `IAuthService`
    - Declarar `repository`, `hashService` y `tokenService` como `private readonly`; inyectarlos por constructor
    - Implementar `register`: validar campos, verificar duplicados por email y username (en ese orden), hashear contraseña, persistir, firmar token
    - Implementar `login`: validar campos, buscar usuario, comparar hash, firmar token — devolver `'Credenciales inválidas.'` con HTTP 401 sin revelar existencia del usuario
    - Exportar clase `AuthError extends Error` con `statusCode: number`
    - El servicio NO importa ningún modelo Sequelize ni `bcrypt` ni `jwt` directamente
    - _Requisitos: 1.3, 1.4, 2.6, 3.2, 7.1–7.7, 8.1–8.5_
  - [x] 10.2 Escribir tests unitarios en `Backend/src/__tests__/unit/authService.unit.test.ts`
    - Casos concretos: campos faltantes en register (400), email duplicado (409), username duplicado (409), login sin username/email (400), login sin password (400), credenciales inválidas (401)
    - Usar mocks para `IUserRepository`, `IHashService` e `ITokenService`
    - _Requisitos: 7.2–7.4, 8.2–8.4_

- [x] 11. Implementar controladores HTTP
  - [x] 11.1 Crear `Backend/src/controllers/RegisterController.ts` implementando `IController`
    - Declarar `authService` como `private readonly`; inyectarlo por constructor de tipo `IAuthService`
    - El método `handle` no contiene lógica de negocio: solo llama a `authService.register(req.body)`, maneja `AuthError` con el `statusCode` correspondiente y errores genéricos con HTTP 500
    - _Requisitos: 1.3, 2.5, 3.2_
  - [x] 11.2 Crear `Backend/src/controllers/LoginController.ts` implementando `IController`
    - Misma estructura que `RegisterController` pero delegando a `authService.login(req.body)`, respondiendo con HTTP 200 en caso de éxito
    - _Requisitos: 1.3, 2.5, 3.2_
  - [x] 11.3 Escribir tests unitarios en `Backend/src/__tests__/unit/registerController.unit.test.ts` y `loginController.unit.test.ts`
    - Mockear `IAuthService`; verificar códigos de estado HTTP correctos para cada caso
    - _Requisitos: 1.3_

- [x] 12. Crear Composition Root Auth
  - [x] 12.1 Crear `Backend/src/routes/authRoutes.ts` como único punto donde se instancian todas las clases concretas del módulo Auth
    - Orden de construcción: `SequelizeUserRepository` → `BcryptHashService` + `JwtTokenService` → `AuthService` → `RegisterController` + `LoginController`
    - Registrar `POST /register` y `POST /login` usando `(req, res) => ctrl.handle(req, res)`
    - No importar implementaciones concretas fuera de este archivo en las capas Controller/Service/Repository
    - _Requisitos: 6.1, 6.2, 6.3, 6.4_

- [x] 13. Punto de control — Verificar módulo Auth
  - Ejecutar `npx tsc --noEmit` y confirmar que no hay errores en los archivos de Auth creados hasta aquí.
  - Ejecutar `npx jest --runInBand --testPathPattern="__tests__/unit"` y confirmar que todos los tests unitarios pasan.

- [x] 14. Implementar `BaseEventHandler`
  - [x] 14.1 Crear `Backend/src/socket/BaseEventHandler.ts` con la clase abstracta `BaseEventHandler`
    - Exportar interfaces auxiliares: `Player`, `GameState`, `Room`, `RoomMap`
    - Declarar `io: Server` y `rooms: RoomMap` como `protected readonly`; inyectarlos por constructor
    - Declarar método abstracto `registerEvents(socket: Socket): void`
    - Implementar `protected emitToRoom(code, event, data): void` usando `this.io.to(code).emit`
    - Implementar `protected getRoomOrFail(code): Room | null` usando `this.rooms.get(code) ?? null`
    - _Requisitos: 3.4, 4.1, 4.2_

- [x] 15. Implementar `RoomEventHandler`
  - [x] 15.1 Crear `Backend/src/socket/RoomEventHandler.ts` extendiendo `BaseEventHandler`
    - Implementar `registerEvents` con los manejadores de `create_room`, `join_room` y `disconnect`
    - `create_room`: generar código único de 6 dígitos, registrar sala en `this.rooms`, unir socket, emitir `room_created`
    - `join_room`: validar código, verificar capacidad (máx. 2), agregar guest, emitir `player_joined` y `game_start` si hay 2 jugadores
    - `disconnect`: eliminar jugador; si sala vacía eliminarla del mapa; si queda un jugador emitir `player_left`
    - Usar `socket as Socket & { roomCode?: string; playerRole?: string }` para las propiedades extendidas
    - _Requisitos: 4.3, 4.6, 9.1–9.5_

- [x] 16. Implementar `GameEventHandler`
  - [x] 16.1 Crear `Backend/src/socket/GameEventHandler.ts` extendiendo `BaseEventHandler`
    - Implementar `registerEvents` con los manejadores de `game_event` y `end_turn`
    - `game_event`: reenviar payload a `socket.to(code)` sin modificarlo; retornar silenciosamente si no hay sala válida
    - `end_turn`: alternar `currentTurn` (host→guest, guest→host), incrementar `turnNumber` en 1, emitir `turn_changed`; retornar silenciosamente si no hay sala válida
    - _Requisitos: 4.4, 4.6, 10.1–10.3_

- [x] 17. Actualizar `src/server.ts` (Composition Root Socket)
  - [x] 17.1 Reescribir `Backend/src/server.ts` en TypeScript aplicando la estructura del diseño
    - Validar `process.env.JWT_SECRET` al inicio y lanzar error explícito si no está definido (antes de `startServer`)
    - Importar `connectDB` desde `./config/db`
    - Construir `rooms: RoomMap` compartido e instanciar `handlers: BaseEventHandler[]` con `[new RoomEventHandler(io, rooms), new GameEventHandler(io, rooms)]`
    - Iterar sobre `handlers` e invocar `handler.registerEvents(socket)` polimórficamente dentro de `io.on('connection', ...)`
    - Mantener soporte para HTTP/HTTPS y lógica de CORS existente
    - _Requisitos: 5.1, 5.2, 5.3, 6.1, 7.7_

- [x] 18. Punto de control — Verificar compilación completa
  - Ejecutar `npx tsc --noEmit` sobre todo el proyecto y confirmar cero errores TypeScript.
  - Confirmar que `node dist/server.js` (tras `npm run build`) levanta el servidor sin errores.

- [x] 19. Escribir property tests con fast-check
  - [x] 19.1 Crear `Backend/src/__tests__/property/hashService.property.test.ts` — Propiedad 1: Round-Trip Hash/Verify
    - Para todo `plain: string` no vacío (`fc.string({ minLength: 1 })`): `hash(plain) !== plain` Y `compare(plain, hash(plain)) === true`
    - Mínimo 100 iteraciones (`numRuns: 100`)
    - Tag: `// Feature: backend-solid-refactor, Propiedad 1: round-trip hash/verify`
    - _Requisitos: 7.5 — Propiedad 1_
  - [x] 19.2 Crear `Backend/src/__tests__/property/tokenService.property.test.ts` — Propiedad 2: Round-Trip Firma/Verificación JWT
    - Para todo payload `{ id: fc.integer(), username: fc.string({minLength:1}), email: fc.string({minLength:1}) }`: `verify(sign(payload))` devuelve objeto con los mismos `id`, `username`, `email`
    - Tag: `// Feature: backend-solid-refactor, Propiedad 2: round-trip firma/verificación JWT`
    - _Requisitos: 7.6, 8.5 — Propiedad 2_
  - [x] 19.3 Crear `Backend/src/__tests__/property/roomEventHandler.property.test.ts` — Propiedades 3 y 4
    - **Propiedad 3**: Tras N llamadas a `create_room` (N generado con `fc.integer({ min: 1, max: 50 })`), el mapa contiene exactamente N entradas con códigos únicos que cumplen `/^\d{6}$/`
    - **Propiedad 4**: Para toda sala con 2 jugadores, cualquier intento de `join_room` recibe `{ success: false, message: 'Sala llena.' }` y `players.length` permanece en 2
    - Tags para cada propiedad
    - _Requisitos: 9.1, 9.4 — Propiedades 3 y 4_
  - [x] 19.4 Crear `Backend/src/__tests__/property/gameEventHandler.property.test.ts` — Propiedad 5: Alternancia de Turno
    - Para todo N ≥ 1 (`fc.integer({ min: 1, max: 200 })`): tras N llamadas a `end_turn`, `currentTurn` alterna estrictamente entre `'host'` y `'guest'`, y `turnNumber === N`
    - Tag: `// Feature: backend-solid-refactor, Propiedad 5: alternancia de turno`
    - _Requisitos: 10.2 — Propiedad 5_
  - [x] 19.5 Crear `Backend/src/__tests__/property/authService.property.test.ts` — Propiedades 6 y 7
    - **Propiedad 6**: Para todo `LoginDto` donde el usuario no existe en el repositorio mock, `authService.login(dto)` lanza `AuthError` con `statusCode === 401` y `message === 'Credenciales inválidas.'` sin modificar el estado del repositorio
    - **Propiedad 7**: Para todo `RegisterDto` válido (campos no vacíos, sin duplicados en mock), `authService.register(dto)` devuelve `AuthResponseDto` cuyo `token` es verificable por `tokenService.verify` y cuyos `user.username` y `user.email` coinciden con el DTO
    - Tags para cada propiedad
    - _Requisitos: 8.4, 7.1 — Propiedades 6 y 7_

- [x] 20. Generar `Backend/ARQUITECTURA.md`
  - [x] 20.1 Crear `Backend/ARQUITECTURA.md` con las tres secciones requeridas:
    - **Sección 1**: Diagrama de arquitectura en capas (Entities → Repositories → Services → Controllers + capa Socket) en sintaxis Mermaid, copiado y adaptado del diagrama del `design.md`
    - **Sección 2**: Diagrama de clases UML en sintaxis Mermaid mostrando interfaces, clases concretas, jerarquía `BaseEventHandler → RoomEventHandler / GameEventHandler` y flechas de dependencia entre capas
    - **Sección 3**: Descripción del flujo de `POST /api/auth/register` desde el cliente hasta la base de datos, nombrado cada capa y el principio SOLID aplicado
    - _Requisitos: 12.1, 12.2, 12.3_

- [x] 21. Verificación final
  - [x] 21.1 Ejecutar `npx tsc --noEmit` en `Backend/` y confirmar salida sin errores
    - _Requisitos: 11.2_
  - [x] 21.2 Ejecutar `npx jest --runInBand --passWithNoTests` en `Backend/` y confirmar que todos los tests (unitarios y de propiedades) pasan
    - _Requisitos: 11.2_
  - [x] 21.3 Verificar que los contratos públicos del frontend no se han modificado: `POST /api/auth/register`, `POST /api/auth/login`, `create_room`, `join_room`, `game_event`, `end_turn` mantienen sus firmas originales
    - _Requisitos: 11.4_

---

## Notas

- Las subtareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido; las tareas no marcadas son obligatorias.
- Cada tarea referencia los requisitos específicos del `requirements.md` para trazabilidad.
- Los puntos de control (tareas 13, 18 y 21) validan la compilación incremental antes de continuar.
- Los property tests usan `fast-check` con `numRuns: 100` como mínimo; los mocks de repositorio y servicios se crean en cada test para aislar la lógica pura.
- El archivo `Backend/src/show-network-info.ts` (migración de `show-network-info.js`) puede crearse como parte de la tarea 17.1 si TypeScript lo requiere para compilar `server.ts`.
- El frontend (`Frontend/`) no se toca en ninguna tarea.

---

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3"] },
    { "id": 1, "tasks": ["2.1", "2.2", "2.3"] },
    { "id": 2, "tasks": ["3.1", "3.2", "3.3", "3.4", "3.5"] },
    { "id": 3, "tasks": ["4.1", "5.1"] },
    { "id": 4, "tasks": ["6.1", "6.2"] },
    { "id": 5, "tasks": ["7.1", "8.1", "9.1"] },
    { "id": 6, "tasks": ["7.2", "9.2", "10.1"] },
    { "id": 7, "tasks": ["10.2", "11.1", "11.2"] },
    { "id": 8, "tasks": ["11.3", "12.1"] },
    { "id": 9, "tasks": ["14.1"] },
    { "id": 10, "tasks": ["15.1", "16.1"] },
    { "id": 11, "tasks": ["17.1"] },
    { "id": 12, "tasks": ["19.1", "19.2", "19.3", "19.4", "19.5", "20.1"] },
    { "id": 13, "tasks": ["21.1", "21.2", "21.3"] }
  ]
}
```
