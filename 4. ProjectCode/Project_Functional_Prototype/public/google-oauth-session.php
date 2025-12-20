<?php
/**
 * Google OAuth Login Handler - PHP Backend
 * Este archivo maneja el login de Google OAuth creando una sesión PHP
 */

// Desactivar salida de errores antes de headers
ini_set('display_errors', 0);
error_reporting(E_ALL);

require __DIR__ . '/../vendor/autoload.php';
require __DIR__ . '/../config/env.php';

use App\Core\Auth\AuthMiddleware;
use App\Core\Database\MongoConnection;
use App\Core\Http\Response;
use App\Core\Http\Request;

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:8000');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'msg' => 'Método no permitido']);
    exit;
}

try {
    // Obtener datos del body
    $body = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($body['userId'])) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'msg' => 'ID de usuario no proporcionado']);
        exit;
    }

    $userId = $body['userId'];
    
    // Conectar a MongoDB usando el cliente estático
    $client = MongoConnection::client();
    $db = $client->selectDatabase(getenv('MONGO_DB') ?: 'travel_brain');
    $usersCollection = $db->users;
    
    $user = $usersCollection->findOne([
        '_id' => new \MongoDB\BSON\ObjectId($userId)
    ]);
    
    if (!$user) {
        http_response_code(404);
        echo json_encode(['ok' => false, 'msg' => 'Usuario no encontrado']);
        exit;
    }
    
    // Crear sesión PHP
    AuthMiddleware::startSession();
    AuthMiddleware::setUserId($userId);
    
    // Actualizar lastLogin
    $usersCollection->updateOne(
        ['_id' => new \MongoDB\BSON\ObjectId($userId)],
        [
            '$set' => [
                'lastLogin' => new \MongoDB\BSON\UTCDateTime(),
                'lastLoginLocal' => (new \DateTime())->format('Y-m-d H:i:s')
            ]
        ]
    );
    
    // Retornar éxito
    http_response_code(200);
    echo json_encode([
        'ok' => true,
        'msg' => 'Sesión iniciada correctamente',
        'user' => [
            'id' => (string)$user['_id'],
            'username' => $user['username'] ?? '',
            'email' => $user['email'] ?? '',
            'name' => $user['name'] ?? '',
            'role' => $user['role'] ?? 'USER'
        ]
    ]);
    
} catch (\Exception $e) {
    error_log('Error en Google OAuth PHP: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['ok' => false, 'msg' => 'Error al crear sesión: ' . $e->getMessage()]);
}
