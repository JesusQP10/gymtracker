const API = 'http://localhost:5000/api';

// ── Saludo según hora ──
function getGreeting() {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'Buenos días';
    if (hour >= 12 && hour < 20) return 'Buenas tardes';
    return 'Buenas noches';
}

// ── Día de la semana en español ──
const DAYS_ES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
function getTodayName() {
    return DAYS_ES[new Date().getDay()];
}

// ── Token JWT del localStorage ──
function getToken() {
    return localStorage.getItem('token');
}

// ── Rellena el saludo con el nombre del usuario ──
function renderGreeting(name) {
    const el = document.getElementById('greeting-text');
    el.innerHTML = `${getGreeting()}, <span class="text-accent">${name}</span>`;
}

// ── Rellena las stat cards ──
function renderStats(summary) {
    document.getElementById('stat-month').textContent  = summary.sessionsThisMonth ?? '—';
    document.getElementById('stat-week').textContent   = summary.sessionsThisWeek  ?? '—';
    document.getElementById('stat-streak').textContent = summary.currentStreak != null
        ? `${summary.currentStreak} días` : '—';
    document.getElementById('stat-volume').textContent = summary.totalVolumeTodayKg != null
        ? `${summary.totalVolumeTodayKg} kg` : '—';
}

// ── Rellena la rutina del día ──
function renderRoutine(routine) {
    const today = getTodayName();
    document.getElementById('routine-day').textContent = today.charAt(0).toUpperCase() + today.slice(1);

    const btn = document.getElementById('btn-start');

    if (!routine) {
        document.getElementById('routine-name').textContent = 'No tienes rutina asignada para hoy';
        btn.disabled = true;
        return;
    }

    document.getElementById('routine-name').textContent = routine.name;

    const list = document.getElementById('exercise-list');
    list.innerHTML = routine.exercises.map(ex => `
        <li class="exercise-item">
            <span class="exercise-item__name">${ex.name}</span>
            <span class="exercise-item__meta text-secondary">${ex.sets} × ${ex.reps}${ex.weight ? ` · ${ex.weight} kg` : ''}</span>
        </li>
    `).join('');

    btn.onclick = () => {
        window.location.href = `session.html?routineId=${routine._id}`;
    };
}

// ── Rellena la última sesión ──
function renderLastSession(session) {
    if (!session) {
        document.getElementById('last-session-date').textContent    = 'Sin sesiones aún';
        document.getElementById('last-session-routine').textContent = '—';
        document.getElementById('last-duration').textContent        = '—';
        document.getElementById('last-volume').textContent          = '—';
        return;
    }

    const date = new Date(session.date).toLocaleDateString('es-ES', {
        day: 'numeric', month: 'long'
    });
    document.getElementById('last-session-date').textContent    = date;
    document.getElementById('last-session-routine').textContent = session.routineName;
    document.getElementById('last-duration').textContent        = `${session.duration} min`;
    document.getElementById('last-volume').textContent          = session.totalVolume ? `${session.totalVolume} kg` : '—';
}

// ── Datos de prueba (Mientras NO HAY BACKEND) ──
const MOCK = {
    user: { name: 'Jesús' },
    summary: {
        sessionsThisMonth: 12,
        sessionsThisWeek: 3,
        currentStreak: 5,
        totalVolumeTodayKg: 4200,
    },
    routines: [
        {
            _id: '1',
            name: 'Pecho y tríceps',
            days: ['lunes', 'jueves'],
            exercises: [
                { name: 'Press banca',        sets: 4, reps: 8,  weight: 80 },
                { name: 'Press inclinado',    sets: 3, reps: 10, weight: 60 },
                { name: 'Fondos en paralelas',sets: 3, reps: 12, weight: null },
                { name: 'Extensiones tríceps',sets: 3, reps: 12, weight: 25 },
            ],
        },
        {
            _id: '2',
            name: 'Espalda y bíceps',
            days: ['martes', 'viernes'],
            exercises: [
                { name: 'Dominadas',      sets: 4, reps: 8,  weight: null },
                { name: 'Remo con barra', sets: 4, reps: 8,  weight: 70 },
                { name: 'Curl bíceps',    sets: 3, reps: 12, weight: 20 },
            ],
        },
    ],
    sessions: [
        {
            date: new Date().toISOString(),
            routineName: 'Pierna',
            duration: 52,
            totalVolume: 3800,
        },
    ],
};

// ── Carga inicial del dashboard ──
async function init() {
    const token = getToken();
    const today = DAYS_ES[new Date().getDay()];

    if (!token) {
        // Sin backend: carga datos de prueba para poder ver el dashboard
        renderGreeting(MOCK.user.name);
        renderStats(MOCK.summary);
        renderRoutine(MOCK.routines.find(r => r.days.includes(today)) ?? null);
        renderLastSession(MOCK.sessions[0] ?? null);
        return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    try {
        const [userRes, summaryRes, routinesRes, sessionsRes] = await Promise.all([
            fetch(`${API}/users/me`,           { headers }),
            fetch(`${API}/progress/summary`,   { headers }),
            fetch(`${API}/routines`,           { headers }),
            fetch(`${API}/sessions?limit=1`,   { headers }),
        ]);

        const user     = await userRes.json();
        const summary  = await summaryRes.json();
        const routines = await routinesRes.json();
        const sessions = await sessionsRes.json();

        const routine = routines.find(r => r.days?.includes(today)) ?? null;
        const last    = sessions[0] ?? null;

        renderGreeting(user.name);
        renderStats(summary);
        renderRoutine(routine);
        renderLastSession(last);

    } catch (err) {
        console.error('Error cargando el dashboard:', err);
    }
}

init();
