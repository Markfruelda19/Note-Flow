<?php
// ajax/update_note.php
header('Content-Type: application/json');
require_once '../config/database.php';

$conn = getConnection();

$id       = intval($_POST['id'] ?? 0);
$title    = $conn->real_escape_string($_POST['title'] ?? '');
$content  = $conn->real_escape_string($_POST['content'] ?? '');
$category = $conn->real_escape_string($_POST['category'] ?? 'personal');
$color    = $conn->real_escape_string($_POST['color'] ?? 'yellow');
$pinned   = isset($_POST['is_pinned']) ? intval($_POST['is_pinned']) : null;

if ($id <= 0) {
    echo json_encode(['success' => false, 'error' => 'Invalid note ID']);
    exit;
}

// Build update query dynamically
if ($pinned !== null) {
    $sql = "UPDATE notes SET is_pinned=$pinned WHERE id=$id";
} else {
    $sql = "UPDATE notes SET title='$title', content='$content', category='$category', color='$color' WHERE id=$id";
}

if ($conn->query($sql)) {
    echo json_encode(['success' => true, 'message' => 'Note updated']);
} else {
    echo json_encode(['success' => false, 'error' => $conn->error]);
}

$conn->close();
?>