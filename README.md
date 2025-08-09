# Sistema de Asistencia con Firebase

Una aplicación web moderna para registrar y gestionar la asistencia diaria de participantes en ensayos de paradas universitarias con funcionalidad de códigos QR y base de datos en tiempo real.

## 🚀 Características

### ✨ Funcionalidades Principales
- **Dashboard Interactivo**: Resumen visual de estadísticas de asistencia en tiempo real
- **Gestión de Participantes**: Agregar, editar y eliminar participantes de la parada universitaria
- **Registro de Asistencia**: Manual y por código QR para ensayos
- **Códigos QR**: Generación automática para cada participante
- **Escáner QR**: Registro rápido usando la cámara del dispositivo
- **Reportes**: Estadísticas detalladas por período de ensayos
- **Exportación de Datos**: CSV y JSON
- **Tema Oscuro/Claro**: Interfaz adaptable
- **Diseño Responsivo**: Compatible con móviles y tablets
- **Base de Datos en Tiempo Real**: Sincronización automática entre dispositivos

### 📱 Tecnologías Utilizadas
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Base de Datos**: Firebase Firestore (NoSQL en tiempo real)
- **Librerías QR**: 
  - `qrcode.js` para generar códigos QR
  - `qr-scanner.js` para escanear códigos QR
- **Iconos**: Font Awesome
- **Diseño**: CSS Grid, Flexbox, Variables CSS

## 🛠️ Configuración e Instalación

### Paso 1: Configurar Firebase

#### 1.1 Crear Proyecto Firebase
1. Ve a la [Consola de Firebase](https://console.firebase.google.com/)
2. Haz clic en "Crear un proyecto"
3. Nombra tu proyecto (ej. "asistencia-universitaria")
4. Configura Google Analytics (opcional)
5. Haz clic en "Crear proyecto"

#### 1.2 Configurar Firestore
1. En el menú lateral, selecciona "Firestore Database"
2. Haz clic en "Crear base de datos"
3. Selecciona "Iniciar en modo de prueba"
4. Elige la ubicación del servidor
5. Haz clic en "Habilitar"

#### 1.3 Configurar Reglas de Seguridad
En la pestaña "Reglas" de Firestore, usa estas reglas para desarrollo:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read and write access to all documents
    // WARNING: These rules allow anyone to read and write to your database.
    // This is for development purposes only.
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**⚠️ IMPORTANTE**: Estas reglas son para desarrollo. Para producción, implementa reglas más restrictivas.

#### 1.4 Registrar Aplicación Web
1. En la página principal del proyecto, haz clic en el icono web (</>)
2. Registra tu aplicación con un nombre
3. Copia la configuración de Firebase que se muestra

### Paso 2: Configurar la Aplicación

#### 2.1 Actualizar Configuración Firebase
Edita el archivo `js/firebase-service.js` y reemplaza la configuración con la tuya:

```javascript
const firebaseConfig = {
  apiKey: "tu-api-key",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto-id",
  storageBucket: "tu-proyecto.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "tu-app-id"
};
```

#### 2.2 Estructura de Datos en Firestore
La aplicación crea automáticamente estas colecciones:

**Colección `employees`:**
```json
{
  "name": "Ana Quispe",
  "department": "Danza Folklórica",
  "position": "Bailarina Principal",
  "createdAt": "2025-08-09T14:00:00.000Z"
}
```

**Colección `attendance`:**
```json
{
  "employeeId": "employee-doc-id",
  "date": "2025-08-09",
  "status": "present", // "present", "absent", "late"
  "time": "14:00",
  "notes": "Ensayo de Wifalas",
  "timestamp": "2025-08-09T14:00:00.000Z"
}
```

### Paso 3: Despliegue

#### Opción 1: Uso Local
1. Descarga todos los archivos del proyecto
2. Abre `index.html` en tu navegador web
3. ¡La aplicación funcionará con Firebase!

#### Opción 2: GitHub Pages
1. Sube todos los archivos a un repositorio de GitHub
2. Activa GitHub Pages en la configuración del repositorio
3. Tu aplicación estará disponible en: `https://tu-usuario.github.io/nombre-repositorio`

## 📖 Guía de Uso

### 1. Dashboard
- **Estadísticas en Tiempo Real**: Total de participantes, presentes, ausentes y tardanzas
- **Lista del Día**: Estado actual de todos los participantes
- **Sincronización Automática**: Los datos se actualizan en tiempo real

### 2. Gestión de Participantes
- **Agregar Participante**: Nombre, departamento (ej. "Danza Folklórica") y cargo (ej. "Bailarina Principal")
- **Editar Información**: Modificar datos existentes
- **Generar QR**: Código único para cada participante
- **Eliminar**: Remover participante y sus registros

### 3. Registro de Asistencia
- **Manual**: Seleccionar participante, estado y hora
- **Por QR**: Escanear código del participante
- **Estados**: Presente, Ausente, Tardanza
- **Notas**: Comentarios opcionales (ej. "Ensayo de Wifalas")

### 4. Escáner QR
- **Activar Cámara**: Permitir acceso a la cámara
- **Escanear**: Apuntar al código QR del participante
- **Registro Automático**: Marca asistencia instantáneamente
- **Detección de Tardanzas**: Automática basada en horario configurado

### 5. Reportes
- **Período Personalizado**: Seleccionar rango de fechas
- **Estadísticas Detalladas**: Por participante y general
- **Exportación**: Descargar en formato CSV

## 🔧 Configuración Avanzada

### Horarios de Ensayo
La aplicación permite configurar:
- **Hora de Inicio**: Por defecto 14:00 (2:00 PM)
- **Tolerancia para Tardanzas**: Por defecto 15 minutos
- **Tema**: Claro u oscuro

### Datos de Ejemplo
Al cargar por primera vez, la aplicación incluye participantes de ejemplo:
- **Ana Quispe** - Danza Folklórica - Bailarina Principal
- **Carlos Mamani** - Música Tradicional - Músico (Zampoña)
- **María Condori** - Danza Folklórica - Coreógrafa
- **José Huanca** - Música Tradicional - Músico (Bombo)
- **Rosa Choque** - Vestuario - Coordinadora de Trajes

### Backup y Restauración
- **Exportar**: Descarga todos los datos en formato JSON
- **Importar**: Restaura datos desde archivo JSON
- **Sincronización**: Los datos se sincronizan automáticamente entre dispositivos

## 📱 Compatibilidad

### Navegadores Soportados
- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 11+
- ✅ Edge 79+

### Dispositivos
- ✅ Escritorio (Windows, macOS, Linux)
- ✅ Tablets (iOS, Android)
- ✅ Móviles (iOS, Android)

### Funcionalidad QR
- **Generación**: Funciona en todos los navegadores
- **Escáner**: Requiere HTTPS en producción (GitHub Pages lo proporciona automáticamente)
- **Cámara**: Necesita permisos del usuario

## 🔒 Privacidad y Seguridad

### Datos en Firebase
- **Almacenamiento**: Datos seguros en servidores de Google
- **Sincronización**: Tiempo real entre dispositivos
- **Backup**: Automático por Firebase
- **Acceso**: Controlado por reglas de seguridad

### Recomendaciones de Seguridad
- **Reglas de Producción**: Implementar autenticación para uso real
- **HTTPS**: Siempre usar conexiones seguras
- **Permisos**: Solo acceso a cámara cuando se solicita

## 🚨 Solución de Problemas

### Firebase No Conecta
1. **Verificar Configuración**: Revisar `firebaseConfig` en `firebase-service.js`
2. **Reglas de Firestore**: Asegurar que permiten lectura/escritura
3. **Consola del Navegador**: Revisar errores en F12

### El Escáner QR No Funciona
1. **HTTPS**: GitHub Pages usa HTTPS automáticamente
2. **Permisos de Cámara**: Permitir acceso en el navegador
3. **Navegador Compatible**: Usar versión actualizada

### Datos No Se Sincronizan
1. **Conexión a Internet**: Verificar conectividad
2. **Reglas de Firebase**: Revisar permisos en Firestore
3. **Consola de Firebase**: Verificar que los datos lleguen a la base

## 📊 Estructura del Proyecto

```
attendance-app/
├── index.html              # Página principal
├── css/
│   └── style.css           # Estilos principales
├── js/
│   ├── app.js              # Controlador principal
│   ├── storage.js          # Gestión de datos (adaptado para Firebase)
│   ├── firebase-service.js # Servicio de Firebase
│   ├── qr-handler.js       # Funcionalidad QR
│   └── utils.js            # Utilidades
├── README.md               # Documentación
├── DEPLOY.md               # Guía de despliegue
└── FIREBASE.md             # Configuración de Firebase
```

## 🔄 Migración desde LocalStorage

Si tienes datos en la versión anterior (LocalStorage), puedes:
1. **Exportar** datos desde la versión anterior
2. **Importar** en la nueva versión con Firebase
3. Los datos se migrarán automáticamente a Firestore

## 🤝 Contribuciones

### Cómo Contribuir
1. Fork del repositorio
2. Crear rama para nueva funcionalidad
3. Realizar cambios y pruebas
4. Enviar Pull Request

### Ideas para Mejoras
- [ ] Autenticación de usuarios
- [ ] Notificaciones push
- [ ] Reportes avanzados con gráficos
- [ ] Integración con calendarios
- [ ] Modo offline con sincronización

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Puedes usarlo libremente para proyectos personales y comerciales.

## 📞 Soporte

Si encuentras algún problema o tienes sugerencias:
1. Revisa la sección de **Solución de Problemas**
2. Verifica la configuración de Firebase
3. Crea un **Issue** en GitHub
4. Proporciona detalles del navegador y dispositivo

---

**¡Gracias por usar el Sistema de Asistencia con Firebase!** 🎉

**Ideal para**: Paradas universitarias, grupos de danza folklórica, ensayos musicales, organizaciones estudiantiles y cualquier grupo que necesite llevar control de asistencia de manera moderna y eficiente.

