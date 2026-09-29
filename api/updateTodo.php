<?php
require 'config.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['id']) || !isset($data['text'])) {
    http_response_code(400);
    echo json_encode(['error' => 'ID and text are required', 'success' => false]);
    exit;
}

$id = (int)$data['id'];
$text = $data['text'];
$priority = $data['priority'] ?? 'medium';
$dueDate = !empty($data['dueDate']) ? $data['dueDate'] : null;
$timerDate = !empty($data['timerDate']) ? $data['timerDate'] : null;
$status = $data['status'] ?? 'backlog';
$completed = isset($data['completed']) ? (int)$data['completed'] : 0;

try {
    $stmt = $conn->prepare("
        UPDATE todos 
        SET title = ?, priority = ?, \"dueDate\" = ?, status = ?, \"timerDate\" = ?, completed = ?
        WHERE id = ?
    ");
    $stmt->execute([$text, $priority, $dueDate, $status, $timerDate, $completed, $id]);

    echo json_encode([
        'success' => true,
        'id' => $id,
        'message' => 'Todo updated successfully'
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage(), 'success' => false]);
}
?>
