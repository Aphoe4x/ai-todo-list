<?php
require 'config.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['text']) || empty($data['text'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Todo text is required', 'success' => false]);
    exit;
}

$text = $data['text'];
$priority = $data['priority'] ?? 'medium';
$dueDate = !empty($data['dueDate']) ? $data['dueDate'] : null;
$timerDate = !empty($data['timerDate']) ? $data['timerDate'] : null;
$status = $data['status'] ?? 'backlog';
$description = $data['description'] ?? '';

try {
    $stmt = $conn->prepare("
        INSERT INTO todos (title, description, priority, \"dueDate\", status, \"timerDate\") 
        VALUES (?, ?, ?, ?, ?, ?)
        RETURNING id
    ");
    $stmt->execute([$text, $description, $priority, $dueDate, $status, $timerDate]);
    $id = $stmt->fetchColumn();

    echo json_encode([
        'success' => true,
        'id' => (int)$id,
        'text' => $text,
        'priority' => $priority,
        'dueDate' => $dueDate,
        'status' => $status,
        'timerDate' => $timerDate
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage(), 'success' => false]);
}
?>
