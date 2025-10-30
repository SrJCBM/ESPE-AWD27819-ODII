<?php
namespace App\Features\Users;
final class User {
  public string $email; public string $name; public string $role; public string $status; public string $passwordHash;
  public function __construct(array $d) {
    $this->email=$d['email']; $this->name=$d['name'];
    $this->role=$d['role']??'REGISTERED'; $this->status=$d['status']??'ACTIVE';
    $this->passwordHash=$d['passwordHash'];
  }
  public function toArray(): array {
    return ['email'=>$this->email,'name'=>$this->name,'role'=>$this->role,'status'=>$this->status,'passwordHash'=>$this->passwordHash];
  }
}
