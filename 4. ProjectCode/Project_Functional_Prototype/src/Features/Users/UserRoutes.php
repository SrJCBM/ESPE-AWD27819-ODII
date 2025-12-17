<?php
use App\Core\Http\Router;
use App\Features\Users\UserController;

$c = new UserController();

// Rutas para el usuario actual (autenticado)
$router->get('/api/users/me',          [$c, 'showMe']);
$router->put('/api/users/me',          [$c, 'updateMe']);
$router->delete('/api/users/me',       [$c, 'deleteMe']);
$router->put('/api/users/me/password', [$c, 'changePassword']);
$router->get('/api/users/me/rates/{page}/{limit}', [$c, 'myRates']);

// Rutas CRUD estándar (admin)
$router->get('/users',         [$c,'index']);
$router->post('/users',        [$c,'store']);
$router->get('/users/{id}',    [$c,'show']);
$router->put('/users/{id}',    [$c,'update']);
$router->delete('/users/{id}', [$c,'destroy']);
