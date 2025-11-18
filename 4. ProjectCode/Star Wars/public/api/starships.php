<?php
declare(strict_types=1);

use App\Config;
use App\MongoConnection;
use App\Starship;
use App\StarshipRepository;

require_once __DIR__ . '/../../bootstrap.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

try {
    $conn = new MongoConnection(Config::mongoUri(), Config::dbName());
    $collection = $conn->getCollection(Config::collectionName());
    $repo = new StarshipRepository($collection);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'DB connection failed', 'details' => $e->getMessage()]);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

switch ($method) {
    case 'GET':
        $name = isset($_GET['name']) ? trim((string)$_GET['name']) : '';
        if ($name !== '') {
            $items = $repo->findByName($name);
        } else {
            $items = $repo->findAll();
        }
        echo json_encode(array_map(fn($s) => $s->toArray(), $items));
        break;

    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);
        if (!is_array($input)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid JSON body']);
            break;
        }
        $validation = validate($input);
        if ($validation !== true) {
            http_response_code(422);
            echo json_encode(['error' => 'Validation failed', 'details' => $validation]);
            break;
        }
        $starship = new Starship([
            'name' => $input['name'],
            'model' => $input['model'],
            'manufacturer' => $input['manufacturer'],
            'maxDistanceParsec' => (float)$input['maxDistanceParsec'],
            'hyperdriveRating' => (float)$input['hyperdriveRating'],
        ]);
        $saved = $repo->insert($starship);
        echo json_encode($saved->toArray());
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}

function validate(array $data)
{
    $errors = [];
    $required = ['name','model','manufacturer','maxDistanceParsec','hyperdriveRating'];
    foreach ($required as $key) {
        if (!isset($data[$key]) || $data[$key] === '') {
            $errors[$key] = 'Required';
        }
    }
    if (isset($data['maxDistanceParsec'])) {
        if (!is_numeric($data['maxDistanceParsec']) || (float)$data['maxDistanceParsec'] <= 0) {
            $errors['maxDistanceParsec'] = 'Must be a positive number';
        }
    }
    if (isset($data['hyperdriveRating'])) {
        if (!is_numeric($data['hyperdriveRating']) || (float)$data['hyperdriveRating'] <= 0) {
            $errors['hyperdriveRating'] = 'Must be a positive number';
        }
    }
    if (strlen((string)($data['name'] ?? '')) > 100) {
        $errors['name'] = 'Max 100 chars';
    }
    if (strlen((string)($data['model'] ?? '')) > 100) {
        $errors['model'] = 'Max 100 chars';
    }
    if (strlen((string)($data['manufacturer'] ?? '')) > 120) {
        $errors['manufacturer'] = 'Max 120 chars';
    }

    return empty($errors) ? true : $errors;
}
