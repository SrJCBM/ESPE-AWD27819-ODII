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
// Agregar más rutas cuando estén listas:
// require __DIR__ . '/../src/Features/Destinations/DestinationRoutes.php';

// 4) Ruta Home (): renderiza tu vista
$router->get('/', function () {
    // Sirve la vista de Home si la tienes
    readfile(__DIR__ . '/../src/views/home/index.html');
});

// 4.1) Rutas de vistas (front controller)

// Destinos
$router->get('/destinations', function () {
  readfile(__DIR__ . '/../src/views/destinations/destinations.html');
});

// Viajes (listado) y Presupuesto
$router->get('/trips', function () {
  readfile(__DIR__ . '/../src/views/trips/trips.html');
});
$router->get('/budget', function () {
  readfile(__DIR__ . '/../src/views/trips/budget.html');
});

// Rutas
$router->get('/routes', function () {
  readfile(__DIR__ . '/../src/views/routes/route.html');
});

// Clima
$router->get('/weather', function () {
  readfile(__DIR__ . '/../src/views/weather/weather.html');
});

// Itinerario
$router->get('/itinerary', function () {
  readfile(__DIR__ . '/../src/views/itinerary/itinerary.html');
});

// Auth
$router->get('/auth/login', function () {
  readfile(__DIR__ . '/../src/views/auth/login.html');
});
$router->get('/auth/register', function () {
  readfile(__DIR__ . '/../src/views/auth/register.html');
});

// === API bootstrap (Auth + Mongo) ===
// Helpers JSON
function json($data, int $code = 200) {
  http_response_code($code);
  header('Content-Type: application/json');
  echo json_encode($data);
}
function body() { return json_decode(file_get_contents('php://input'), true) ?? []; }

// Sesión (cookie segura en prod con HTTPS)
session_set_cookie_params(['httponly'=>true, 'secure'=>false, 'samesite'=>'Lax']);
if (session_status() !== PHP_SESSION_ACTIVE) { session_start(); }

// Conexión Mongo (PHPLIB oficial)
$mongoClient = new MongoDB\Client(getenv('MONGO_URI') ?: 'mongodb://localhost:27017');
$mongoDb     = $mongoClient->selectDatabase(getenv('MONGO_DB') ?: 'travel_planner');
$usersCol    = $mongoDb->selectCollection('users');
// Índices de unicidad (idempotentes)
$usersCol->createIndex(['username'=>1], ['unique'=>true]);
$usersCol->createIndex(['email'=>1],    ['unique'=>true]);

// POST /api/auth/register
$router->post('/api/auth/register', function () use ($usersCol) {
  $d = body();
  foreach (['username','email','password'] as $k) {
    if (empty($d[$k])) return json(['ok'=>false,'msg'=>"Missing $k"], 400);
  }
  $exists = $usersCol->findOne(['$or'=>[['username'=>$d['username']], ['email'=>$d['email']]]]);
  if ($exists) return json(['ok'=>false,'msg'=>'User exists'], 409);

  $hash = password_hash($d['password'], PASSWORD_BCRYPT);
  $res  = $usersCol->insertOne([
    'username'=>$d['username'],
    'email'=>$d['email'],
    'password'=>$hash,
    'firstname'=>$d['firstname'] ?? '',
    'lastname'=>$d['lastname'] ?? '',
    'role'=>'USER',
    'status'=>'ACTIVE',
    'createdAt'=>new MongoDB\BSON\UTCDateTime()
  ]);

  $_SESSION['uid'] = (string)$res->getInsertedId();
  return json(['ok'=>true,'id'=>(string)$res->getInsertedId()], 201);
});

// POST /api/auth/login
$router->post('/api/auth/login', function () use ($usersCol) {
  $d = body();
  if (empty($d['username']) || empty($d['password'])) {
    return json(['ok'=>false,'msg'=>'Missing credentials'], 400);
  }
  $u = $usersCol->findOne(['$or'=>[
    ['username'=>$d['username']],
    ['email'=>$d['username']]
  ]]);
  if (!$u || !password_verify($d['password'], $u['password'])) {
    return json(['ok'=>false,'msg'=>'Invalid credentials'], 401);
  }
  $_SESSION['uid'] = (string)$u['_id'];
  return json(['ok'=>true]);
});

// GET /api/auth/me
$router->get('/api/auth/me', function () use ($usersCol) {
  if (empty($_SESSION['uid'])) return json(['ok'=>false], 401);
  $u = $usersCol->findOne(
    ['_id'=>new MongoDB\BSON\ObjectId($_SESSION['uid'])],
    ['projection'=>['password'=>0]]
  );
  return json(['ok'=>true,'user'=>$u]);
});

// POST /api/auth/logout
$router->post('/api/auth/logout', function () {
  $_SESSION = [];
  if (session_id()) session_destroy();
  return json(['ok'=>true]);
});

// Ping de salud (opcional)
$router->get('/health', function () use ($mongoDb) {
  $mongoDb->command(['ping'=>1]);
  return json(['ok'=>1]);
});



// 5) Despachar
$router->dispatch($_SERVER['REQUEST_METHOD'], $_SERVER['REQUEST_URI']);
