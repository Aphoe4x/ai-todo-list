<?php
require 'config.php';

// Get POST data
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'ID is required', 'success' => false]);
    exit;
}

$id = (int)$data['id'];

// Delete todo
$stmt = $conn->prepare("DELETE FROM todos WHERE id = ?");

if (!$stmt) {
    http_response_code(500);
    echo json_encode(['error' => $conn->error, 'success' => false]);
    exit;
}

$stmt->bind_param('i', $id);

if ($stmt->execute()) {
    echo json_encode([
        'success' => true,
        'id' => $id,
        'message' => 'Todo deleted successfully'
    ]);
} else {
    http_response_code(500);
    echo json_encode(['error' => $stmt->error, 'success' => false]);
}

$stmt->close();
?>
