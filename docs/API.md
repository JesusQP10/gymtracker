# Diseño de la API REST
## GymTracker

**Versión:** 1.0  
**Base URL:** `https://api.gymtracker.com/api`  
**Autenticación:** Bearer Token (JWT) en la cabecera `Authorization`

---

## Convenciones

- Todas las respuestas son `Content-Type: application/json`
- Las rutas marcadas con 🔒 requieren JWT válido
- Formato de fechas: ISO 8601 (`2026-03-13T18:30:00Z`)
- En caso de error, siempre se devuelve `{ "message": "descripción del error" }`

### Códigos de respuesta usados

| Código | Significado |
|---|---|
| 200 | OK — consulta o actualización correcta |
| 201 | Created — recurso creado correctamente |
| 400 | Bad Request — datos inválidos o incompletos |
| 401 | Unauthorized — JWT ausente o inválido |
| 403 | Forbidden — no tienes permisos sobre este recurso |
| 404 | Not Found — recurso no encontrado |
| 500 | Server Error — error interno del servidor |

---

## 1. Autenticación — `/api/auth`

### POST `/api/auth/register`
Registra un nuevo usuario.

**Body:**
```json
{
  "name": "Jesús Quintero",
  "email": "jesus@email.com",
  "password": "miPassword123"
}
```

**Respuesta 201:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "661f1a...",
    "name": "Jesús Quintero",
    "email": "jesus@email.com"
  }
}
```

---

### POST `/api/auth/login`
Inicia sesión y devuelve un JWT.

**Body:**
```json
{
  "email": "jesus@email.com",
  "password": "miPassword123"
}
```

**Respuesta 200:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "661f1a...",
    "name": "Jesús Quintero",
    "email": "jesus@email.com"
  }
}
```

---

## 2. Usuarios — `/api/users` 🔒

### GET `/api/users/me`
Devuelve el perfil del usuario autenticado.

**Respuesta 200:**
```json
{
  "_id": "661f1a...",
  "name": "Jesús Quintero",
  "email": "jesus@email.com",
  "weight": 78,
  "height": 180,
  "createdAt": "2026-03-13T10:00:00Z"
}
```

---

### PUT `/api/users/me`
Actualiza el perfil del usuario autenticado.

**Body** (todos los campos opcionales):
```json
{
  "name": "Jesús Quintero",
  "weight": 80,
  "height": 180
}
```

**Respuesta 200:** Objeto usuario actualizado.

---

## 3. Rutinas — `/api/routines` 🔒

### GET `/api/routines`
Devuelve todas las rutinas del usuario autenticado.

**Respuesta 200:**
```json
[
  {
    "_id": "662a3b...",
    "name": "Pecho y tríceps",
    "description": "Rutina de empuje",
    "days": ["monday", "thursday"],
    "exercises": [ { "..." } ],
    "createdAt": "2026-03-13T10:00:00Z"
  }
]
```

---

### POST `/api/routines`
Crea una nueva rutina.

**Body:**
```json
{
  "name": "Pecho y tríceps",
  "description": "Rutina de empuje para los lunes",
  "days": ["monday", "thursday"],
  "exercises": [
    {
      "name": "Press banca",
      "muscleGroup": "chest",
      "sets": 4,
      "reps": 8,
      "weight": 80,
      "order": 1
    }
  ]
}
```

**Respuesta 201:** Objeto rutina creada.

---

### GET `/api/routines/:id`
Devuelve una rutina concreta por su ID.

**Respuesta 200:** Objeto rutina completo.  
**Respuesta 404:** Rutina no encontrada.  
**Respuesta 403:** La rutina no pertenece al usuario.

---

### PUT `/api/routines/:id`
Actualiza una rutina existente.

**Body:** Igual que POST, todos los campos opcionales.  
**Respuesta 200:** Objeto rutina actualizado.

---

### DELETE `/api/routines/:id`
Elimina una rutina.

**Respuesta 200:**
```json
{ "message": "Rutina eliminada correctamente" }
```

---

## 4. Sesiones — `/api/sessions` 🔒

### GET `/api/sessions`
Devuelve el historial de sesiones del usuario. Soporta filtros por query params.

**Query params opcionales:**
- `?routineId=662a3b` — filtra por rutina
- `?from=2026-01-01&to=2026-03-31` — filtra por rango de fechas
- `?limit=10&page=1` — paginación

**Respuesta 200:**
```json
[
  {
    "_id": "663c4d...",
    "routineName": "Pecho y tríceps",
    "date": "2026-03-13T18:30:00Z",
    "duration": 52,
    "notes": "Subí el peso en press banca"
  }
]
```

---

### POST `/api/sessions`
Guarda una sesión completada.

**Body:**
```json
{
  "routineId": "662a3b...",
  "date": "2026-03-13T18:30:00Z",
  "duration": 52,
  "notes": "Subí el peso en press banca",
  "exercises": [
    {
      "name": "Press banca",
      "muscleGroup": "chest",
      "sets": [
        { "reps": 8, "weight": 80, "completed": true },
        { "reps": 8, "weight": 80, "completed": true },
        { "reps": 7, "weight": 80, "completed": true }
      ]
    }
  ]
}
```

**Respuesta 201:** Objeto sesión guardada.

---

### GET `/api/sessions/:id`
Devuelve el detalle completo de una sesión.

**Respuesta 200:** Objeto sesión completo con todos los ejercicios y series.

---

### DELETE `/api/sessions/:id`
Elimina una sesión del historial.

**Respuesta 200:**
```json
{ "message": "Sesión eliminada correctamente" }
```

---

## 5. Progreso — `/api/progress` 🔒

### GET `/api/progress/exercise`
Devuelve la evolución de un ejercicio concreto a lo largo del tiempo (para las gráficas).

**Query params:**
- `?name=Press banca` — nombre del ejercicio (obligatorio)
- `?from=2026-01-01&to=2026-03-31` — rango de fechas (opcional)

**Respuesta 200:**
```json
[
  { "date": "2026-01-10", "maxWeight": 70, "totalVolume": 2240 },
  { "date": "2026-02-05", "maxWeight": 75, "totalVolume": 2400 },
  { "date": "2026-03-13", "maxWeight": 80, "totalVolume": 2560 }
]
```

---

### GET `/api/progress/summary`
Devuelve el resumen general del usuario para el dashboard.

**Respuesta 200:**
```json
{
  "sessionsThisMonth": 12,
  "sessionsThisWeek": 3,
  "currentStreak": 3,
  "totalVolumeTodayKg": 4200,
  "lastSession": {
    "date": "2026-03-12T18:00:00Z",
    "routineName": "Pierna"
  }
}
```

---

## 6. Ejercicios (biblioteca) — `/api/exercises`

### GET `/api/exercises`
Devuelve la biblioteca de ejercicios predefinidos. No requiere autenticación.

**Query params opcionales:**
- `?muscleGroup=chest` — filtra por grupo muscular

**Respuesta 200:**
```json
[
  {
    "_id": "664e5f...",
    "name": "Press banca",
    "muscleGroup": "chest",
    "type": "compound"
  }
]
```

---

## Resumen de endpoints

| Método | Endpoint | Descripción | Auth |
|---|---|---|---|
| POST | /api/auth/register | Registrar usuario | No |
| POST | /api/auth/login | Iniciar sesión | No |
| GET | /api/users/me | Ver perfil | 🔒 |
| PUT | /api/users/me | Editar perfil | 🔒 |
| GET | /api/routines | Listar rutinas | 🔒 |
| POST | /api/routines | Crear rutina | 🔒 |
| GET | /api/routines/:id | Ver rutina | 🔒 |
| PUT | /api/routines/:id | Editar rutina | 🔒 |
| DELETE | /api/routines/:id | Eliminar rutina | 🔒 |
| GET | /api/sessions | Historial sesiones | 🔒 |
| POST | /api/sessions | Guardar sesión | 🔒 |
| GET | /api/sessions/:id | Ver sesión | 🔒 |
| DELETE | /api/sessions/:id | Eliminar sesión | 🔒 |
| GET | /api/progress/exercise | Progreso por ejercicio | 🔒 |
| GET | /api/progress/summary | Resumen dashboard | 🔒 |
| GET | /api/exercises | Biblioteca ejercicios | No |

---

