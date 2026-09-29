<?php
require 'config.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'ID is required', 'success' => false]);
    exit;
}

$id = (int)$data['id'];

try {
    $stmt = $conn->prepare("DELETE FROM todos WHERE id = ?");
    $stmt->execute([$id]);

    echo json_encode([
        'success' => true,
        'id' => $id,
        'message' => 'Todo deleted successfully'
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage(), 'success' => false]);
}
?>
