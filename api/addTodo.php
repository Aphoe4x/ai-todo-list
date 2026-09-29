<?php
require 'config.php';

// Get POST data
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['text']) || empty($data['text'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Todo text is required', 'success' => false]);
    exit;
}

$text = $data['text'];
$priority = $data['priority'] ?? 'medium';
$dueDate = !empty($data['dueDate']) ? $data['dueDate'] : NULL;
$timerDate = !empty($data['timerDate']) ? $data['timerDate'] : NULL;
$status = $data['status'] ?? 'backlog';
$description = $data['description'] ?? '';

// Insert todo
$stmt = $conn->prepare("
    INSERT INTO todos (title, description, priority, dueDate, status, timerDate) 
    VALUES (?, ?, ?, ?, ?, ?)
");

if (!$stmt) {
    http_response_code(500);
    echo json_encode(['error' => $conn->error, 'success' => false]);
    exit;
}

$stmt->bind_param('ssssss', $text, $description, $priority, $dueDate, $status, $timerDate);

if ($stmt->execute()) {
    echo json_encode([
        'success' => true,
        'id' => $conn->insert_id,
        'text' => $text,
        'priority' => $priority,
        'dueDate' => $dueDate,
        'status' => $status,
        'timerDate' => $timerDate
    ]);
} else {
    http_response_code(500);
    echo json_encode(['error' => $stmt->error, 'success' => false]);
}

$stmt->close();
?>
