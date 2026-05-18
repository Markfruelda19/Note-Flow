// assets/js/app.js
// NoteFlow — Full JS: AJAX, auto-save (debounce), live search, CRUD

const COLORS = ['yellow', 'green', 'blue', 'pink', 'purple', 'orange'];
const CATEGORIES = ['personal', 'work', 'school', 'ideas'];

/* ─── State ───────────────────────────────────── */
let allNotes        = [];
let activeNoteId    = null;
let autoSaveTimer   = null;
let pendingDelete   = null;
let newNoteColor    = 'yellow';

/* ─── DOM Refs ────────────────────────────────── */
const searchInput       = document.getElementById('search-input');
const pinnedGrid        = document.getElementById('pinned-grid');
const pinnedSection     = document.getElementById('pinned-section');
const notesGrid         = document.getElementById('notes-grid');
const emptyState        = document.getElementById('empty-state');

// Add-note card
const addCard           = document.getElementById('add-note-card');
const addPlaceholder    = document.getElementById('add-placeholder');
const newTitleInput     = document.getElementById('new-title');
const newContentInput   = document.getElementById('new-content');
const addNoteActions    = document.getElementById('add-note-actions');

// Edit modal
const modalOverlay      = document.getElementById('modal-overlay');
const editModal         = document.getElementById('edit-modal');
const modalTitle        = document.getElementById('modal-title');
const modalContent      = document.getElementById('modal-content');
const saveStatus        = document.getElementById('save-status');

// Delete confirm modal
const deleteOverlay     = document.getElementById('delete-overlay');
const confirmDeleteBtn  = document.getElementById('confirm-delete');

// Toast
const toast             = document.getElementById('toast');

/* ─── Init ────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', fetchNotes);

/* ─── FETCH notes from DB ─────────────────────── */
function fetchNotes() {
    fetch('ajax/fetch_notes.php')
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                allNotes = data.notes;
                renderNotes(allNotes);
            }
        })
        .catch(() => showToast('Could not load notes'));
}

/* ─── RENDER ──────────────────────────────────── */
function renderNotes(notes) {
    pinnedGrid.innerHTML = '';
    notesGrid.innerHTML  = '';

    const pinned   = notes.filter(n => n.is_pinned == 1);
    const unpinned = notes.filter(n => n.is_pinned != 1);

    pinnedSection.style.display = pinned.length ? 'block' : 'none';

    pinned.forEach(n   => pinnedGrid.appendChild(createCard(n)));
    unpinned.forEach(n => notesGrid.appendChild(createCard(n)));

    emptyState.style.display = notes.length === 0 ? 'block' : 'none';
}

function createCard(note) {
    const card = document.createElement('div');
    card.className = `note-card ${note.color || 'yellow'}${note.is_pinned == 1 ? ' pinned' : ''}`;
    card.dataset.id = note.id;

    card.innerHTML = `
        <button class="pin-btn" title="${note.is_pinned == 1 ? 'Unpin' : 'Pin'}" onclick="togglePin(event, ${note.id})">
            ${note.is_pinned == 1 ? '📌' : '📍'}
        </button>
        <div class="note-title">${escHtml(note.title) || '<span style="opacity:.45">Untitled</span>'}</div>
        <div class="note-preview">${escHtml(note.content)}</div>
        <div class="note-footer">
            <span class="note-category">${note.category || ''}</span>
            <button class="btn-delete" title="Delete" onclick="promptDelete(event, ${note.id})">🗑️</button>
        </div>
    `;

    card.addEventListener('click', () => openEditModal(note.id));
    return card;
}

/* ─── ADD NOTE ────────────────────────────────── */
// Expand add-note card on focus
newContentInput.addEventListener('focus', expandAddCard);
addPlaceholder.addEventListener('click',  expandAddCard);

function expandAddCard() {
    addPlaceholder.style.display = 'none';
    newTitleInput.style.display  = 'block';
    addNoteActions.style.display = 'flex';
    newContentInput.focus();
}

function collapseAddCard() {
    addPlaceholder.style.display = 'block';
    newTitleInput.style.display  = 'none';
    addNoteActions.style.display = 'none';
    newTitleInput.value    = '';
    newContentInput.value  = '';
    newNoteColor = 'yellow';
    document.querySelectorAll('#add-note-card .color-dot').forEach(d => {
        d.classList.toggle('active', d.dataset.color === 'yellow');
    });
}

document.getElementById('btn-add-note').addEventListener('click', () => {
    const title   = newTitleInput.value.trim();
    const content = newContentInput.value.trim();
    if (!title && !content) { collapseAddCard(); return; }

    const fd = new FormData();
    fd.append('title',    title);
    fd.append('content',  content);
    fd.append('color',    newNoteColor);
    fd.append('category', 'personal');

    fetch('ajax/create_note.php', { method: 'POST', body: fd })
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                allNotes.unshift({ id: data.id, title, content, color: newNoteColor, category: 'personal', is_pinned: 0 });
                renderNotes(filterBySearch());
                collapseAddCard();
                showToast('Note added ✓');
            }
        })
        .catch(() => showToast('Error creating note'));
});

// Click outside add card → collapse
document.addEventListener('click', e => {
    if (!addCard.contains(e.target)) collapseAddCard();
});

/* ─── COLOR PICKER (add card) ─────────────────── */
document.querySelectorAll('#add-note-card .color-dot').forEach(dot => {
    dot.addEventListener('click', e => {
        e.stopPropagation();
        newNoteColor = dot.dataset.color;
        document.querySelectorAll('#add-note-card .color-dot').forEach(d =>
            d.classList.toggle('active', d === dot));
    });
});

/* ─── EDIT MODAL ──────────────────────────────── */
function openEditModal(id) {
    const note = allNotes.find(n => n.id == id);
    if (!note) return;
    activeNoteId = id;

    modalTitle.value   = note.title   || '';
    modalContent.value = note.content || '';
    saveStatus.textContent = '';
    saveStatus.className   = 'save-status';

    // Set modal color
    editModal.className = `modal ${note.color || 'yellow'}`;

    // Sync color dots in modal
    document.querySelectorAll('#edit-modal .color-dot').forEach(d => {
        d.classList.toggle('active', d.dataset.color === (note.color || 'yellow'));
    });

    // Set category select
    const catSelect = document.getElementById('modal-category');
    if (catSelect) catSelect.value = note.category || 'personal';

    modalOverlay.classList.add('open');
    modalTitle.focus();
}

document.getElementById('btn-close-modal').addEventListener('click', closeModal);
modalOverlay.addEventListener('click', e => {
    if (e.target === modalOverlay) closeModal();
});
document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('open')) closeModal();
});

function closeModal() {
    // Flush any pending save immediately
    clearTimeout(autoSaveTimer);
    if (activeNoteId) saveNote(activeNoteId);
    modalOverlay.classList.remove('open');
    activeNoteId = null;
}

/* ─── AUTO-SAVE (Debounce) ────────────────────── */
// Fires 800ms after user stops typing
[modalTitle, modalContent].forEach(el => {
    el.addEventListener('input', () => {
        saveStatus.textContent = 'Saving…';
        saveStatus.className   = 'save-status';
        clearTimeout(autoSaveTimer);
        autoSaveTimer = setTimeout(() => saveNote(activeNoteId), 800);
    });
});

function saveNote(id) {
    if (!id) return;
    const note = allNotes.find(n => n.id == id);
    if (!note) return;

    const title    = modalTitle.value;
    const content  = modalContent.value;
    const catEl    = document.getElementById('modal-category');
    const category = catEl ? catEl.value : note.category;
    const color    = note.color;

    const fd = new FormData();
    fd.append('id',       id);
    fd.append('title',    title);
    fd.append('content',  content);
    fd.append('category', category);
    fd.append('color',    color);

    fetch('ajax/update_note.php', { method: 'POST', body: fd })
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                // Update local state
                note.title    = title;
                note.content  = content;
                note.category = category;
                renderNotes(filterBySearch());
                saveStatus.textContent = 'Saved ✓';
                saveStatus.className   = 'save-status saved';
            }
        })
        .catch(() => {
            saveStatus.textContent = 'Save failed';
        });
}

/* ─── COLOR PICKER (edit modal) ──────────────── */
document.querySelectorAll('#edit-modal .color-dot').forEach(dot => {
    dot.addEventListener('click', e => {
        e.stopPropagation();
        const note = allNotes.find(n => n.id == activeNoteId);
        if (!note) return;

        note.color = dot.dataset.color;
        document.querySelectorAll('#edit-modal .color-dot').forEach(d =>
            d.classList.toggle('active', d === dot));
        editModal.className = `modal ${note.color}`;

        // Save color change immediately
        saveNote(activeNoteId);
    });
});

/* ─── PIN / UNPIN ─────────────────────────────── */
function togglePin(e, id) {
    e.stopPropagation();
    const note  = allNotes.find(n => n.id == id);
    if (!note) return;

    const newVal = note.is_pinned == 1 ? 0 : 1;
    const fd = new FormData();
    fd.append('id',        id);
    fd.append('is_pinned', newVal);

    fetch('ajax/update_note.php', { method: 'POST', body: fd })
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                note.is_pinned = newVal;
                renderNotes(filterBySearch());
                showToast(newVal ? 'Note pinned 📌' : 'Note unpinned');
            }
        });
}

/* ─── DELETE ──────────────────────────────────── */
function promptDelete(e, id) {
    e.stopPropagation();
    pendingDelete = id;
    deleteOverlay.classList.add('open');
}

confirmDeleteBtn.addEventListener('click', () => {
    if (!pendingDelete) return;

    const fd = new FormData();
    fd.append('id', pendingDelete);

    fetch('ajax/delete_note.php', { method: 'POST', body: fd })
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                allNotes = allNotes.filter(n => n.id != pendingDelete);
                renderNotes(filterBySearch());
                showToast('Note deleted');
            }
        })
        .catch(() => showToast('Error deleting note'))
        .finally(() => {
            deleteOverlay.classList.remove('open');
            pendingDelete = null;
        });
});

document.getElementById('btn-cancel-delete').addEventListener('click', () => {
    deleteOverlay.classList.remove('open');
    pendingDelete = null;
});

/* ─── LIVE SEARCH ─────────────────────────────── */
searchInput.addEventListener('input', () => {
    renderNotes(filterBySearch());
});

function filterBySearch() {
    const q = searchInput.value.trim().toLowerCase();
    if (!q) return allNotes;
    return allNotes.filter(n =>
        (n.title   || '').toLowerCase().includes(q) ||
        (n.content || '').toLowerCase().includes(q) ||
        (n.category|| '').toLowerCase().includes(q)
    );
}

/* ─── HELPERS ─────────────────────────────────── */
function escHtml(str) {
    if (!str) return '';
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

let toastTimer;
function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
}