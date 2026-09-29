<?php
require 'config.php';

// Get POST data
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['id']) || !isset($data['text'])) {
    http_response_code(400);
    echo json_encode(['error' => 'ID and text are required', 'success' => false]);
    exit;
}

$id = (int)$data['id'];
$text = $data['text'];
$priority = $data['priority'] ?? 'medium';
$dueDate = !empty($data['dueDate']) ? $data['dueDate'] : NULL;
$timerDate = !empty($data['timerDate']) ? $data['timerDate'] : NULL;
$status = $data['status'] ?? 'backlog';
$completed = isset($data['completed']) ? (int)$data['completed'] : 0;

// Update todo
$stmt = $conn->prepare("
    UPDATE todos 
    SET title = ?, priority = ?, dueDate = ?, status = ?, timerDate = ?, completed = ?
    WHERE id = ?
");

if (!$stmt) {
    http_response_code(500);
    echo json_encode(['error' => $conn->error, 'success' => false]);
    exit;
}

$stmt->bind_param('sssssii', $text, $priority, $dueDate, $status, $timerDate, $completed, $id);

if ($stmt->execute()) {
    echo json_encode([
        'success' => true,
        'id' => $id,
        'message' => 'Todo updated successfully'
    ]);
} else {
    http_response_code(500);
    echo json_encode(['error' => $stmt->error, 'success' => false]);
}

$stmt->close();
?>
