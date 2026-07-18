# Configuración del Formulario de Registro

## Componentes Creados

### 1. **RegisterForm.vue**
Nuevo componente de formulario de registro con diseño premium.

**Ubicación**: `src/components/RegisterForm.vue`

**Características**:
- Campos: Usuario, Email, Contraseña, Confirmar Contraseña
- Validación completa de formulario
- Toggle de visualización de contraseña
- Integración con API de registro
- Gestión de errores
- Estado de carga (isLoading)
- Enlace para volver al login

**Props/Emits**:
- `@register-success`: Emitido cuando el registro es exitoso
- `@login-click`: Emitido cuando hace clic en "INICIAR SESIÓN"

### 2. **AuthContainer.vue** (Opcional)
Componente wrapper que maneja transiciones entre Login y Register.

**Ubicación**: `src/components/AuthContainer.vue`

**Características**:
- Transición fade entre componentes
- Gestión centralizada de estado (showRegister)
- Emit de eventos consolidados

## Integración en App.vue

El flujo ya está configurado en `App.vue`:

```javascript
// El estado currentScreen controla qué formulario mostrar
- 'login' → Muestra LoginForm
- 'register' → Muestra RegisterForm
- 'menu' → Menú principal
- 'create-room' → Modal de crear sala
- 'game' → Juego
```

## Flujo de Autenticación

1. **Usuario abre la app** → Ve LoginForm
2. **Hace clic en "CREAR CUENTA"** → Cambia a RegisterForm
3. **Completa registro** → Vuelve a LoginForm automáticamente
4. **Hace login** → Va al MainMenu

## Validaciones en RegisterForm

✓ Usuario no vacío
✓ Email válido (regex)
✓ Contraseña mínimo 6 caracteres
✓ Las contraseñas coinciden
✓ Email y usuario no duplicados (servidor)

## Estilos Aplicados

- **Paleta de colores**: Oro (#F2CA50, #D4AF37), Gris oscuro (#121414, #0D0E0F)
- **Tipografía**: 
  - Títulos: Libre Caslon Text
  - Labels y botones: Hanken Grotesk
- **Efectos visuales**: 
  - Backdrop blur
  - Radial gradients
  - Sombras inset/outset
  - Transiciones suaves

## API Endpoint Esperado

```
POST /api/auth/register
Body: {
  username: string,
  email: string,
  password: string
}
Response: {
  token: string,
  user: object,
  ...
}
```

## Próximos Pasos

1. Verificar que el endpoint de registro está configurado en el Backend
2. Implementar validación de email único en la BD
3. Implementar validación de usuario único en la BD
4. (Opcional) Agregar confirmación de email
5. (Opcional) Agregar CAPTCHA

## Modo de Uso

El usuario actual puede navegar entre Login y Register directamente desde la UI:
- En LoginForm: Botón "CREAR CUENTA"
- En RegisterForm: Botón "INICIAR SESIÓN"

## Testing

Para probar el flujo:

1. Abre la app en http://localhost:5173/
2. Haz clic en "CREAR CUENTA"
3. Completa el formulario con datos válidos
4. Observa la validación y el envío
5. Deberías ser redirigido al login automáticamente

---

**Fecha**: 17/07/2026
**Versión**: 1.0.0
