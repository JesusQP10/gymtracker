# Software Requirements Specification (SRS)
## GymTracker — Aplicación web de seguimiento de entrenamiento

**Versión:** 1.0  
**Autor:** Jesús  
**Fecha:** Marzo 2026  
**Estado:** Borrador

---

## 1. Introducción

### 1.1 Propósito
Este documento describe los requisitos funcionales y no funcionales del sistema GymTracker, una aplicación web fullstack orientada al seguimiento personalizado de rutinas de entrenamiento y progreso físico.

### 1.2 Alcance
GymTracker permitirá a usuarios registrados crear y gestionar rutinas de entrenamiento, registrar sesiones completadas y visualizar su evolución a lo largo del tiempo mediante gráficas de progreso.

### 1.3 Definiciones
| Término | Descripción |
|---|---|
| Usuario | Persona registrada en la plataforma |
| Rutina | Conjunto de ejercicios agrupados con un objetivo común |
| Ejercicio | Actividad física con parámetros de series, repeticiones y/o peso |
| Sesión | Registro de un entrenamiento completado en una fecha concreta |
| Admin | Rol con acceso a gestión general del sistema |

### 1.4 Tecnologías previstas
- **Frontend:** React + React Router + Recharts
- **Backend:** Node.js + Express
- **Base de datos:** MongoDB + Mongoose
- **Autenticación:** JWT (JSON Web Tokens)
- **Despliegue:** Vercel (frontend) · Railway (backend) · MongoDB Atlas (BD)

---

## 2. Descripción general del sistema

### 2.1 Actores del sistema

**Usuario no autenticado**
- Puede ver la landing page
- Puede registrarse o iniciar sesión

**Usuario autenticado**
- Accede al dashboard personal
- Gestiona sus rutinas y ejercicios
- Registra y consulta sus sesiones
- Visualiza su progreso

**Administrador**
- Gestiona usuarios de la plataforma
- Accede a estadísticas globales

### 2.2 Flujo general
```
Landing → Registro/Login → Dashboard → [Rutinas | Sesión activa | Progreso]
```

---

## 3. Requisitos funcionales

### RF-01 · Autenticación y usuarios
| ID | Descripción | Prioridad |
|---|---|---|
| RF-01.1 | El usuario puede registrarse con email y contraseña | Alta |
| RF-01.2 | El usuario puede iniciar y cerrar sesión | Alta |
| RF-01.3 | Las contraseñas se almacenan hasheadas (bcrypt) | Alta |
| RF-01.4 | El sistema genera un JWT al autenticarse | Alta |
| RF-01.5 | El usuario puede editar su perfil (nombre, peso, altura) | Media |
| RF-01.6 | El sistema permite recuperar contraseña por email | Baja |

### RF-02 · Gestión de rutinas
| ID | Descripción | Prioridad |
|---|---|---|
| RF-02.1 | El usuario puede crear rutinas con nombre y descripción | Alta |
| RF-02.2 | El usuario puede añadir ejercicios a una rutina | Alta |
| RF-02.3 | Cada ejercicio tiene: nombre, series, repeticiones y peso | Alta |
| RF-02.4 | El usuario puede editar y eliminar rutinas | Alta |
| RF-02.5 | El usuario puede asignar días de la semana a cada rutina | Media |
| RF-02.6 | Existe una biblioteca de ejercicios predefinidos por grupo muscular | Media |

### RF-03 · Registro de sesiones
| ID | Descripción | Prioridad |
|---|---|---|
| RF-03.1 | El usuario puede iniciar una sesión basada en una rutina | Alta |
| RF-03.2 | Durante la sesión puede modificar peso/reps respecto a la rutina | Alta |
| RF-03.3 | El usuario puede marcar ejercicios como completados | Alta |
| RF-03.4 | Al finalizar, la sesión se guarda con fecha y duración | Alta |
| RF-03.5 | El usuario puede consultar el historial de sesiones | Media |
| RF-03.6 | El sistema incluye un temporizador de descanso entre series | Baja |

### RF-04 · Seguimiento de progreso
| ID | Descripción | Prioridad |
|---|---|---|
| RF-04.1 | El usuario puede ver la evolución de peso por ejercicio en gráfica | Alta |
| RF-04.2 | Se muestra un resumen semanal/mensual de sesiones | Alta |
| RF-04.3 | Se indica la racha de días activos | Media |
| RF-04.4 | Se pueden comparar dos períodos de tiempo | Baja |

---

## 4. Requisitos no funcionales

| ID | Categoría | Descripción |
|---|---|---|
| RNF-01 | Seguridad | Las rutas privadas requieren JWT válido |
| RNF-02 | Seguridad | Las contraseñas nunca se devuelven en las respuestas de la API |
| RNF-03 | Rendimiento | Las respuestas de la API no superarán los 500ms en condiciones normales |
| RNF-04 | Usabilidad | La interfaz es completamente responsiva (móvil, tablet, escritorio) |
| RNF-05 | Mantenibilidad | El código sigue una estructura modular y está comentado |
| RNF-06 | Disponibilidad | La aplicación desplegada tiene uptime mínimo del 99% |
| RNF-07 | Escalabilidad | La arquitectura permite añadir nuevas funcionalidades sin refactorización mayor |
| RNF-08 | Compatibilidad | Compatible con Chrome, Firefox y Safari en sus últimas dos versiones |

---

## 5. Casos de uso principales

### CU-01 · Registrar usuario
- **Actor:** Usuario no autenticado
- **Precondición:** El email no existe en el sistema
- **Flujo principal:** Usuario introduce nombre, email y contraseña → sistema valida → crea cuenta → redirige al dashboard
- **Flujo alternativo:** Email ya registrado → el sistema muestra error

### CU-02 · Crear rutina
- **Actor:** Usuario autenticado
- **Precondición:** El usuario tiene sesión activa
- **Flujo principal:** Usuario accede a "Mis rutinas" → pulsa "Nueva rutina" → introduce nombre y añade ejercicios → guarda
- **Flujo alternativo:** Campos vacíos → el sistema muestra validación

### CU-03 · Registrar sesión de entrenamiento
- **Actor:** Usuario autenticado
- **Precondición:** El usuario tiene al menos una rutina creada
- **Flujo principal:** Usuario selecciona rutina → inicia sesión → completa ejercicios → finaliza → sesión guardada
- **Flujo alternativo:** Usuario abandona sesión → se pregunta si desea guardar el progreso parcial

### CU-04 · Ver progreso
- **Actor:** Usuario autenticado
- **Precondición:** El usuario tiene al menos una sesión registrada
- **Flujo principal:** Usuario accede a "Progreso" → selecciona ejercicio → visualiza gráfica de evolución

---

## 6. Restricciones y supuestos
- La aplicación está orientada a uso individual (cada usuario solo ve sus propios datos)
- En la versión 1.0 no se incluye funcionalidad social ni compartir rutinas
- El idioma de la interfaz será español
- Se asume conexión a internet para el funcionamiento de la app

---

## 7. Fases de desarrollo

| Fase | Contenido | Estado |
|---|---|---|
| Fase 1 | Definición del proyecto (SRS, modelado, API) | 🔄 En curso |
| Fase 2 | Backend: autenticación y gestión de rutinas | ⏳ Pendiente |
| Fase 3 | Frontend: login, dashboard y rutinas | ⏳ Pendiente |
| Fase 4 | Backend + Frontend: sesiones y progreso | ⏳ Pendiente |
| Fase 5 | Pulido, responsive y despliegue | ⏳ Pendiente |

---

*Documento sujeto a cambios durante el desarrollo. Versiones futuras se registrarán en el historial de commits de GitHub.*