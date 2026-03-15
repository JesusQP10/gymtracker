const API = 'http://localhost:5000/api';

const DAYS_ES = {
    monday: 'Lun', tuesday: 'Mar', wednesday: 'Mié',
    thursday: 'Jue', friday: 'Vie', saturday: 'Sáb', sunday: 'Dom'
};

const MUSCLE_ES = {
    chest: 'Pecho', back: 'Espalda', legs: 'Pierna',
    shoulders: 'Hombros', arms: 'Brazos', core: 'Core'
};

const MOCK_ROUTINES = [
    {
        _id: '1', name: 'Pecho y tríceps', description: 'Rutina de empuje',
        days: ['monday', 'thursday'],
        exercises: [
            { _id: 'e1', name: 'Press banca',         muscleGroup: 'chest',   sets: 4, reps: 8,  weight: 80, order: 1 },
            { _id: 'e2', name: 'Press inclinado',      muscleGroup: 'chest',   sets: 3, reps: 10, weight: 60, order: 2 },
            { _id: 'e3', name: 'Fondos en paralelas',  muscleGroup: 'arms',    sets: 3, reps: 12, weight: 0,  order: 3 },
            { _id: 'e4', name: 'Extensiones tríceps',  muscleGroup: 'arms',    sets: 3, reps: 12, weight: 25, order: 4 },
        ]
    },
    {
        _id: '2', name: 'Espalda y bíceps', description: 'Rutina de tirón',
        days: ['tuesday', 'friday'],
        exercises: [
            { _id: 'e5', name: 'Dominadas',      muscleGroup: 'back', sets: 4, reps: 8,  weight: 0,  order: 1 },
            { _id: 'e6', name: 'Remo con barra', muscleGroup: 'back', sets: 4, reps: 8,  weight: 70, order: 2 },
            { _id: 'e7', name: 'Curl bíceps',    muscleGroup: 'arms', sets: 3, reps: 12, weight: 20, order: 3 },
        ]
    },
    {
        _id: '3', name: 'Pierna', description: 'Cuádriceps, isquios y glúteos',
        days: ['wednesday', 'saturday'],
        exercises: [
            { _id: 'e8',  name: 'Sentadilla',    muscleGroup: 'legs', sets: 4, reps: 8,  weight: 100, order: 1 },
            { _id: 'e9',  name: 'Prensa',        muscleGroup: 'legs', sets: 3, reps: 12, weight: 150, order: 2 },
            { _id: 'e10', name: 'Curl femoral',  muscleGroup: 'legs', sets: 3, reps: 12, weight: 40,  order: 3 },
        ]
    }
];

let routines = [];

// ── Render de cards ──
function renderRoutines() {
    const grid = document.getElementById('routines-grid');
    const empty = document.getElementById('empty-state');

    if (routines.length === 0) {
        grid.innerHTML = '';
        empty.hidden = false;
        return;
    }

    empty.hidden = true;
    grid.innerHTML = routines.map(r => `
        <div class="routine-card card" data-id="${r._id}">
            <h2 class="routine-card__title">${r.name}</h2>
            ${r.description ? `<p class="routine-card__desc">${r.description}</p>` : ''}
            <div class="routine-card__days">
                ${r.days.map(d => `<span class="badge badge--accent">${DAYS_ES[d] ?? d}</span>`).join('')}
            </div>
            <p class="routine-card__meta">${r.exercises.length} ejercicio${r.exercises.length !== 1 ? 's' : ''}</p>
            <div class="routine-card__actions">
                <button class="btn btn--primary" onclick="startSession('${r._id}')">Iniciar</button>
                <button class="btn-icon" title="Editar" onclick="openEdit('${r._id}')">✏️</button>
                <button class="btn-icon btn-icon--danger" title="Eliminar" onclick="deleteRoutine('${r._id}')">🗑</button>
            </div>
        </div>
    `).join('');
}

// ── Modal ──
function openModal(title) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-overlay').classList.add('is-open');
}

function closeModal() {
    document.getElementById('modal-overlay').classList.remove('is-open');
    document.getElementById('routine-form').reset();
    document.getElementById('routine-id').value = '';
    document.getElementById('exercises-list').innerHTML = '';
}

function openNew() {
    openModal('Nueva rutina');
}

function openEdit(id) {
    const r = routines.find(r => r._id === id);
    if (!r) return;

    openModal('Editar rutina');
    document.getElementById('routine-id').value = r._id;
    document.getElementById('input-name').value = r.name;
    document.getElementById('input-desc').value = r.description ?? '';

    document.querySelectorAll('.day-toggle input').forEach(cb => {
        cb.checked = r.days.includes(cb.value);
    });

    document.getElementById('exercises-list').innerHTML = '';
    r.exercises.forEach(ex => addExerciseRow(ex));
}

// ── Fila de ejercicio en el modal ──
function addExerciseRow(ex = {}) {
    const row = document.createElement('div');
    row.className = 'exercise-row';
    row.innerHTML = `
        <input class="form-input" type="text"   placeholder="Ejercicio"  value="${ex.name ?? ''}" data-field="name">
        <select class="form-input" data-field="muscleGroup">
            ${Object.entries(MUSCLE_ES).map(([k, v]) =>
                `<option value="${k}" ${ex.muscleGroup === k ? 'selected' : ''}>${v}</option>`
            ).join('')}
        </select>
        <input class="form-input" type="number" placeholder="Series" value="${ex.sets ?? 3}" min="1" data-field="sets">
        <input class="form-input" type="number" placeholder="Reps"   value="${ex.reps ?? 10}" min="1" data-field="reps">
        <input class="form-input" type="number" placeholder="kg"     value="${ex.weight ?? 0}" min="0" data-field="weight">
        <button type="button" class="btn-icon btn-icon--danger" onclick="this.parentElement.remove()">✕</button>
    `;
    document.getElementById('exercises-list').appendChild(row);
}

// ── Guardar ──
function saveRoutine() {
    const nameInput = document.getElementById('input-name');
    const name = nameInput.value.trim();
    if (!name) {
        nameInput.classList.add('input--error');
        nameInput.focus();
        setTimeout(() => nameInput.classList.remove('input--error'), 2000);
        return;
    }

    const days = [...document.querySelectorAll('.day-toggle input:checked')].map(cb => cb.value);

    const exercises = [...document.querySelectorAll('.exercise-row')].map((row, i) => ({
        name:        row.querySelector('[data-field="name"]').value.trim(),
        muscleGroup: row.querySelector('[data-field="muscleGroup"]').value,
        sets:        Number(row.querySelector('[data-field="sets"]').value),
        reps:        Number(row.querySelector('[data-field="reps"]').value),
        weight:      Number(row.querySelector('[data-field="weight"]').value),
        order: i + 1,
    })).filter(ex => ex.name);

    const id = document.getElementById('routine-id').value;
    const payload = { name, description: document.getElementById('input-desc').value.trim(), days, exercises };

    if (id) {
        const idx = routines.findIndex(r => r._id === id);
        routines[idx] = { ...routines[idx], ...payload };
    } else {
        routines.push({ _id: Date.now().toString(), ...payload });
    }

    renderRoutines();
    closeModal();
}

// ── Eliminar (doble clic para confirmar) ──
let pendingDeleteId     = null;
let pendingDeleteTimeout = null;

function deleteRoutine(id) {
    if (pendingDeleteId === id) {
        clearTimeout(pendingDeleteTimeout);
        pendingDeleteId = null;
        routines = routines.filter(r => r._id !== id);
        renderRoutines();
        return;
    }

    if (pendingDeleteId) clearTimeout(pendingDeleteTimeout);
    pendingDeleteId = id;

    const btn = document.querySelector(`.btn-icon--danger[onclick="deleteRoutine('${id}')"]`);
    btn.textContent      = '¿Seguro?';
    btn.style.width      = 'auto';
    btn.style.padding    = '0 8px';
    btn.style.fontSize   = '11px';

    pendingDeleteTimeout = setTimeout(() => {
        pendingDeleteId = null;
        renderRoutines();
    }, 3000);
}

// ── Iniciar sesión de entrenamiento ──
function startSession(id) {
    window.location.href = `session.html?routineId=${id}`;
}

// ── Eventos ──
document.getElementById('btn-new-routine').addEventListener('click', openNew);
document.getElementById('btn-empty-new').addEventListener('click', openNew);
document.getElementById('btn-cancel').addEventListener('click', closeModal);
document.getElementById('modal-close').addEventListener('click', closeModal);
document.getElementById('btn-save').addEventListener('click', saveRoutine);
document.getElementById('btn-add-exercise').addEventListener('click', () => addExerciseRow());
document.getElementById('modal-overlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModal();
});

// ── Carga inicial ──
async function init() {
    const token = localStorage.getItem('token');

    if (token) {
        try {
            const res = await fetch(`${API}/routines`, { headers: { Authorization: `Bearer ${token}` } });
            routines = await res.json();
        } catch {
            routines = MOCK_ROUTINES;
        }
    } else {
        routines = MOCK_ROUTINES;
    }

    renderRoutines();
}

init();
