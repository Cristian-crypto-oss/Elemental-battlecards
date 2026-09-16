/**
 * Guión de Exposición para Cristian Rafael Vargas — Ficha 3172526
 * Mapeado directamente a cada una de las 10 diapositivas del PDF
 */
window.speakerNotes = {
  1: `<blockquote>"Buenos días / tardes instructor Andrés Moreno. Mi nombre es Cristian Rafael Vargas de la ficha 3172526 de ADSO. Hoy presento la sustentación técnica de la refactorización arquitectónica del backend de Elemental Battlecards. Aplicamos de forma rigurosa los cuatro pilares de POO y los cinco principios SOLID bajo estándares empresariales con TypeScript, garantizando bajo acoplamiento y alta testeabilidad."</blockquote>
      <span class="badge-ide-tag">⏱️ 30 seg · Énfasis: Presentación formal y profesional</span>`,

  2: `<blockquote>"Esta sustentación se rige bajo el protocolo oficial de la guía en tres fases: en los primeros 5 minutos defenderé la arquitectura y el diagrama UML; en los siguientes 10 minutos auditaremos directamente el código en el IDE evidenciando Polimorfismo, SRP y DIP; y en los últimos 5 minutos resolveremos escenarios de escalabilidad demostrando que la arquitectura cumple OCP y no colapsa."</blockquote>
      <span class="badge-ide-tag">⏱️ 45 seg · Mostrar protocolo oficial de 20 minutos</span>`,

  3: `<blockquote>"Organizamos el backend en capas verticales con responsabilidades estrictas: Controllers, Services, Repositories, Interfaces/DTOs y Entities. Las dependencias siempre viajan hacia las abstracciones. Si cambiamos la base de datos de SQLite a MongoDB, los servicios no se enteran. Todo el acoplamiento concreto se aísla en los Composition Roots: authRoutes.ts y server.ts."</blockquote>
      <span class="badge-ide-tag">⏱️ 1 min · Señalar: capas escalonadas 1 al 5</span>`,

  4: `<blockquote>"En el diagrama UML evidenciamos que ninguna clase concreta de negocio depende de otra clase concreta. AuthService solo tiene flechas de asociación hacia interfaces: IUserRepository, IHashService e ITokenService. Y en WebSockets, RoomEventHandler y GameEventHandler extienden a BaseEventHandler cumpliendo el principio de Sustitución de Liskov."</blockquote>
      <span class="badge-ide-tag">⏱️ 1 min · Señalar: 5 interfaces segregadas</span>`,

  5: `<blockquote>"Aquí evidenciamos Abstracción y Encapsulamiento con código exacto: IHashService es una abstracción pura que define el qué (hash y compare) sin mencionar bcrypt ni algoritmos. Y en UserEntity, todos los atributos son private readonly con solo getters: la entidad es 100% inmutable y nadie externo puede mutar el estado del usuario."</blockquote>
      <span class="badge-ide-tag">⏱️ 1 min · Archivos: src/interfaces/IHashService.ts y src/entities/UserEntity.ts</span>`,

  6: `<blockquote>"Para la auditoría de Polimorfismo en vivo, abrimos src/server.ts líneas 63 a 72. El array handlers tiene tipo estático BaseEventHandler[]. En runtime contiene RoomEventHandler y GameEventHandler. Cuando llamamos handler.registerEvents(socket), el motor despacha polimórficamente el método propio de cada subclase sin necesidad de ifs ni switch. Mismo método, comportamientos completamente distintos."</blockquote>
      <span class="badge-ide-tag">⏱️ 1 min 15 seg · Archivo clave: src/server.ts</span>`,

  7: `<blockquote>"Para auditar SRP, mostramos la cadena en tres capas: RegisterController solo cambia si cambia el protocolo HTTP; AuthService solo cambia si cambian las reglas de negocio; y SequelizeUserRepository es la única clase que sabe de consultas SQL y Sequelize. Ninguna invade el terreno de la otra: cada clase tiene exactamente una sola razón para cambiar."</blockquote>
      <span class="badge-ide-tag">⏱️ 1 min 30 seg · Archivos: RegisterController -> AuthService -> SequelizeUserRepository</span>`,

  8: `<blockquote>"Aquí está el principio DIP y la regla de bajo acoplamiento: AuthService recibe sus dependencias como interfaces en el constructor. No crea instancias con new. Y el único lugar en todo el backend donde se ensamblan las clases con new es el Composition Root: src/routes/authRoutes.ts. No hay instanciación manual en clases de negocio."</blockquote>
      <span class="badge-ide-tag">⏱️ 1 min 30 seg · Archivos: src/services/AuthService.ts y src/routes/authRoutes.ts</span>`,

  9: `<blockquote>"Demostramos OCP, LSP e ISP: para cambiar bcrypt por Argon2 no tocamos AuthService, solo cambiamos 1 línea en authRoutes. LSP se demuestra porque en los tests sustituimos SequelizeUserRepository por un mock en memoria y los 38 tests pasan sin errores. E ISP se evidencia en nuestras 5 interfaces pequeñas y especializadas en vez de una interfaz monolítica."</blockquote>
      <span class="badge-ide-tag">⏱️ 1 min · Señalar: 5 interfaces, 38 tests, 1 línea a cambiar</span>`,

  10: `<blockquote>"En la Fase 3 de escalabilidad respondemos con confianza: si piden Google OAuth, creamos GoogleAuthService implements IAuthService; si piden MongoDB, creamos MongoUserRepository implements IUserRepository; y si piden Chat o Torneos, creamos TournamentEventHandler extends BaseEventHandler y lo agregamos al array handlers de server.ts. En todos los casos el código existente permanece cerrado a modificaciones (OCP)."</blockquote>
      <span class="badge-ide-tag">⏱️ 1 min 30 seg · Cierre de la sustentación y pase a preguntas</span>`
};
