<?php
namespace App\Features\Users;

use App\Core\Http\Response;
use App\Core\Http\Request;
use App\Core\Auth\AuthMiddleware;

final class UserController {
  private UserService $service;

  public function __construct() {
    $repository = new UserRepositoryMongo();
    $this->service = new UserService($repository);
  }

  public function index(): void {
    // Requiere admin
    if (!AuthMiddleware::isAdmin()) {
      Response::error('Acceso denegado. Se requiere rol ADMIN', 403);
      return;
    }
    $page = max(1, (int)Request::get('page', 1));
    $size = max(1, min(100, (int)Request::get('size', 20)));
    $items = $this->service->list($page, $size);
    Response::json(['ok' => true, 'items' => $items, 'page' => $page, 'size' => $size]);
  }

  public function show(string $id): void {
    if (!AuthMiddleware::isAdmin()) {
      Response::error('Acceso denegado. Se requiere rol ADMIN', 403);
      return;
    }
    $user = $this->service->get($id);
    
    if (!$user) {
      Response::error('Usuario no encontrado', 404);
      return;
    }

    Response::json(['ok' => true, 'user' => $user]);
  }

  public function store(): void {
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
    try {
      if (!AuthMiddleware::isAdmin() && $asAdmin) {
        Response::error('Acceso denegado. Se requiere rol ADMIN', 403);
        return;
      }
      $body = Request::body();
      $success = $this->service->update($id, $body, $asAdmin);
      
      Response::json(['ok' => true, 'updated' => $success]);
    } catch (\Throwable $exception) {
      Response::error($exception->getMessage(), 400);
    }
  }

  public function destroy(string $id): void {
    if (!AuthMiddleware::isAdmin()) {
      Response::error('Acceso denegado. Se requiere rol ADMIN', 403);
      return;
    }
    $deleted = $this->service->delete($id);
    Response::json(['ok' => true, 'deleted' => $deleted]);
  }
}
