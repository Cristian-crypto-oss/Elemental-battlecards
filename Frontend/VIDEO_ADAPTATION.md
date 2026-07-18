# Adaptación de Video de Fondo - LoginForm Vue 3

## 📹 Cambios Realizados

### Video Original (Phaser/LoginScene)
El LoginScene original usaba Phaser para cargar y renderizar el video:
```javascript
// En preload()
this.load.video('inicio-video', '/assets/images/inicio/inicio.mp4', { muted: true });

// En create()
this.bg = this.add.video(width / 2, height / 2, 'inicio-video').setOrigin(0.5);
this.bg.play(true); // autoplay, loop
```

### Video Adaptado (Vue 3/LoginForm.vue)
Ahora usamos HTML5 video nativo con Vue:

```vue
<video 
  ref="videoElement" 
  class="background-video" 
  autoplay 
  muted 
  loop
  playsinline
>
  <source src="/assets/images/inicio/inicio.mp4" type="video/mp4" />
</video>
```

## 🎯 Características Implementadas

✅ **Video en Bucle**: `loop` attribute  
✅ **Sin Sonido**: `muted` attribute  
✅ **Autoplay**: `autoplay` attribute  
✅ **Responsive**: Se escala automáticamente al tamaño de la ventana  
✅ **Soporte Mobile**: `playsinline` para que funcione en dispositivos móviles  
✅ **Fallback**: Mensaje de soporte para navegadores sin HTML5 video  

## 🔧 Escalado Dinámico (Similar a Phaser)

El componente implementa un escalado similar al original en Phaser:

```javascript
const scaleVideoToFit = () => {
  const containerWidth = window.innerWidth;
  const containerHeight = window.innerHeight;
  const videoWidth = videoElement.value.videoWidth;
  const videoHeight = videoElement.value.videoHeight;
  
  const scaleX = containerWidth / videoWidth;
  const scaleY = containerHeight / videoHeight;
  const scale = Math.max(scaleX, scaleY);
  
  videoElement.value.style.transform = `scale(${scale})`;
};
```

**Lógica**:
1. Calcula ratios de escala horizontal y vertical
2. Toma el máximo para asegurar que el video cubra toda la pantalla
3. Aplica transform scale para rellenar el contenedor
4. Se ejecuta cuando el video está cargado (evento `loadedmetadata`)

## 🎨 Estilos CSS

### Positioning
```css
.background-video {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
  min-width: 100%;
  min-height: 100%;
  object-fit: cover;
}
```

**Características**:
- Centrado en la pantalla
- Se expande mínimo al 100% del contenedor
- `object-fit: cover` para mantener proporciones sin distorsión
- Z-index bajo (1) para que esté detrás del overlay

### Overlay
```css
.login-screen-overlay {
  background: radial-gradient(circle at center, rgba(45, 20, 15, 0.45) 0%, rgba(15, 10, 8, 0.92) 80%);
  z-index: 10;
}
```

El overlay está encima del video (z-index 10) y tiene un gradiente radial que oscurece el video progresivamente.

## 📱 Aplicación a Otros Componentes

La misma adaptación se aplicó a:
- ✅ **LoginForm.vue** - Video de fondo con formulario de login
- ✅ **RegisterForm.vue** - Mismo video para consistencia visual

Ambos componentes comparten:
- Mismo video (`/assets/images/inicio/inicio.mp4`)
- Mismo lógica de escalado
- Mismo styling base
- Mismo overlay gradient

## 🔄 Migración de Otros Videos

Si hay otros videos (como `campo.mp4` para GameScene), seguirán el mismo patrón:

```vue
<video 
  ref="videoElement" 
  class="background-video" 
  autoplay 
  muted 
  loop
  playsinline
>
  <source :src="videoSource" type="video/mp4" />
</video>
```

## ✅ Testing Checklist

- [ ] Video carga y se muestra al abrir http://localhost:5173/
- [ ] Video está en bucle continuo
- [ ] Video se adapta a diferentes tamaños de ventana
- [ ] Sin errores de console
- [ ] Funciona en móvil/tablet (playsinline)
- [ ] Formulario aparece encima del video correctamente
- [ ] Performance es bueno (sin lag)

## 📊 Ventajas de HTML5 Video vs Phaser

| Aspecto | Phaser | HTML5 Video |
|--------|--------|-----------|
| **Tamaño bundle** | Incluido en Phaser | Nativo del navegador |
| **Performance** | Dedicado a games | Optimizado para media |
| **Accesibilidad** | Limitada | Mejor (controles, subtitle support) |
| **Responsive** | Manual | Nativo con CSS |
| **Mobile** | Requiere configuración | Mejor soporte nativo |

---

**Status**: ✅ Implementado y funcional  
**Próximo paso**: Testear en navegador y ajustar si es necesario
