<?php
namespace App\Features\Users;

use App\Core\Contracts\UserRepositoryInterface;

final class UserService {
  private UserRepositoryInterface $repo;
  private UserValidator $validator;
  public function __construct(UserRepositoryInterface $repo) {
    $this->repo = $repo;
    $this->validator = new UserValidator();
  }

  public function list(int $page=1,int $size=20): array {
    return $this->repo->findAll($page,$size);
  }

  public function get(string $id): ?array {
    return $this->repo->findById($id);
  }

  public function create(array $input, ?string $sessionId=null): string {
    $this->validator->validateForCreate($input);
    if ($this->repo->findByEmail($input['email'])) throw new \DomainException('Email ya existe');
    $data = [
      'email'        => $input['email'],
      'name'         => $input['name'],
      'role'         => 'REGISTERED',
      'status'       => 'ACTIVE',
      'passwordHash' => password_hash($input['password'], PASSWORD_BCRYPT)
    ];
    $id = $this->repo->create((new User($data))->toArray());
    // Migración guest→registered: aquí moverías favoritos/rutas de sessionId al nuevo userId
    // SessionService::promoteGuest($sessionId, $id);
    return $id;
  }

  public function update(string $id, array $input, bool $asAdmin=false): bool {
    $this->validator->validateForUpdate($input);
    if (!$asAdmin) unset($input['role'], $input['status']);
    return $this->repo->update($id, $input);
  }

  public function delete(string $id, bool $hard=false): bool {
    if ($hard) return $this->repo->delete($id);
    return $this->repo->update($id, ['status'=>'DEACTIVATED']);
  }
}
