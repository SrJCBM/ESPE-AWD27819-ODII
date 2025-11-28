<?php

// Si se ejecuta con el servidor embebido de PHP y el archivo solicitado existe
// dentro del directorio público, dejar que PHP lo sirva directamente (CSS/JS/IMG)
if (PHP_SAPI === 'cli-server') {
  $path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
  $file = realpath(__DIR__ . $path);
  if ($file && str_starts_with($file, realpath(__DIR__)) && is_file($file)) {
    return false; // delegar al servidor embebido
  }
}

// 1) Autoload de Composer
require __DIR__ . '/../vendor/autoload.php';
require __DIR__ . '/../config/env.php';

// 2) Arrancar Router
use App\Core\Http\Router;
use App\Core\Http\Response;
use App\Core\Http\Request;
use App\Core\Database\MongoConnection;
use App\Core\Constants\UserStatus;
use App\Core\Auth\AuthMiddleware;
use App\Features\Auth\AuthController;
use MongoDB\BSON\ObjectId;
use MongoDB\BSON\UTCDateTime;

$router = new Router();

// 3) Registrar rutas por feature
require __DIR__ . '/../src/Features/Users/UserRoutes.php';
require __DIR__ . '/../src/Features/Destinations/DestinationRoutes.php';
require __DIR__ . '/../src/Features/Trips/TripRoutes.php';
require __DIR__ . '/../src/Features/Routes/RouteFavoritesRoutes.php';
require __DIR__ . '/../src/Features/Currency/CurrencyRoutes.php';
require __DIR__ . '/../src/Features/Weather/WeatherRoutes.php';
require __DIR__ . '/../src/Features/Rates/RateRoutes.php';
require __DIR__ . '/../src/Features/Itinerary/ItineraryRoutes.php';

// ============ HELPERS ============
function requireAuth(): void {
  AuthMiddleware::startSession();
  if (!AuthMiddleware::isAuthenticated()) {
    http_response_code(401);
    header('Location: /auth/login');
    exit;
  }
}

function requireAdmin(): void {
  AuthMiddleware::startSession();
  if (!AuthMiddleware::ensureAdmin()) {
    http_response_code(403);
    Response::error('Acceso denegado', 403);
    exit;
  }
}

// ============ SESIÓN ============
AuthMiddleware::startSession();

// ============ CONEXIÓN MONGO ============
try {
  $mongoClient = MongoConnection::client();
  $mongoDb     = $mongoClient->selectDatabase(getenv('MONGO_DB') ?: 'travel_brain');
  $usersCol    = $mongoDb->selectCollection('users');
} catch (Exception $e) {
  http_response_code(500);
  Response::error('Error de conexión a la base de datos', 500);
  exit;
}

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

$router->get('/favorites', function () {
  requireAuth();
  readfile(__DIR__ . '/../src/views/destinations/favorites.html');
});

$router->get('/trips', function () {
  requireAuth();
  readfile(__DIR__ . '/../src/views/trips/trips-form.html');
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

$router->get('/currency', function () {
  // Guest allowed: consultar tasas en línea mediante Frankfurter
  readfile(__DIR__ . '/../src/views/currency/currency.html');
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
$authController = new AuthController();

// POST /api/auth/register
$router->post('/api/auth/register', [$authController, 'register']);

// POST /api/auth/login
$router->post('/api/auth/login', [$authController, 'login']);

// GET /api/auth/me
$router->get('/api/auth/me', [$authController, 'me']);

// POST /api/auth/logout
$router->post('/api/auth/logout', [$authController, 'logout']);

// ============ API ADMIN USUARIOS ============
// GET /api/admin/users/{page}/{size}
$router->get('/api/admin/users/{page}/{size}', function ($page, $size) use ($usersCol) {
  try {
    requireAdmin();
    $page = max(1, (int)$page);
    $size = max(1, min(100, (int)$size));
    $skip = ($page - 1) * $size;
    
    $cursor = $usersCol->find([], [
      'projection' => ['passwordHash' => 0],
      'skip' => $skip,
      'limit' => $size,
      'sort' => ['createdAt' => -1]
    ]);
    
    $items = array_map(function($user) {
      $user['_id'] = (string)$user['_id'];
      return $user;
    }, iterator_to_array($cursor));
    
    $total = $usersCol->countDocuments();
    Response::json([
      'ok' => true,
      'items' => $items,
      'page' => $page,
      'size' => $size,
      'total' => $total
    ]);
  } catch (Exception $e) {
    Response::error('Error al obtener usuarios: ' . $e->getMessage(), 500);
  }
});

// GET /api/admin/users/{id}
$router->get('/api/admin/users/{id}', function ($id) use ($usersCol) {
  try {
    requireAdmin();
    
    if (!$id || !preg_match('/^[0-9a-fA-F]{24}$/', $id)) {
      Response::error('ID inválido', 400);
      return;
    }
    
    $user = $usersCol->findOne(
      ['_id' => new ObjectId($id)],
      ['projection' => ['passwordHash' => 0]]
    );
    
    if (!$user) {
      Response::error('Usuario no encontrado', 404);
      return;
    }
    
    $user['_id'] = (string)$user['_id'];
    Response::json(['ok' => true, 'user' => $user]);
  } catch (Exception $e) {
    Response::error('Error al obtener usuario: ' . $e->getMessage(), 500);
  }
});

// PUT /api/admin/users/{id}
$router->put('/api/admin/users/{id}', function ($id) use ($usersCol) {
  try {
    requireAdmin();
    
    if (!$id || !preg_match('/^[0-9a-fA-F]{24}$/', $id)) {
      Response::error('ID inválido', 400);
      return;
    }
    
    $body = Request::body();
    if (!$body) {
      Response::error('Cuerpo de solicitud vacío', 400);
      return;
    }
    
    $allowedFields = ['email', 'username', 'name', 'role', 'status'];
    $updateData = [];
    
    foreach ($allowedFields as $field) {
      if (isset($body[$field]) && $body[$field] !== '') {
        $updateData[$field] = $body[$field];
      }
    }
    
    if (empty($updateData)) {
      Response::error('No hay campos válidos para actualizar', 400);
      return;
    }
    
    $result = $usersCol->updateOne(
      ['_id' => new ObjectId($id)],
      ['$set' => $updateData]
    );
    
    if ($result->getMatchedCount() === 0) {
      Response::error('Usuario no encontrado', 404);
      return;
    }
    
    Response::json(['ok' => true]);
  } catch (Exception $e) {
    Response::error('Error al actualizar usuario: ' . $e->getMessage(), 500);
  }
});

// DELETE /api/admin/users/{id}  (soft delete -> status=DEACTIVATED)
$router->delete('/api/admin/users/{id}', function ($id) use ($usersCol) {
  try {
    requireAdmin();
    
    if (!$id || !preg_match('/^[0-9a-fA-F]{24}$/', $id)) {
      Response::error('ID inválido', 400);
      return;
    }
    
    $result = $usersCol->updateOne(
      ['_id' => new ObjectId($id)],
      ['$set' => ['status' => UserStatus::DEACTIVATED]]
    );
    
    if ($result->getMatchedCount() === 0) {
      Response::error('Usuario no encontrado', 404);
      return;
    }
    
    Response::json(['ok' => true]);
  } catch (Exception $e) {
    Response::error('Error al desactivar usuario: ' . $e->getMessage(), 500);
  }
});

// GET /health
$router->get('/health', function () use ($mongoDb) {
  try {
    $mongoDb->command(['ping' => 1]);
    Response::json(['ok' => true, 'status' => 'healthy']);
  } catch (Exception $e) {
    Response::error('Base de datos no disponible', 503);
  }
});

// ============ CONFIG PÚBLICA (solo valores no sensibles) ============
$router->get('/config.js', function () {
  try {
    header('Content-Type: application/javascript');
    $mapboxToken = getenv('MAPBOX_TOKEN') ?: '';
    echo 'globalThis.__CONFIG__ = Object.assign(globalThis.__CONFIG__||{}, { MAPBOX_TOKEN: ' . json_encode($mapboxToken) . ' });';
  } catch (Exception $e) {
    http_response_code(500);
    echo 'console.error("Error loading config");';
  }
  exit;
});

// ============ DEBUG (opcional, requiere token) ============
$router->get('/api/_debug/auth', function () use ($mongoDb) {
  $tokenRequired = getenv('AUTH_DEBUG_TOKEN') ?: getenv('DEBUG_TOKEN') ?: '';
  $provided = Request::get('token', '');
  if ($tokenRequired === '' || !hash_equals($tokenRequired, $provided)) {
    Response::error('Forbidden', 403);
    return;
  }
  $identifier = trim((string)Request::get('user', ''));
  if ($identifier === '') {
    Response::error('user requerido', 400);
    return;
  }
  $col = $mongoDb->selectCollection('users');
  $doc = $col->findOne(['$or' => [['username' => $identifier], ['email' => $identifier]]]);
  if (!$doc) { Response::json(['ok' => true, 'exists' => false]); return; }
  $arr = $doc instanceof \MongoDB\Model\BSONDocument ? $doc->getArrayCopy() : (array)$doc;
  $hash = isset($arr['passwordHash']) && is_string($arr['passwordHash']) ? $arr['passwordHash'] : null;
  $probe = (string)Request::get('pass', '');
  $verify = ($hash && $probe !== '') ? password_verify($probe, $hash) : null;
  Response::json([
    'ok' => true,
    'exists' => true,
    'hasPasswordHash' => $hash !== null,
    'hashPrefix' => $hash ? substr($hash, 0, 7) : null,
    'verify' => $verify
  ]);
});

// ============ DESPACHAR ============
try {
  $router->dispatch($_SERVER['REQUEST_METHOD'], $_SERVER['REQUEST_URI']);
} catch (Exception $e) {
  Response::error('Error interno del servidor', 500);
}
