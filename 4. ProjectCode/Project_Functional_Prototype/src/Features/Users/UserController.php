<?php
namespace App\Features\Users;
use App\Core\Http\Response;

final class UserController {
  private UserService $service;
  public function __construct() {
    $repo = new UserRepositoryMongo(); // o factoría por env
    $this->service = new UserService($repo);
  }
  public function index(): void { Response::json($this->service->list()); }
  public function show(string $id): void {
    $u = $this->service->get($id); $u ? Response::json($u) : Response::error('No encontrado',404);
  }
  public function store(): void {
    $body=json_decode(file_get_contents('php://input'),true);
    try { $id=$this->service->create($body, $_COOKIE['sid']??null); Response::json(['id'=>$id],201); }
    catch(\Throwable $e){ Response::error($e->getMessage(),400); }
  }
  public function update(string $id, bool $asAdmin=false): void {
    $body=json_decode(file_get_contents('php://input'),true);
    try { $ok=$this->service->update($id,$body,$asAdmin); Response::json(['updated'=>$ok]); }
    catch(\Throwable $e){ Response::error($e->getMessage(),400); }
  }
  public function destroy(string $id): void { Response::json(['deleted'=>$this->service->delete($id)]); }
}
