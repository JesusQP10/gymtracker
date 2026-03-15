const API = 'http://localhost:5000/api';

const MUSCLE_ES = {
    chest: 'Pecho', back: 'Espalda', legs: 'Pierna',
    shoulders: 'Hombros', arms: 'Brazos', core: 'Core'
};

const MOCK_ROUTINES = {
    '1': {
        _id: '1', name: 'Pecho y tríceps',
        exercises: [
            { name: 'Press banca',         muscleGroup: 'chest', sets: 4, reps: 8,  weight: 80 },
            { name: 'Press inclinado',     muscleGroup: 'chest', sets: 3, reps: 10, weight: 60 },
            { name: 'Fondos en paralelas', muscleGroup: 'arms',  sets: 3, reps: 12, weight: 0  },
            { name: 'Extensiones tríceps', muscleGroup: 'arms',  sets: 3, reps: 12, weight: 25 },
        ]
    },
    '2': {
        _id: '2', name: 'Espalda y bíceps',
        exercises: [
            { name: 'Dominadas',      muscleGroup: 'back', sets: 4, reps: 8,  weight: 0  },
            { name: 'Remo con barra', muscleGroup: 'back', sets: 4, reps: 8,  weight: 70 },
            { name: 'Curl bíceps',    muscleGroup: 'arms', sets: 3, reps: 12, weight: 20 },
        ]
    },
    '3': {
        _id: '3', name: 'Pierna',
        exercises: [
            { name: 'Sentadilla',   muscleGroup: 'legs', sets: 4, reps: 8,  weight: 100 },
            { name: 'Prensa',       muscleGroup: 'legs', sets: 3, reps: 12, weight: 150 },
            { name: 'Curl femoral', muscleGroup: 'legs', sets: 3, reps: 12, weight: 40  },
        ]
    }
};

// ── Timer de sesión ──
const startTime = Date.now();
const timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const m = String(Math.floor(elapsed / 60)).padStart(2, '0');
    const s = String(elapsed % 60).padStart(2, '0');
    document.getElementById('session-timer').textContent = `${m}:${s}`;
}, 1000);

// ── Descanso ──
let selectedRestSeconds = 60;
let restInterval = null;

function openRestPicker() {
    document.getElementById('rest-picker').style.display   = 'block';
    document.getElementById('rest-countdown').style.display = 'none';
    document.getElementById('rest-overlay').classList.add('is-open');
}

function startCountdown() {
    let remaining = selectedRestSeconds;
    document.getElementById('rest-timer').textContent       = remaining;
    document.getElementById('rest-picker').style.display    = 'none';
    document.getElementById('rest-countdown').style.display = 'block';

    restInterval = setInterval(() => {
        remaining--;
        document.getElementById('rest-timer').textContent = remaining;
        if (remaining <= 0) closeRest();
    }, 1000);
}

function closeRest() {
    clearInterval(restInterval);
    document.getElementById('rest-overlay').classList.remove('is-open');
}

// Presets de tiempo
document.querySelectorAll('.rest-preset').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.rest-preset').forEach(b => b.classList.remove('rest-preset--active'));
        btn.classList.add('rest-preset--active');
        selectedRestSeconds = Number(btn.dataset.s);
    });
});

document.getElementById('btn-start-rest').addEventListener('click', startCountdown);
document.getElementById('btn-skip-rest').addEventListener('click', closeRest);
document.getElementById('btn-stop-rest').addEventListener('click', closeRest);

// ── Render de ejercicios ──
function renderExercises(routine) {
    document.getElementById('session-routine-name').textContent = routine.name;

    const main = document.getElementById('session-exercises');
    main.innerHTML = routine.exercises.map((ex, exIdx) => `
        <div class="exercise-block card" data-ex="${exIdx}">
            <div class="exercise-block__header">
                <h2 class="exercise-block__name">${ex.name}</h2>
                <span class="badge badge--accent">${MUSCLE_ES[ex.muscleGroup] ?? ex.muscleGroup}</span>
            </div>
            <table class="sets-table">
                <thead>
                    <tr>
                        <th style="width:36px">Serie</th>
                        <th>Reps</th>
                        <th>Peso (kg)</th>
                        <th style="width:50px">Hecho</th>
                    </tr>
                </thead>
                <tbody id="sets-${exIdx}">
                    ${Array.from({ length: ex.sets }, (_, i) => buildSetRow(exIdx, i, ex.reps, ex.weight)).join('')}
                </tbody>
            </table>
            <button class="btn-add-set" onclick="addSet(${exIdx}, ${ex.reps}, ${ex.weight})">+ Añadir serie</button>
        </div>
    `).join('');
}

function buildSetRow(exIdx, setIdx, reps, weight) {
    return `
        <tr class="set-row" id="set-${exIdx}-${setIdx}">
            <td class="set-row__num">${setIdx + 1}</td>
            <td><input class="form-input" type="number" value="${reps}" min="1"></td>
            <td><input class="form-input" type="number" value="${weight}" min="0"></td>
            <td style="text-align:center">
                <input class="set-check" type="checkbox"
                    onchange="onSetComplete(this, ${exIdx}, ${setIdx})">
            </td>
        </tr>
    `;
}

function addSet(exIdx, reps, weight) {
    const tbody  = document.getElementById(`sets-${exIdx}`);
    const setIdx = tbody.rows.length;
    tbody.insertAdjacentHTML('beforeend', buildSetRow(exIdx, setIdx, reps, weight));
}

function onSetComplete(checkbox, exIdx, setIdx) {
    const row = document.getElementById(`set-${exIdx}-${setIdx}`);
    row.classList.toggle('set-row--completed', checkbox.checked);
    if (checkbox.checked) openRestPicker();
}

// ── Finalizar sesión ──
function finishSession() {
    clearInterval(timerInterval);
    const elapsed = Math.floor((Date.now() - startTime) / 1000 / 60);

    const exercises = [...document.querySelectorAll('.exercise-block')].map(block => ({
        name: block.querySelector('.exercise-block__name').textContent,
        sets: [...block.querySelectorAll('.set-row')].map(row => ({
            reps:      Number(row.querySelectorAll('input')[0].value),
            weight:    Number(row.querySelectorAll('input')[1].value),
            completed: row.querySelector('.set-check').checked,
        }))
    }));

    const session = {
        routineId: new URLSearchParams(location.search).get('routineId'),
        date:      new Date().toISOString(),
        duration:  elapsed,
        notes:     document.getElementById('session-notes-input').value.trim(),
        exercises,
    };

    console.log('Sesión finalizada:', session);
    // TODO: POST /api/sessions
    window.location.href = 'dashboard.html';
}

// ── Eventos de cabecera ──
document.getElementById('btn-finish').addEventListener('click', finishSession);

document.getElementById('btn-abandon').addEventListener('click', () => {
    clearInterval(timerInterval);
    window.location.href = 'dashboard.html';
});

// ── Carga inicial ──
async function init() {
    const routineId = new URLSearchParams(location.search).get('routineId') ?? '1';
    const token     = localStorage.getItem('token');
    let routine     = null;

    if (token) {
        try {
            const res = await fetch(`${API}/routines/${routineId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            routine = await res.json();
        } catch {
            routine = MOCK_ROUTINES[routineId] ?? MOCK_ROUTINES['1'];
        }
    } else {
        routine = MOCK_ROUTINES[routineId] ?? MOCK_ROUTINES['1'];
    }

    renderExercises(routine);
}

init();
