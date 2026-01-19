<?php
namespace App\Features\Users;

use App\Core\Database\MongoDBConnection;
use MongoDB\BSON\ObjectId;

/**
 * UserLevelCalculator Service
 * 
 * Servicio que calcula y actualiza el nivel del usuario basado en su actividad.
 * Implementa las reglas de negocio calculadas para el sistema de gamificación.
 * 
 * PUNTOS POR ACTIVIDAD:
 * - Viaje completado: +10 puntos
 * - Rating/Reseña: +5 puntos
 * - Ruta favorita: +2 puntos  
 * - Destino visitado: +1 punto
 */
final class UserLevelCalculator {
  
  private const POINTS_PER_TRIP = 10;
  private const POINTS_PER_RATING = 5;
  private const POINTS_PER_ROUTE = 2;
  private const POINTS_PER_DESTINATION = 1;

  private $db;
  private $collection;

  public function __construct() {
    $this->db = MongoDBConnection::getDatabase();
    $this->collection = $this->db->selectCollection('user_levels');
  }

  /**
   * Calcula el nivel del usuario basado en sus estadísticas actuales
   */
  public function calculateForUser(string $userId): UserLevel {
    $stats = $this->getUserStats($userId);
    
    // Calcular puntos totales basados en actividad
    $points = $this->calculatePoints(
      $stats['tripsCompleted'],
      $stats['ratingsGiven'],
      $stats['routesSaved'],
      $stats['destinationsVisited']
    );

    // Crear o actualizar UserLevel
    $userLevel = new UserLevel(
      userId: new ObjectId($userId),
      points: $points,
      tripsCompleted: $stats['tripsCompleted'],
      ratingsGiven: $stats['ratingsGiven'],
      routesSaved: $stats['routesSaved'],
      destinationsVisited: $stats['destinationsVisited']
    );

    // Guardar en base de datos
    $this->saveUserLevel($userId, $userLevel);

    return $userLevel;
  }

  /**
   * Obtiene el nivel actual del usuario (sin recalcular)
   */
  public function getUserLevel(string $userId): ?array {
    $doc = $this->collection->findOne(['userId' => new ObjectId($userId)]);
    
    if (!$doc) {
      // Si no existe, calcular por primera vez
      $userLevel = $this->calculateForUser($userId);
      return $userLevel->toArray();
    }

    return UserLevel::fromDocument((array)$doc)->toArray();
  }

  /**
   * Recalcula el nivel del usuario (útil después de una acción)
   */
  public function recalculate(string $userId): array {
    $userLevel = $this->calculateForUser($userId);
    return $userLevel->toArray();
  }

  /**
   * Añade puntos manuales (bonus, promociones, etc.)
   */
  public function addBonusPoints(string $userId, int $points, string $reason): array {
    $currentLevel = $this->getUserLevel($userId);
    $newPoints = ($currentLevel['points'] ?? 0) + $points;

    // Actualizar puntos
    $this->collection->updateOne(
      ['userId' => new ObjectId($userId)],
      [
        '$set' => [
          'points' => $newPoints,
          'updatedAt' => new \MongoDB\BSON\UTCDateTime()
        ],
        '$push' => [
          'bonusHistory' => [
            'points' => $points,
            'reason' => $reason,
            'date' => new \MongoDB\BSON\UTCDateTime()
          ]
        ]
      ]
    );

    // Recalcular nivel
    return $this->recalculate($userId);
  }

  /**
   * Calcula puntos basados en estadísticas
   */
  private function calculatePoints(
    int $trips,
    int $ratings,
    int $routes,
    int $destinations
  ): int {
    return (
      ($trips * self::POINTS_PER_TRIP) +
      ($ratings * self::POINTS_PER_RATING) +
      ($routes * self::POINTS_PER_ROUTE) +
      ($destinations * self::POINTS_PER_DESTINATION)
    );
  }

  /**
   * Obtiene las estadísticas del usuario desde las diferentes colecciones
   */
  private function getUserStats(string $userId): array {
    $userOid = new ObjectId($userId);
    
    // Contar viajes completados (fecha de fin <= hoy)
    $tripsCollection = $this->db->selectCollection('trips');
    $today = new \MongoDB\BSON\UTCDateTime();
    $tripsCompleted = $tripsCollection->countDocuments([
      'userId' => $userOid,
      'end_date' => ['$lte' => date('Y-m-d')]
    ]);

    // Contar ratings dados
    $ratingsCollection = $this->db->selectCollection('ratings');
    $ratingsGiven = $ratingsCollection->countDocuments([
      'userId' => $userOid
    ]);

    // Contar rutas favoritas
    $routesCollection = $this->db->selectCollection('favorite_routes');
    $routesSaved = $routesCollection->countDocuments([
      'userId' => $userOid
    ]);

    // Contar destinos únicos visitados (de viajes)
    $destinationsVisited = 0;
    try {
      $pipeline = [
        ['$match' => ['userId' => $userOid]],
        ['$group' => ['_id' => '$destination']],
        ['$count' => 'total']
      ];
      $result = $tripsCollection->aggregate($pipeline)->toArray();
      $destinationsVisited = $result[0]['total'] ?? 0;
    } catch (\Exception $e) {
      // Silenciar errores de agregación
    }

    return [
      'tripsCompleted' => $tripsCompleted,
      'ratingsGiven' => $ratingsGiven,
      'routesSaved' => $routesSaved,
      'destinationsVisited' => $destinationsVisited
    ];
  }

  /**
   * Guarda o actualiza el UserLevel en la base de datos
   */
  private function saveUserLevel(string $userId, UserLevel $userLevel): void {
    $data = $userLevel->toArray();
    $data['userId'] = new ObjectId($userId);
    $data['updatedAt'] = new \MongoDB\BSON\UTCDateTime();
    unset($data['createdAt']); // No sobrescribir createdAt

    $this->collection->updateOne(
      ['userId' => new ObjectId($userId)],
      [
        '$set' => $data,
        '$setOnInsert' => ['createdAt' => new \MongoDB\BSON\UTCDateTime()]
      ],
      ['upsert' => true]
    );
  }

  /**
   * Obtiene el ranking de usuarios por puntos
   */
  public function getLeaderboard(int $limit = 10): array {
    $cursor = $this->collection->find(
      [],
      [
        'sort' => ['points' => -1],
        'limit' => $limit,
        'projection' => [
          'userId' => 1,
          'level' => 1,
          'points' => 1,
          'tripsCompleted' => 1
        ]
      ]
    );

    $leaderboard = [];
    $rank = 1;
    foreach ($cursor as $doc) {
      $leaderboard[] = [
        'rank' => $rank++,
        'userId' => (string)$doc['userId'],
        'level' => $doc['level'],
        'points' => $doc['points'],
        'tripsCompleted' => $doc['tripsCompleted'] ?? 0
      ];
    }

    return $leaderboard;
  }
}
