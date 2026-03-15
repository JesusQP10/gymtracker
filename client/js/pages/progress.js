const API = 'http://localhost:5000/api';

const MOCK_SUMMARY = { sessionsThisMonth: 12, sessionsThisWeek: 3, currentStreak: 5, totalSessions: 47 };

const MOCK_SESSIONS = [
    { routineName: 'Pecho y tríceps', date: '2026-03-13T18:30:00Z', duration: 52, totalVolume: 4200 },
    { routineName: 'Espalda y bíceps', date: '2026-03-11T17:00:00Z', duration: 48, totalVolume: 3800 },
    { routineName: 'Pierna',           date: '2026-03-10T19:00:00Z', duration: 61, totalVolume: 6100 },
    { routineName: 'Pecho y tríceps',  date: '2026-03-07T18:00:00Z', duration: 55, totalVolume: 4050 },
    { routineName: 'Espalda y bíceps', date: '2026-03-05T17:30:00Z', duration: 44, totalVolume: 3600 },
];

const MOCK_EXERCISES = ['Press banca', 'Sentadilla', 'Dominadas', 'Remo con barra', 'Curl bíceps', 'Press inclinado'];

const MOCK_PROGRESS = {
    'Press banca':    [70, 72, 75, 75, 77, 80, 80, 82, 82, 85],
    'Sentadilla':     [90, 95, 95, 100, 100, 105, 110, 110, 112, 115],
    'Dominadas':      [0, 0, 0, 2, 2, 4, 5, 5, 7, 8],
    'Remo con barra': [60, 60, 65, 65, 70, 70, 72, 75, 75, 77],
    'Curl bíceps':    [16, 18, 18, 18, 20, 20, 22, 22, 24, 24],
    'Press inclinado':[50, 52, 55, 55, 57, 60, 60, 62, 62, 65],
};

let chart = null;

// ── Stats ──
function renderStats(summary) {
    document.getElementById('ps-month').textContent  = summary.sessionsThisMonth;
    document.getElementById('ps-week').textContent   = summary.sessionsThisWeek;
    document.getElementById('ps-streak').textContent = `${summary.currentStreak} días`;
    document.getElementById('ps-total').textContent  = summary.totalSessions;
}

// ── Selector de ejercicios ──
function populateExercises(exercises) {
    const sel = document.getElementById('exercise-select');
    exercises.forEach(name => {
        const opt = document.createElement('option');
        opt.value = name;
        opt.textContent = name;
        sel.appendChild(opt);
    });
}

// ── Gráfica ──
function renderChart(exerciseName) {
    const data   = MOCK_PROGRESS[exerciseName];
    const labels = data.map((_, i) => `Sesión ${i + 1}`);

    const empty = document.getElementById('chart-empty');
    empty.style.display = 'none';

    if (chart) chart.destroy();

    chart = new Chart(document.getElementById('progress-chart'), {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: `${exerciseName} — kg máx`,
                data,
                borderColor: '#c084fc',
                backgroundColor: 'rgba(192, 132, 252, 0.08)',
                borderWidth: 2,
                pointBackgroundColor: '#c084fc',
                pointRadius: 4,
                pointHoverRadius: 6,
                tension: 0.3,
                fill: true,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#1a1a1a',
                    borderColor: '#2a2a2a',
                    borderWidth: 1,
                    titleColor: '#f0f0f0',
                    bodyColor: '#c084fc',
                    padding: 10,
                }
            },
            scales: {
                x: {
                    grid: { color: '#1e1e1e' },
                    ticks: { color: '#555555', font: { size: 11 } }
                },
                y: {
                    grid: { color: '#1e1e1e' },
                    ticks: { color: '#555555', font: { size: 11 } }
                }
            }
        }
    });
}

// ── Historial ──
function renderHistory(sessions) {
    const list = document.getElementById('history-list');
    list.innerHTML = sessions.map(s => {
        const date = new Date(s.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
        return `
            <li class="history-item">
                <div class="history-item__left">
                    <span class="history-item__name">${s.routineName}</span>
                    <span class="history-item__date">${date}</span>
                </div>
                <div class="history-item__right">
                    <div class="history-item__stat">
                        <span class="history-item__stat-value">${s.duration} min</span>
                        <span class="history-item__stat-label">Duración</span>
                    </div>
                    <div class="history-item__stat">
                        <span class="history-item__stat-value">${s.totalVolume.toLocaleString()} kg</span>
                        <span class="history-item__stat-label">Volumen</span>
                    </div>
                </div>
            </li>
        `;
    }).join('');
}

// ── Eventos ──
document.getElementById('exercise-select').addEventListener('change', e => {
    if (e.target.value) renderChart(e.target.value);
});

// ── Carga inicial ──
async function init() {
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    let summary  = MOCK_SUMMARY;
    let sessions = MOCK_SESSIONS;
    let exercises = MOCK_EXERCISES;

    if (token) {
        try {
            const [sumRes, sesRes, exRes] = await Promise.all([
                fetch(`${API}/progress/summary`,  { headers }),
                fetch(`${API}/sessions`,          { headers }),
                fetch(`${API}/exercises`,         { headers }),
            ]);
            summary   = await sumRes.json();
            sessions  = await sesRes.json();
            exercises = (await exRes.json()).map(e => e.name);
        } catch { /* usa datos de prueba */ }
    }

    // Fechas por defecto: últimos 3 meses
    const now   = new Date();
    const past  = new Date();
    past.setMonth(past.getMonth() - 3);
    document.getElementById('date-to').valueAsDate   = now;
    document.getElementById('date-from').valueAsDate = past;

    renderStats(summary);
    populateExercises(exercises);
    renderHistory(sessions);
}

init();
