<?php
namespace App\Features\Users;
final class UserValidator {
  public function validateForCreate(array $d): void {
    if (empty($d['email']) || !filter_var($d['email'], FILTER_VALIDATE_EMAIL))
        throw new \InvalidArgumentException('Email inválido');
    if (empty($d['name']))
        throw new \InvalidArgumentException('Nombre requerido');
    if (empty($d['password']) || strlen($d['password'])<6)
        throw new \InvalidArgumentException('Password mínimo 6 caracteres');
  }
  public function validateForUpdate(array $d): void {
    if (isset($d['email']) && !filter_var($d['email'], FILTER_VALIDATE_EMAIL)) 
        throw new \InvalidArgumentException('Email inválido');
  }
}
