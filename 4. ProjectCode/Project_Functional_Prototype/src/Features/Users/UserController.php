<?php
namespace App\Features\Users;

use App\Core\Http\Response;
use App\Core\Http\Request;
use App\Core\Auth\AuthMiddleware;
use App\Core\Database\MongoConnection;
use MongoDB\BSON\ObjectId;

final class UserController {
  private UserService $service;

  public function __construct() {
    $repository = new UserRepositoryMongo();
    $this->service = new UserService($repository);
  }

  /**
   * GET /api/users/me - Obtener perfil del usuario actual
   */
  public function showMe(): void {
    AuthMiddleware::startSession();
    if (!AuthMiddleware::isAuthenticated()) {
      Response::error('No autenticado', 401);
      return;
    }

    $userId = AuthMiddleware::getUserId();
    $user = $this->service->get($userId);

    if (!$user) {
      Response::error('Usuario no encontrado', 404);
      return;
    }

    // No devolver el hash de la contraseña
    unset($user['passwordHash']);

    Response::json($user);
  }

  /**
   * PUT /api/users/me - Actualizar perfil del usuario actual
   */
  public function updateMe(): void {
    AuthMiddleware::startSession();
    if (!AuthMiddleware::isAuthenticated()) {
      Response::error('No autenticado', 401);
      return;
    }

    $userId = AuthMiddleware::getUserId();

    try {
      $body = Request::body();
      
      // No permitir cambiar rol ni status desde este endpoint
      unset($body['role'], $body['status'], $body['passwordHash'], $body['password']);

      $success = $this->service->update($userId, $body, false);

      if ($success) {
        Response::json(['ok' => true, 'msg' => 'Perfil actualizado correctamente']);
      } else {
        Response::error('No se pudo actualizar el perfil', 400);
      }
    } catch (\Throwable $exception) {
      Response::error($exception->getMessage(), 400);
    }
  }

  /**
   * DELETE /api/users/me - Eliminar cuenta propia
   */
  public function deleteMe(): void {
    AuthMiddleware::startSession();
    if (!AuthMiddleware::isAuthenticated()) {
      Response::error('No autenticado', 401);
      return;
    }

    $userId = AuthMiddleware::getUserId();

    try {
      $deleted = $this->service->delete($userId);

      if ($deleted) {
        // Cerrar sesión
        AuthMiddleware::destroySession();
        Response::json(['ok' => true, 'msg' => 'Cuenta eliminada correctamente']);
      } else {
        Response::error('No se pudo eliminar la cuenta', 400);
      }
    } catch (\Throwable $exception) {
      Response::error($exception->getMessage(), 400);
    }
  }

  /**
   * PUT /api/users/me/password - Cambiar contraseña
   */
  public function changePassword(): void {
    AuthMiddleware::startSession();
    if (!AuthMiddleware::isAuthenticated()) {
      Response::error('No autenticado', 401);
      return;
    }

    $userId = AuthMiddleware::getUserId();

    try {
      $body = Request::body();
      $currentPassword = $body['currentPassword'] ?? '';
      $newPassword = $body['newPassword'] ?? '';

      if (empty($currentPassword) || empty($newPassword)) {
        Response::error('Se requiere la contraseña actual y la nueva', 400);
        return;
      }

      if (strlen($newPassword) < 6) {
        Response::error('La nueva contraseña debe tener al menos 6 caracteres', 400);
        return;
      }

      $success = $this->service->changePassword($userId, $currentPassword, $newPassword);

      if ($success) {
        Response::json(['ok' => true, 'msg' => 'Contraseña cambiada correctamente']);
      } else {
        Response::error('Contraseña actual incorrecta', 400);
      }
    } catch (\Throwable $exception) {
      Response::error($exception->getMessage(), 400);
    }
  }

  /**
   * GET /api/users/me/rates/{page}/{limit} - Ratings del usuario actual
   */
  public function myRates(string $page = '1', string $limit = '10'): void {
    AuthMiddleware::startSession();
    if (!AuthMiddleware::isAuthenticated()) {
      Response::error('No autenticado', 401);
      return;
    }

    $userId = AuthMiddleware::getUserId();
    $pageNum = max(1, (int)$page);
    $limitNum = max(1, min(100, (int)$limit));

    try {
      $db = MongoConnection::client()->selectDatabase(getenv('MONGO_DB') ?: 'travel_brain');
      $ratesCol = $db->selectCollection('rates');

      $filter = ['userId' => new ObjectId($userId)];
      $total = $ratesCol->countDocuments($filter);

      $cursor = $ratesCol->find($filter, [
        'skip' => ($pageNum - 1) * $limitNum,
        'limit' => $limitNum,
        'sort' => ['createdAt' => -1]
      ]);

      $items = [];
      foreach ($cursor as $doc) {
        $arr = (array)$doc;
        $arr['_id'] = (string)$arr['_id'];
        $arr['userId'] = (string)$arr['userId'];
        if (isset($arr['destinationId'])) {
          $arr['destinationId'] = (string)$arr['destinationId'];
        }
        $items[] = $arr;
      }

      Response::json([
        'items' => $items,
        'total' => $total,
        'page' => $pageNum,
        'limit' => $limitNum,
        'pages' => ceil($total / $limitNum)
      ]);
    } catch (\Throwable $e) {
      Response::error($e->getMessage(), 500);
    }
  }

  public function index(): void {
    // Solo administradores pueden listar usuarios
    AuthMiddleware::startSession();
    if (!AuthMiddleware::ensureAdmin()) {
      Response::error('Acceso denegado. Se requieren permisos de administrador', 403);
      return;
    }
    
    $users = $this->service->list();
    Response::json($users);
  }

  public function show(string $id): void {
    // Usuarios autenticados pueden ver su propio perfil o admins pueden ver cualquiera
    AuthMiddleware::startSession();
    if (!AuthMiddleware::isAuthenticated()) {
      Response::error('No autenticado', 401);
      return;
    }
    
    $currentUserId = AuthMiddleware::getUserId();
    $isAdmin = AuthMiddleware::isAdmin();
    
    // Solo puede ver su propio perfil o ser admin
    if ($currentUserId !== $id && !$isAdmin) {
      Response::error('Acceso denegado', 403);
      return;
    }
    
    $user = $this->service->get($id);
    
    if (!$user) {
      Response::error('Usuario no encontrado', 404);
      return;
    }

    Response::json($user);
  }

  public function store(): void {
    // Solo administradores pueden crear usuarios directamente
    AuthMiddleware::startSession();
    if (!AuthMiddleware::ensureAdmin()) {
      Response::error('Acceso denegado. Use /api/auth/register para registro público', 403);
      return;
    }
    
    try {
      $body = Request::body();
      $sessionId = $_COOKIE['sid'] ?? null;
      
      $userId = $this->service->create($body, $sessionId);
      Response::json(['id' => $userId], 201);
    } catch (\Throwable $exception) {
      Response::error($exception->getMessage(), 400);
    }
  }

  public function update(string $id, bool $asAdmin = false): void {
    AuthMiddleware::startSession();
    if (!AuthMiddleware::isAuthenticated()) {
      Response::error('No autenticado', 401);
      return;
    }
    
    $currentUserId = AuthMiddleware::getUserId();
    $isAdmin = AuthMiddleware::isAdmin();
    
    // Solo puede actualizar su propio perfil o ser admin
    if ($currentUserId !== $id && !$isAdmin) {
      Response::error('Acceso denegado', 403);
      return;
    }
    
    try {
      $body = Request::body();
      $success = $this->service->update($id, $body, $isAdmin);
      
      Response::json(['updated' => $success]);
    } catch (\Throwable $exception) {
      Response::error($exception->getMessage(), 400);
    }
  }

  public function destroy(string $id): void {
    // Solo administradores pueden eliminar usuarios
    AuthMiddleware::startSession();
    if (!AuthMiddleware::ensureAdmin()) {
      Response::error('Acceso denegado. Se requieren permisos de administrador', 403);
      return;
    }
    
    $deleted = $this->service->delete($id);
    Response::json(['deleted' => $deleted]);
  }

  /**
   * GET /api/users/me/level - Obtener nivel del usuario actual
   * 
   * REGLA DE NEGOCIO CALCULADA:
   * Calcula automáticamente el nivel basado en:
   * - Viajes completados (+10 pts)
   * - Ratings dados (+5 pts)
   * - Rutas favoritas (+2 pts)
   * - Destinos visitados (+1 pt)
   * 
   * NIVELES:
   * - Bronze: 0-100 puntos (0% descuento)
   * - Silver: 101-500 puntos (5% descuento)
   * - Gold: 501-1000 puntos (10% descuento)
   * - Platinum: 1001+ puntos (15% descuento)
   */
  public function getMyLevel(): void {
    AuthMiddleware::startSession();
    if (!AuthMiddleware::isAuthenticated()) {
      Response::error('No autenticado', 401);
      return;
    }

    $userId = AuthMiddleware::getUserId();

    try {
      $calculator = new UserLevelCalculator();
      $levelData = $calculator->getUserLevel($userId);

      Response::json([
        'ok' => true,
        'level' => $levelData
      ]);
    } catch (\Throwable $e) {
      Response::error($e->getMessage(), 500);
    }
  }

  /**
   * POST /api/users/me/level/recalculate - Recalcular nivel del usuario
   */
  public function recalculateMyLevel(): void {
    AuthMiddleware::startSession();
    if (!AuthMiddleware::isAuthenticated()) {
      Response::error('No autenticado', 401);
      return;
    }

    $userId = AuthMiddleware::getUserId();

    try {
      $calculator = new UserLevelCalculator();
      $levelData = $calculator->recalculate($userId);

      Response::json([
        'ok' => true,
        'msg' => 'Nivel recalculado correctamente',
        'level' => $levelData
      ]);
    } catch (\Throwable $e) {
      Response::error($e->getMessage(), 500);
    }
  }

  /**
   * GET /api/users/leaderboard - Ranking de usuarios por puntos
   */
  public function getLeaderboard(): void {
    try {
      $calculator = new UserLevelCalculator();
      $leaderboard = $calculator->getLeaderboard(10);

      Response::json([
        'ok' => true,
        'leaderboard' => $leaderboard
      ]);
    } catch (\Throwable $e) {
      Response::error($e->getMessage(), 500);
    }
  }
}
