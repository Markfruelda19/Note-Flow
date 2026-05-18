<?php
// ajax/create_note.php
header('Content-Type: application/json');
require_once '../config/database.php';

$conn = getConnection();

$title    = $conn->real_escape_string($_POST['title'] ?? '');
$content  = $conn->real_escape_string($_POST['content'] ?? '');
$category = $conn->real_escape_string($_POST['category'] ?? 'personal');
$color    = $conn->real_escape_string($_POST['color'] ?? 'yellow');

$sql = "INSERT INTO notes (title, content, category, color) VALUES ('$title', '$content', '$category', '$color')";

if ($conn->query($sql)) {
    echo json_encode([
        'success' => true,
        'id'      => $conn->insert_id,
        'message' => 'Note created'
    ]);
} else {
    echo json_encode(['success' => false, 'error' => $conn->error]);
}

$conn->close();
?>