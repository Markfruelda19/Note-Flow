<?php
// index.php — NoteFlow entry point
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NoteFlow</title>
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>

<!-- ─── HEADER ─────────────────────────────────── -->
<header>
    <div class="logo">Note<span>Flow</span></div>

    <div class="search-wrap">
        <svg class="search-icon" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <circle cx="11" cy="11" r="7" stroke-width="2"/>
            <path d="M17 17l4 4" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <input id="search-input" type="text" placeholder="Search notes…" autocomplete="off">
    </div>
</header>

<!-- ─── MAIN ───────────────────────────────────── -->
<main>

    <!-- Add Note Card -->
    <div class="add-note-card" id="add-note-card">
        <div id="add-placeholder" class="add-note-placeholder">Take a note…</div>
        <input  id="new-title"   type="text"   placeholder="Title" autocomplete="off">
        <textarea id="new-content" rows="2" placeholder="Note…"></textarea>

        <div class="add-note-actions" id="add-note-actions">
            <!-- Color picker -->
            <div class="color-picker">
                <?php foreach(['yellow','green','blue','pink','purple','orange'] as $c): ?>
                <div class="color-dot <?= $c ?><?= $c==='yellow' ? ' active' : '' ?>"
                     data-color="<?= $c ?>" title="<?= ucfirst($c) ?>"></div>
                <?php endforeach; ?>
            </div>
            <button class="btn-add-note" id="btn-add-note">+ Add</button>
        </div>
    </div>

    <!-- Pinned Notes -->
    <div id="pinned-section" style="display:none">
        <div class="section-label">📌 Pinned</div>
        <div class="notes-grid" id="pinned-grid"></div>
    </div>

    <!-- All Notes -->
    <div class="section-label" id="notes-label">Others</div>
    <div class="notes-grid" id="notes-grid"></div>

    <!-- Empty state -->
    <div id="empty-state" style="display:none">
        <div class="empty-state">
            <div class="emoji">📝</div>
            <p>No notes yet — add your first one above!</p>
        </div>
    </div>

</main>

<!-- ─── EDIT MODAL ──────────────────────────────── -->
<div class="modal-overlay" id="modal-overlay">
    <div class="modal yellow" id="edit-modal">
        <input  id="modal-title"   class="modal-title-input"   type="text"  placeholder="Title" autocomplete="off">
        <textarea id="modal-content" class="modal-content-input" rows="6" placeholder="Note content…"></textarea>

        <div class="modal-footer">
            <!-- Color picker -->
            <div class="color-picker">
                <?php foreach(['yellow','green','blue','pink','purple','orange'] as $c): ?>
                <div class="color-dot <?= $c ?>" data-color="<?= $c ?>" title="<?= ucfirst($c) ?>"></div>
                <?php endforeach; ?>
            </div>

            <!-- Category -->
            <select id="modal-category" style="font-family:inherit;font-size:0.85rem;border:1.5px solid var(--border);border-radius:8px;padding:5px 10px;background:transparent;cursor:pointer;color:var(--text);">
                <option value="personal">Personal</option>
                <option value="work">Work</option>
                <option value="school">School</option>
                <option value="ideas">Ideas</option>
            </select>

            <div class="modal-actions">
                <span class="save-status" id="save-status"></span>
                <button class="btn-close-modal" id="btn-close-modal">Close</button>
            </div>
        </div>
    </div>
</div>

<!-- ─── DELETE CONFIRM MODAL ────────────────────── -->
<div class="modal-overlay" id="delete-overlay">
    <div class="confirm-modal">
        <h3>Delete this note?</h3>
        <p>This can't be undone.</p>
        <div class="confirm-btns">
            <button class="btn-cancel" id="btn-cancel-delete">Cancel</button>
            <button class="btn-confirm-delete" id="confirm-delete">Delete</button>
        </div>
    </div>
</div>

<!-- ─── TOAST ───────────────────────────────────── -->
<div class="toast" id="toast"></div>

<script src="assets/js/app.js"></script>
</body>
</html>