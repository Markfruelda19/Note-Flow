<?php
// ajax/delete_note.php
header('Content-Type: application/json');
require_once '../config/database.php';

$conn = getConnection();

$id = intval($_POST['id'] ?? 0);

if ($id <= 0) {
    echo json_encode(['success' => false, 'error' => 'Invalid note ID']);
    exit;
}

$sql = "DELETE FROM notes WHERE id=$id";

if ($conn->query($sql)) {
    echo json_encode(['success' => true, 'message' => 'Note deleted']);
} else {
    echo json_encode(['success' => false, 'error' => $conn->error]);
}

$conn->close();
?>