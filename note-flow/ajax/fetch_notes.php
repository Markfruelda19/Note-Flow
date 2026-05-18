<?php
// ajax/fetch_notes.php
header('Content-Type: application/json');
require_once '../config/database.php';

$conn = getConnection();

$sql = "SELECT * FROM notes ORDER BY is_pinned DESC, updated_at DESC";
$result = $conn->query($sql);

$notes = [];
while ($row = $result->fetch_assoc()) {
    $notes[] = $row;
}

echo json_encode(['success' => true, 'notes' => $notes]);
$conn->close();
?>