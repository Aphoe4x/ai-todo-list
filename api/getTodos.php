<?php
require 'config.php';

// Get all todos
$result = $conn->query("
    SELECT * FROM todos 
    ORDER BY created_at DESC
");

if (!$result) {
    http_response_code(500);
    echo json_encode(['error' => $conn->error]);
    exit;
}

$todos = [];
while ($row = $result->fetch_assoc()) {
    $todos[] = [
        'id' => (int)$row['id'],
        'text' => $row['title'],
        'description' => $row['description'],
        'priority' => $row['priority'],
        'completed' => (bool)$row['completed'],
        'dueDate' => $row['dueDate'],
        'status' => $row['status'] ?? 'backlog',
        'timerDate' => $row['timerDate'],
        'createdAt' => $row['created_at']
    ];
}

echo json_encode(['todos' => $todos, 'success' => true]);
?>
