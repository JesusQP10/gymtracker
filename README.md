# 💪 GymTracker

Aplicación web fullstack para gestionar rutinas de entrenamiento y visualizar el progreso físico a lo largo del tiempo.

> Proyecto desarrollado como práctica de desarrollo web fullstack.

---

## Capturas

> *(Se añadirán cuando el frontend esté terminado)*

---

## Tecnologías

**Frontend**
- HTML5, CSS3, JavaScript ES6+
- Recharts (gráficas de progreso)

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- JSON Web Tokens (JWT) + bcrypt

**Despliegue**
- Vercel (frontend)
- Railway (backend)
- MongoDB Atlas (base de datos)

---

## Funcionalidades

- Registro e inicio de sesión con autenticación JWT
- Crear, editar y eliminar rutinas personalizadas
- Biblioteca de ejercicios por grupo muscular
- Registro de sesiones de entrenamiento con series y pesos
- Gráficas de evolución por ejercicio
- Resumen semanal y racha de días activos
- Diseño dark mode completamente responsivo

---

## Documentación

- [Requisitos del sistema (SRS)](docs/SRS.md)
- [Modelado de datos](docs/DATA_MODEL.md)
- [Diseño de la API REST](docs/API.md)

---

## Instalación local

### Requisitos previos
- Node.js 18+
- MongoDB Atlas (cuenta gratuita)

### Pasos

```bash
# 1. Clona el repositorio
git clone https://github.com/tuusuario/gymtracker.git
cd gymtracker

# 2. Instala las dependencias del servidor
cd server
npm install

# 3. Configura las variables de entorno
cp .env.example .env
# Edita .env con tus valores reales

# 4. Arranca el servidor
npm run dev
```

Abre `client/pages/index.html` en tu navegador o usa Live Server.

---

## Estructura del proyecto

```
gymtracker/
├── client/     → Frontend
├── server/     → Backend API REST
└── docs/       → Documentación del proyecto
```

---

## Autor

**Jesús Quintero**  
[GitHub](https://github.com/usuario) · [LinkedIn](https://linkedin.com/in/usuario)

---

## Licencia

MIT