# 🔥 Configuración de Firebase para Sistema de Asistencia

Esta guía te ayudará a configurar Firebase Firestore para tu aplicación de asistencia paso a paso.

## 📋 Requisitos Previos

- Cuenta de Google
- Navegador web moderno
- Archivos del proyecto descargados

## 🚀 Paso 1: Crear Proyecto Firebase

### 1.1 Acceder a Firebase Console
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Inicia sesión con tu cuenta de Google
3. Haz clic en **"Agregar proyecto"** o **"Crear un proyecto"**

### 1.2 Configurar el Proyecto
1. **Nombre del proyecto**: `asistencia-universitaria` (o el nombre que prefieras)
2. **Descripción**: "Sistema de asistencia para parada universitaria"
3. **Continuar** al siguiente paso
4. **Google Analytics**: 
   - Puedes habilitarlo (recomendado) o deshabilitarlo
   - Si lo habilitas, selecciona una cuenta de Analytics existente o crea una nueva
5. **Crear proyecto**
6. Espera a que se complete la configuración (1-2 minutos)
7. **Continuar** cuando esté listo

## 🗄️ Paso 2: Configurar Cloud Firestore

### 2.1 Crear Base de Datos
1. En el menú lateral izquierdo, haz clic en **"Firestore Database"**
2. Haz clic en **"Crear base de datos"**
3. **Modo de seguridad**:
   - Selecciona **"Iniciar en modo de prueba"**
   - Esto permite lectura/escritura durante 30 días (perfecto para desarrollo)
4. **Ubicación**:
   - Selecciona la región más cercana a tus usuarios
   - Para América Latina: `us-central1` o `southamerica-east1`
   - **Nota**: No podrás cambiar la ubicación después
5. **Habilitar**

### 2.2 Configurar Reglas de Seguridad
1. Ve a la pestaña **"Reglas"** en Firestore Database
2. Reemplaza el contenido con estas reglas para desarrollo:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir acceso completo para desarrollo
    // ADVERTENCIA: Estas reglas permiten a cualquiera leer y escribir
    // Solo para desarrollo y pruebas
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

3. **Publicar** las reglas
4. Confirma que quieres publicar

### 2.3 Reglas de Seguridad para Producción (Opcional)
Para un entorno de producción más seguro, usa estas reglas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir lectura a todos, escritura solo con validación
    match /employees/{employeeId} {
      allow read: if true;
      allow write: if request.auth != null 
        && resource.data.keys().hasAll(['name', 'department', 'position'])
        && request.resource.data.name is string
        && request.resource.data.department is string
        && request.resource.data.position is string;
    }
    
    match /attendance/{attendanceId} {
      allow read: if true;
      allow write: if request.auth != null
        && resource.data.keys().hasAll(['employeeId', 'date', 'status', 'time'])
        && request.resource.data.status in ['present', 'absent', 'late'];
    }
  }
}
```

## 🌐 Paso 3: Registrar Aplicación Web

### 3.1 Agregar App Web
1. En la página principal de tu proyecto Firebase, busca **"Tus apps"**
2. Haz clic en el icono **Web** (`</>`)
3. **Registrar app**:
   - **Nombre de la app**: `Sistema Asistencia Web`
   - **También configura Firebase Hosting**: ❌ (No marcar, usaremos GitHub Pages)
4. **Registrar app**

### 3.2 Obtener Configuración
Firebase te mostrará un código similar a este:

```javascript
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBfwWrmC2wXZ8lpaZt7Wl9r5pz9WX06Qzw",
  authDomain: "asistenciauniversitaria-d153b.firebaseapp.com",
  projectId: "asistenciauniversitaria-d153b",
  storageBucket: "asistenciauniversitaria-d153b.firebasestorage.app",
  messagingSenderId: "869404372749",
  appId: "1:869404372749:web:eb82f4ed548932254d0a44",
  measurementId: "G-SQ219LRRRW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
```

**🔑 IMPORTANTE**: Copia y guarda esta configuración, la necesitarás en el siguiente paso.

## ⚙️ Paso 4: Configurar la Aplicación

### 4.1 Actualizar Configuración Firebase
1. Abre el archivo `js/firebase-service.js` en tu editor de código
2. Busca la sección de configuración:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyBfwWrmC2wXZ8lpaZt7Wl9r5pz9WX06Qzw",
  authDomain: "asistenciauniversitaria-d153b.firebaseapp.com",
  projectId: "asistenciauniversitaria-d153b",
  storageBucket: "asistenciauniversitaria-d153b.firebasestorage.app",
  messagingSenderId: "869404372749",
  appId: "1:869404372749:web:eb82f4ed548932254d0a44",
  measurementId: "G-SQ219LRRRW"
};
```

3. **Reemplaza** estos valores con los de tu proyecto Firebase
4. **Guarda** el archivo

### 4.2 Verificar Configuración
Para verificar que todo está configurado correctamente:

1. Abre `index.html` en tu navegador
2. Abre las **Herramientas de Desarrollador** (F12)
3. Ve a la pestaña **Console**
4. Si ves errores relacionados con Firebase, revisa la configuración
5. Si no hay errores, ¡la configuración es correcta!

## 📊 Paso 5: Estructura de Datos

### 5.1 Colecciones Automáticas
La aplicación creará automáticamente estas colecciones en Firestore:

#### Colección `employees`
Almacena información de los participantes:
```json
{
  "name": "Ana Quispe",
  "department": "Danza Folklórica", 
  "position": "Bailarina Principal",
  "createdAt": "2025-08-09T14:00:00.000Z"
}
```

#### Colección `attendance`
Almacena registros de asistencia:
```json
{
  "employeeId": "documento-id-del-empleado",
  "date": "2025-08-09",
  "status": "present",
  "time": "14:00",
  "notes": "Ensayo de Wifalas",
  "timestamp": "2025-08-09T14:00:00.000Z"
}
```

### 5.2 Datos de Ejemplo
Al cargar por primera vez, la aplicación agregará participantes de ejemplo:

- **Ana Quispe** - Danza Folklórica - Bailarina Principal
- **Carlos Mamani** - Música Tradicional - Músico (Zampoña)
- **María Condori** - Danza Folklórica - Coreógrafa
- **José Huanca** - Música Tradicional - Músico (Bombo)
- **Rosa Choque** - Vestuario - Coordinadora de Trajes

## 🔍 Paso 6: Monitoreo y Administración

### 6.1 Ver Datos en Firebase Console
1. Ve a **Firestore Database** en Firebase Console
2. Haz clic en la pestaña **"Datos"**
3. Verás las colecciones `employees` y `attendance`
4. Puedes ver, editar y eliminar documentos directamente

### 6.2 Monitorear Uso
1. Ve a **Firestore Database** > **Uso**
2. Revisa:
   - **Lecturas**: Número de documentos leídos
   - **Escrituras**: Número de documentos escritos
   - **Eliminaciones**: Número de documentos eliminados
   - **Almacenamiento**: Espacio usado

### 6.3 Límites Gratuitos
Firebase Firestore incluye un nivel gratuito generoso:
- **Lecturas**: 50,000 por día
- **Escrituras**: 20,000 por día
- **Eliminaciones**: 20,000 por día
- **Almacenamiento**: 1 GB

Para una parada universitaria típica, estos límites son más que suficientes.

## 🛡️ Paso 7: Seguridad y Mejores Prácticas

### 7.1 Reglas de Seguridad Recomendadas
Para producción, considera implementar:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Solo permitir operaciones durante horarios de ensayo
    match /{document=**} {
      allow read: if true;
      allow write: if request.time.hours() >= 13 && request.time.hours() <= 18;
    }
  }
}
```

### 7.2 Backup de Datos
1. **Exportación Manual**: Usa el botón "Exportar" en la aplicación
2. **Backup Automático**: Firebase hace backups automáticos
3. **Exportación Programada**: Configura exportaciones automáticas en Firebase Console

### 7.3 Monitoreo de Seguridad
1. Ve a **Firestore Database** > **Reglas**
2. Revisa la pestaña **"Solicitudes"** para ver actividad
3. Configura alertas para uso inusual

## 🚨 Solución de Problemas

### Error: "Missing or insufficient permissions"
**Causa**: Reglas de seguridad muy restrictivas
**Solución**: 
1. Ve a Firestore Database > Reglas
2. Usa las reglas de desarrollo mostradas arriba
3. Publica las reglas

### Error: "Firebase project not found"
**Causa**: Configuración incorrecta en `firebase-service.js`
**Solución**:
1. Verifica que el `projectId` sea correcto
2. Asegúrate de que el proyecto existe en Firebase Console

### Error: "Network request failed"
**Causa**: Problemas de conectividad o CORS
**Solución**:
1. Verifica conexión a internet
2. Usa HTTPS (GitHub Pages lo proporciona automáticamente)
3. Revisa que no haya bloqueadores de anuncios interfiriendo

### Los datos no se sincronizan
**Causa**: Reglas de seguridad o configuración incorrecta
**Solución**:
1. Abre la consola del navegador (F12)
2. Busca errores en la pestaña Console
3. Verifica las reglas de Firestore
4. Confirma que la configuración Firebase es correcta

## 📈 Optimización y Rendimiento

### 7.1 Consultas Eficientes
La aplicación está optimizada para:
- **Consultas por fecha**: Índice automático en campo `date`
- **Consultas por empleado**: Índice automático en campo `employeeId`
- **Límites de resultados**: Evita cargar datos innecesarios

### 7.2 Caché Local
Firebase automáticamente:
- **Cachea datos** para uso offline
- **Sincroniza cambios** cuando vuelve la conexión
- **Optimiza consultas** repetidas

## 🎯 Próximos Pasos

Una vez configurado Firebase:

1. **Prueba la aplicación** localmente
2. **Agrega participantes** reales de tu parada universitaria
3. **Configura horarios** de ensayo apropiados
4. **Despliega en GitHub Pages**
5. **Comparte con tu equipo**

## 📞 Soporte Adicional

Si necesitas ayuda adicional:

1. **Documentación Firebase**: [firebase.google.com/docs](https://firebase.google.com/docs)
2. **Comunidad Firebase**: [stackoverflow.com/questions/tagged/firebase](https://stackoverflow.com/questions/tagged/firebase)
3. **Soporte Google**: [support.google.com/firebase](https://support.google.com/firebase)

---

**¡Felicidades! Tu sistema de asistencia ahora tiene una base de datos real en la nube.** 🎉

**Beneficios de Firebase**:
- ✅ Sincronización en tiempo real
- ✅ Acceso desde múltiples dispositivos
- ✅ Backup automático
- ✅ Escalabilidad automática
- ✅ Seguridad robusta

