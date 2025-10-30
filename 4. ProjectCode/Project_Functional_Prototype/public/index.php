<?php

// 1) Autoload de Composer
require __DIR__ . '/../vendor/autoload.php';
require __DIR__ . '/../config/env.php';

// 2) Arrancar Router
use App\Core\Http\Router;
use MongoDB\BSON\ObjectId;
use MongoDB\BSON\UTCDateTime;
$router = new Router();

// 3) Registrar rutas por feature
require __DIR__ . '/../src/Features/Users/UserRoutes.php';

// ============ HELPERS ============
function json($data, int $code = 200) {
  http_response_code($code);
  header('Content-Type: application/json');
  echo json_encode($data);
}

function body() { 
  return json_decode(file_get_contents('php://input'), true) ?? []; 
}

/**
 * Valida que el usuario tenga sesión activa.
 * Si no, redirige a /auth/login.
 */
function requireAuth() {
  if (empty($_SESSION['uid'])) {
    http_response_code(401);
    header('Location: /auth/login');
    exit;
  }
}

/**
 * Valida que el usuario sea ADMIN.
 */
function requireAdmin() {
  global $usersCol;
  if (empty($_SESSION['uid'])) {
    http_response_code(401);
    header('Location: /auth/login');
    exit;
  }
  try {
    $u = $usersCol->findOne(
      ['_id' => new MongoDB\BSON\ObjectId($_SESSION['uid'])],
      ['projection' => ['passwordHash' => 0]]
    );
  } catch (Exception $e) {
    http_response_code(500);
    echo 'Error de autenticación';
    exit;
  }
  if (!$u || !isset($u['role']) || strtoupper((string)$u['role']) !== 'ADMIN') {
    http_response_code(403);
    echo 'Forbidden';
    exit;
  }
}

// ============ SESIÓN ============
session_set_cookie_params(['httponly'=>true, 'secure'=>false, 'samesite'=>'Lax']);
if (session_status() !== PHP_SESSION_ACTIVE) { session_start(); }

// ============ CONEXIÓN MONGO ============
$mongoClient = new MongoDB\Client(getenv('MONGO_URI') ?: 'mongodb://localhost:27017');
$mongoDb     = $mongoClient->selectDatabase(getenv('MONGO_DB') ?: 'travel_planner');
$usersCol    = $mongoDb->selectCollection('users');

// ============ RUTAS PÚBLICAS ============
$router->get('/', function () {
  readfile(__DIR__ . '/../src/views/home/index.html');
});

$router->get('/auth/login', function () {
  readfile(__DIR__ . '/../src/views/auth/login.html');
});

$router->get('/auth/register', function () {
  readfile(__DIR__ . '/../src/views/auth/register.html');
});

// ============ RUTAS PROTEGIDAS ============
$router->get('/destinations', function () {
  requireAuth();
  readfile(__DIR__ . '/../src/views/destinations/destinations.html');
});

$router->get('/trips', function () {
  requireAuth();
  readfile(__DIR__ . '/../src/views/trips/trips.html');
});

$router->get('/budget', function () {
  requireAuth();
  readfile(__DIR__ . '/../src/views/trips/budget.html');
});

$router->get('/routes', function () {
  // Guest allowed: visualizar mapa y calcular rutas de ejemplo
  readfile(__DIR__ . '/../src/views/routes/route.html');
});

$router->get('/weather', function () {
  // Guest allowed: consultar clima simulado para un destino único
  readfile(__DIR__ . '/../src/views/weather/weather.html');
});

$router->get('/itinerary', function () {
  requireAuth();
  readfile(__DIR__ . '/../src/views/itinerary/itinerary.html');
});

// ============ VISTA ADMIN ============
$router->get('/admin/users', function () {
  requireAdmin();
  readfile(__DIR__ . '/../src/views/admin/users.html');
});

// ============ API AUTH ============
// POST /api/auth/register
$router->post('/api/auth/register', function () use ($usersCol) {
  $d = body();
  foreach (['username','email','password','firstname','lastname'] as $k) {
    if (empty($d[$k])) {
      json(['ok'=>false,'msg'=>"Missing $k"], 400);
      exit;
    }
  }
  
  $doc = [
    'username'     => $d['username'],
    'email'        => $d['email'],
    'passwordHash' => password_hash($d['password'], PASSWORD_BCRYPT),
    'name'         => trim($d['firstname'].' '.$d['lastname']),
    'role'         => 'REGISTERED',
    'status'       => 'ACTIVE',
    'createdAt'    => new MongoDB\BSON\UTCDateTime(),
    'lastLogin'    => null
  ];
  
  try {
    $res = $usersCol->insertOne($doc);
  } catch (MongoDB\Driver\Exception\BulkWriteException $e) {
    if ($e->getCode() === 11000 || stripos($e->getMessage(), 'E11000') !== false) {
      json(['ok'=>false,'msg'=>'Email o usuario ya existe'], 409);
      exit;
    }
    json(['ok'=>false,'msg'=>'Error al insertar'], 500);
    exit;
  }
  
  $_SESSION['uid'] = (string)$res->getInsertedId();
  json(['ok'=>true,'id'=>(string)$res->getInsertedId()], 201);
  exit;
});

// POST /api/auth/login
$router->post('/api/auth/login', function () use ($usersCol) {
  $d = body();
  if (empty($d['username']) || empty($d['password'])) {
    json(['ok'=>false,'msg'=>'Faltan credenciales'], 400);
    exit;
  }
  
  $u = $usersCol->findOne(['$or'=>[['username'=>$d['username']], ['email'=>$d['username']]]]);
  if (!$u || !password_verify($d['password'], $u['passwordHash'])) {
    json(['ok'=>false,'msg'=>'Credenciales inválidas'], 401);
    exit;
  }
  
  $_SESSION['uid'] = (string)$u['_id'];
  $usersCol->updateOne(['_id'=>$u['_id']], ['$set'=>['lastLogin'=>new MongoDB\BSON\UTCDateTime()]]);
  json(['ok'=>true]);
  exit;
});

// GET /api/auth/me
$router->get('/api/auth/me', function () use ($usersCol) {
  if (empty($_SESSION['uid'])) {
    json(['ok'=>false], 401);
    exit;
  }
  $u = $usersCol->findOne(
    ['_id'=>new MongoDB\BSON\ObjectId($_SESSION['uid'])],
    ['projection'=>['passwordHash'=>0]]
  );
  json(['ok'=>true,'user'=>$u]);
  exit;
});

// POST /api/auth/logout
$router->post('/api/auth/logout', function () {
  $_SESSION = [];
  if (session_id()) { session_destroy(); }
  json(['ok'=>true]);
  exit;
});

// ============ API ADMIN USUARIOS ============
// GET /api/admin/users?page=&size=
$router->get('/api/admin/users', function () use ($usersCol) {
  requireAdmin();
  $page = max(1, (int)($_GET['page'] ?? 1));
  $size = max(1, min(100, (int)($_GET['size'] ?? 10)));
  $skip = ($page - 1) * $size;
  $cursor = $usersCol->find([], [
    'projection' => ['passwordHash' => 0],
    'skip' => $skip,
    'limit' => $size,
    'sort' => ['createdAt' => -1]
  ]);
  $items = array_map(function($u){ $u['_id'] = (string)$u['_id']; return $u; }, iterator_to_array($cursor));
  $total = $usersCol->countDocuments();
  json(['ok'=>true, 'items'=>$items, 'page'=>$page, 'size'=>$size, 'total'=>$total]);
  exit;
});

// GET /api/admin/users/{id}
$router->get('/api/admin/users/{id}', function ($id) use ($usersCol) {
  requireAdmin();
  try {
    $u = $usersCol->findOne(['_id' => new MongoDB\BSON\ObjectId($id)], ['projection' => ['passwordHash' => 0]]);
    if (!$u) {
      json(['ok'=>false,'msg'=>'No encontrado'], 404);
      exit;
    }
    $u['_id'] = (string)$u['_id'];
    json(['ok'=>true,'user'=>$u]);
    exit;
  } catch (Exception $e) {
    json(['ok'=>false,'msg'=>'ID inválido'], 400);
    exit;
  }
});

// PUT /api/admin/users/{id}
$router->put('/api/admin/users/{id}', function ($id) use ($usersCol) {
  requireAdmin();
  $d = body();
  $allowed = [];
  foreach (['email','username','name','role','status'] as $k) {
    if (isset($d[$k])) {
      $allowed[$k] = $d[$k];
    }
  }
  if (!$allowed) {
    json(['ok'=>false,'msg'=>'Nada para actualizar'], 400);
    exit;
  }
  try {
    $res = $usersCol->updateOne(['_id'=> new MongoDB\BSON\ObjectId($id)], ['$set'=>$allowed]);
    if ($res->getMatchedCount() === 0) {
      json(['ok'=>false,'msg'=>'No encontrado'], 404);
      exit;
    }
    json(['ok'=>true]);
    exit;
  } catch (Exception $e) {
    json(['ok'=>false,'msg'=>'Error al actualizar'], 500);
    exit;
  }
});

// DELETE /api/admin/users/{id}  (soft delete -> status=DEACTIVATED)
$router->delete('/api/admin/users/{id}', function ($id) use ($usersCol) {
  requireAdmin();
  try {
    $res = $usersCol->updateOne(['_id'=> new MongoDB\BSON\ObjectId($id)], ['$set'=>['status'=>'DEACTIVATED']]);
    if ($res->getMatchedCount() === 0) {
      json(['ok'=>false,'msg'=>'No encontrado'], 404);
      exit;
    }
    json(['ok'=>true]);
    exit;
  } catch (Exception $e) {
    json(['ok'=>false,'msg'=>'Error al desactivar'], 500);
    exit;
  }
});

// GET /health
$router->get('/health', function () use ($mongoDb) {
  $mongoDb->command(['ping'=>1]);
  json(['ok'=>1]);
  exit;
});

// ============ CONFIG PÚBLICA (solo valores no sensibles) ============
// Sirve MAPBOX_TOKEN al front en tiempo de ejecución
$router->get('/config.js', function () {
  header('Content-Type: application/javascript');
  $mapboxToken = getenv('MAPBOX_TOKEN') ?: '';
  echo 'globalThis.__CONFIG__ = Object.assign(globalThis.__CONFIG__||{}, { MAPBOX_TOKEN: ' . json_encode($mapboxToken) . ' });';
  exit;
});

// ============ DESPACHAR ============
$router->dispatch($_SERVER['REQUEST_METHOD'], $_SERVER['REQUEST_URI']);
