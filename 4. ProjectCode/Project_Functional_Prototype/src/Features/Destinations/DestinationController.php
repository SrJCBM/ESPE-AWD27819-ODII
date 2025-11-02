<?php
namespace App\Features\Destinations;

use App\Core\Http\Response;
use App\Core\Http\Request;
use App\Core\Auth\AuthMiddleware;
use App\Core\Constants\ValidationRules;
use App\Features\Destinations\DestinationService;
use App\Features\Destinations\DestinationRepositoryMongo;

final class DestinationController {
  private DestinationService $service;
  private const NOT_FOUND_MSG = 'Destino no encontrado';

  public function __construct() {
    $repo = new DestinationRepositoryMongo();
    $this->service = new DestinationService($repo);
  }

  public function index(): void {
    try {
      $page = max(ValidationRules::DEFAULT_PAGE, (int)Request::get('page', ValidationRules::DEFAULT_PAGE));
      $size = max(1, min(ValidationRules::MAX_PAGE_SIZE, (int)Request::get('size', ValidationRules::DEFAULT_PAGE_SIZE)));
      $search = Request::get('search');
      $userId = AuthMiddleware::getUserId();

      if (!$userId) {
        Response::error('No autenticado', 401);
        return;
      }
      
      $destinations = $this->service->list($page, $size, $userId, $search);
      Response::json([
        'ok' => true,
        'items' => $destinations,
        'page' => $page,
        'size' => $size
      ]);
    } catch (\Throwable $exception) {
      error_log('Error en index destinations: ' . $exception->getMessage());
      Response::error('Error al obtener destinos', 500);
    }
  }

  public function show(string $id): void {
    try {
      $destination = $this->service->get($id);
      
      if (!$destination) {
        Response::error('Destino no encontrado', 404);
        return;
      }
      
      Response::json(['ok' => true, 'destination' => $destination]);
    } catch (\Throwable $exception) {
      error_log('Error en show destination: ' . $exception->getMessage());
      Response::error('Error al obtener destino', 500);
    }
  }

  public function store(): void {
    try {
      $body = Request::body();
      $userId = AuthMiddleware::getUserId();
      
      $destinationId = $this->service->create($body, $userId);
      Response::json(['ok' => true, 'id' => $destinationId], 201);
    } catch (\InvalidArgumentException $exception) {
      Response::error($exception->getMessage(), 400);
    } catch (\Throwable $exception) {
      error_log('Error en store destination: ' . $exception->getMessage());
      Response::error('Error al crear destino', 500);
    }
  }

  public function update(string $id): void {
    try {
      $body = Request::body();
      $requestUserId = AuthMiddleware::getUserId();
      $isAdmin = AuthMiddleware::isAdmin();
      $success = $this->service->update($id, $body, $requestUserId, $isAdmin);
      
      if (!$success) {
        Response::error(self::NOT_FOUND_MSG, 404);
        return;
      }
      
      Response::json(['ok' => true]);
    } catch (\DomainException $exception) {
      Response::error($exception->getMessage(), 403);
    } catch (\InvalidArgumentException $exception) {
      Response::error($exception->getMessage(), 400);
    } catch (\Throwable $exception) {
      error_log('Error en update destination: ' . $exception->getMessage());
      Response::error('Error al actualizar destino', 500);
    }
  }

  public function destroy(string $id): void {
    try {
      $requestUserId = AuthMiddleware::getUserId();
      $isAdmin = AuthMiddleware::isAdmin();
      $success = $this->service->delete($id, $requestUserId, $isAdmin);
      
      if (!$success) {
        Response::error(self::NOT_FOUND_MSG, 404);
        return;
      }
      
      Response::json(['ok' => true]);
    } catch (\DomainException $exception) {
      Response::error($exception->getMessage(), 403);
    } catch (\Throwable $exception) {
      error_log('Error en destroy destination: ' . $exception->getMessage());
      Response::error('Error al eliminar destino', 500);
    }
  }
}

