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
    $normalized = $this->normalizeInput($input);
    $this->validator->validateForCreate($normalized);

    // Verificar unicidad de email
    if ($this->repo->findByEmail($normalized['email'])) {
      throw new \DomainException('Email ya existe');
    }

    // Verificar unicidad de username
    if (!empty($normalized['username']) && $this->repo->findByUsername($normalized['username'])) {
      throw new \DomainException('Usuario ya existe');
    }

    // Normalizar nombre: si vienen firstname y lastname, combinarlos
    $name = $normalized['name'];

    $data = [
      'username'     => $normalized['username'] ?? '',
      'email'        => $normalized['email'],
      'name'        => $name,
      'role'         => \App\Core\Constants\UserRoles::REGISTERED,
      'status'       => \App\Core\Constants\UserStatus::ACTIVE,
      'passwordHash' => password_hash($normalized['password'], PASSWORD_BCRYPT)
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

  private function normalizeInput(array $input): array {
    $username = trim((string)($input['username'] ?? ''));
    $email = trim((string)($input['email'] ?? ''));
    $password = (string)($input['password'] ?? '');

    $passwordConfirm = $input['password_confirm'] ?? $input['password2'] ?? null;
    if (is_string($passwordConfirm)) {
      $passwordConfirm = trim($passwordConfirm);
    }

    $firstname = trim((string)($input['firstname'] ?? ''));
    $lastname = trim((string)($input['lastname'] ?? ''));

    $name = trim((string)($input['name'] ?? ''));
    if ($name === '') {
      $name = trim(trim($firstname . ' ' . $lastname));
    }

    return [
      'username' => $username,
      'email' => $email,
      'password' => $password,
      'password_confirm' => $passwordConfirm,
      'firstname' => $firstname,
      'lastname' => $lastname,
      'name' => $name,
    ];
  }
}
