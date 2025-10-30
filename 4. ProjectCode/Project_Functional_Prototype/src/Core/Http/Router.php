<?php
namespace App\Core\Http;

final class Router {
  private array $routes = [];
  public function get(string $p, callable $h){ $this->routes['GET'][$p]=$h; }
  public function post(string $p, callable $h){ $this->routes['POST'][$p]=$h; }
  public function put(string $p, callable $h){ $this->routes['PUT'][$p]=$h; }
  public function delete(string $p, callable $h){ $this->routes['DELETE'][$p]=$h; }
  public function dispatch(string $m, string $u): void {
    $u = parse_url($u, PHP_URL_PATH);
    if(isset($this->routes[$m][$u])){ call_user_func($this->routes[$m][$u]); return; }
    http_response_code(404); echo '404';
  }
}
