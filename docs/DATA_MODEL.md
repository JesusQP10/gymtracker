# Modelado de datos
## GymTracker

**Versión:** 1.0  
**Fecha:** Marzo 2026

---

## 1. Entidades del sistema

El sistema tiene **4 colecciones principales** en MongoDB:

```
Users → Routines → Exercises (embedded)
                ↘
              Sessions → SessionExercises (embedded)
```

---

## 2. Colección: Users

Almacena los datos de cada usuario registrado.

```json
{
  "_id": "ObjectId",
  "name": "Jesús Quintero",
  "email": "jesus@email.com",
  "password": "$2b$10$hashbcrypt...",
  "weight": 78,
  "height": 180,
  "createdAt": "2026-03-13T10:00:00Z",
  "updatedAt": "2026-03-13T10:00:00Z"
}
```

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| _id | ObjectId | Auto | Generado por MongoDB |
| name | String | Sí | Nombre del usuario |
| email | String | Sí | Único en el sistema |
| password | String | Sí | Hasheada con bcrypt |
| weight | Number | No | En kg, editable en perfil |
| height | Number | No | En cm, editable en perfil |
| createdAt | Date | Auto | Timestamp de registro |

---

## 3. Colección: Routines

Cada rutina pertenece a un usuario. Los ejercicios se guardan **embebidos** dentro de la rutina porque siempre se consultan juntos.

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId → Users",
  "name": "Pecho y tríceps",
  "description": "Rutina de empuje para los lunes",
  "days": ["monday", "thursday"],
  "exercises": [
    {
      "_id": "ObjectId",
      "name": "Press banca",
      "muscleGroup": "chest",
      "sets": 4,
      "reps": 8,
      "weight": 80,
      "order": 1
    },
    {
      "_id": "ObjectId",
      "name": "Fondos en paralelas",
      "muscleGroup": "triceps",
      "sets": 3,
      "reps": 12,
      "weight": 0,
      "order": 2
    }
  ],
  "createdAt": "2026-03-13T10:00:00Z",
  "updatedAt": "2026-03-13T10:00:00Z"
}
```

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| userId | ObjectId | Sí | Referencia al usuario dueño |
| name | String | Sí | Nombre de la rutina |
| description | String | No | Descripción opcional |
| days | Array\<String\> | No | Días asignados de la semana |
| exercises | Array\<Object\> | Sí | Ejercicios embebidos |
| exercises.muscleGroup | String | Sí | chest, back, legs, shoulders, arms, core |
| exercises.weight | Number | Sí | 0 si es peso corporal |

---

## 4. Colección: Sessions

Registro de cada entrenamiento completado. Se guarda una copia del estado de los ejercicios **en el momento de la sesión** — así el historial no cambia si el usuario edita la rutina después.

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId → Users",
  "routineId": "ObjectId → Routines",
  "routineName": "Pecho y tríceps",
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
        { "reps": 7, "weight": 80, "completed": true },
        { "reps": 6, "weight": 80, "completed": true }
      ]
    }
  ],
  "createdAt": "2026-03-13T19:22:00Z"
}
```

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| userId | ObjectId | Sí | Referencia al usuario |
| routineId | ObjectId | Sí | Referencia a la rutina base |
| routineName | String | Sí | Copia del nombre (por si cambia) |
| date | Date | Sí | Fecha y hora del entrenamiento |
| duration | Number | Sí | Duración en minutos |
| notes | String | No | Notas libres del usuario |
| exercises | Array | Sí | Snapshot de ejercicios realizados |
| exercises.sets | Array | Sí | Cada serie con reps, peso y si se completó |

---

## 5. Colección: Exercises (biblioteca global)

Catálogo de ejercicios predefinidos disponibles para todos los usuarios.

```json
{
  "_id": "ObjectId",
  "name": "Press banca",
  "muscleGroup": "chest",
  "description": "Ejercicio compuesto de empuje horizontal",
  "type": "compound"
}
```

| Campo | Tipo | Notas |
|---|---|---|
| name | String | Nombre del ejercicio |
| muscleGroup | String | Grupo muscular principal |
| type | String | compound / isolation |

---

## 6. Relaciones entre colecciones

```
Users (1) ──────────── (N) Routines
  │                          │
  │                          │ embebido
  │                     Exercises[]
  │
  └────────────────── (N) Sessions
                             │
                             │ embebido
                        SessionExercises[]
```

**Decisiones de diseño:**
- Los ejercicios de una rutina son **embebidos** (no una colección separada) porque siempre se consultan junto con la rutina — evita consultas extra.
- Las sesiones guardan una **copia snapshot** de los ejercicios realizados para preservar el historial aunque la rutina cambie.
- La colección `Exercises` es independiente y sirve como biblioteca de sugerencias, no afecta a rutinas ni sesiones ya creadas.

---

## 7. Índices recomendados

```js
// Buscar rutinas de un usuario rápidamente
db.routines.createIndex({ userId: 1 })

// Buscar sesiones de un usuario ordenadas por fecha
db.sessions.createIndex({ userId: 1, date: -1 })

// Email único en usuarios
db.users.createIndex({ email: 1 }, { unique: true })
```

---

