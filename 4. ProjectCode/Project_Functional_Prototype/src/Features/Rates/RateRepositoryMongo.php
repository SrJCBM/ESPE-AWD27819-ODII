<?php
namespace App\Features\Rates;

use App\Core\Database\MongoConnection;
use MongoDB\BSON\ObjectId;
use MongoDB\BSON\UTCDateTime;

final class RateRepositoryMongo {
  private $collection;

  public function __construct() {
    $db = MongoConnection::client()->selectDatabase(getenv('MONGO_DB') ?: 'travel_brain');
    $this->collection = $db->selectCollection('rates');
  }

  /**
   * Encuentra todas las calificaciones con paginación
   */
  public function findAll(int $page = 1, int $size = 20, ?string $userId = null, ?string $destinationId = null): array {
    $query = [];
    
    if ($userId) {
      $query['userId'] = $userId;
    }
    
    if ($destinationId) {
      $query['destinationId'] = $destinationId;
    }
    
    $skip = ($page - 1) * $size;
    
    $cursor = $this->collection->find($query, [
      'skip' => $skip,
      'limit' => $size,
      'sort' => ['createdAt' => -1]
    ]);
    
    $items = [];
    foreach ($cursor as $doc) {
      $rate = Rate::fromDocument($doc);
      $arr = $rate->toArray();
      $arr['_id'] = (string)$arr['_id'];
      $items[] = $arr;
    }
    
    return $items;
  }

  /**
   * Encuentra una calificación por ID
   */
  public function findById(string $id): ?array {
    try {
      $doc = $this->collection->findOne(['_id' => new ObjectId($id)]);
      if (!$doc) {
        return null;
      }
      
      $rate = Rate::fromDocument($doc);
      $arr = $rate->toArray();
      $arr['_id'] = (string)$arr['_id'];
      return $arr;
    } catch (\Exception $e) {
      return null;
    }
  }

  /**
   * Encuentra calificación por usuario y destino
   */
  public function findByUserAndDestination(string $userId, string $destinationId): ?array {
    $doc = $this->collection->findOne([
      'userId' => $userId,
      'destinationId' => $destinationId
    ]);
    
    if (!$doc) {
      return null;
    }
    
    $rate = Rate::fromDocument($doc);
    $arr = $rate->toArray();
    $arr['_id'] = (string)$arr['_id'];
    return $arr;
  }

  /**
   * Crea una nueva calificación
   */
  public function create(array $data): string {
    $now = new UTCDateTime();
    $data['createdAt'] = $now;
    $data['updatedAt'] = $now;
    
    $result = $this->collection->insertOne($data);
    return (string)$result->getInsertedId();
  }

  /**
   * Actualiza una calificación existente
   */
  public function update(string $id, array $data): bool {
    try {
      $data['updatedAt'] = new UTCDateTime();
      
      $result = $this->collection->updateOne(
        ['_id' => new ObjectId($id)],
        ['$set' => $data]
      );
      
      return $result->getModifiedCount() > 0;
    } catch (\Exception $e) {
      return false;
    }
  }

  /**
   * Elimina una calificación
   */
  public function delete(string $id): bool {
    try {
      $result = $this->collection->deleteOne(['_id' => new ObjectId($id)]);
      return $result->getDeletedCount() > 0;
    } catch (\Exception $e) {
      return false;
    }
  }

  /**
   * Calcula el promedio de calificaciones para un destino
   */
  public function getAverageRating(string $destinationId): array {
    $pipeline = [
      ['$match' => ['destinationId' => $destinationId]],
      ['$group' => [
        '_id' => '$destinationId',
        'avgRating' => ['$avg' => '$rating'],
        'totalRatings' => ['$sum' => 1]
      ]]
    ];
    
    $result = $this->collection->aggregate($pipeline)->toArray();
    
    if (empty($result)) {
      return ['avgRating' => 0, 'totalRatings' => 0];
    }
    
    return [
      'avgRating' => round($result[0]['avgRating'], 1),
      'totalRatings' => $result[0]['totalRatings']
    ];
  }

  /**
   * Cuenta el total de calificaciones
   */
  public function count(?string $userId = null, ?string $destinationId = null): int {
    $query = [];
    
    if ($userId) {
      $query['userId'] = $userId;
    }
    
    if ($destinationId) {
      $query['destinationId'] = $destinationId;
    }
    
    return $this->collection->countDocuments($query);
  }

  /**
   * Obtiene destinos favoritos del usuario
   */
  public function getFavoritesByUser(string $userId): array {
    $cursor = $this->collection->find(
      ['userId' => $userId, 'favorite' => true],
      ['sort' => ['updatedAt' => -1]]
    );
    
    $items = [];
    foreach ($cursor as $doc) {
      $rate = Rate::fromDocument($doc);
      $arr = $rate->toArray();
      $arr['_id'] = (string)$arr['_id'];
      $items[] = $arr;
    }
    
    return $items;
  }
}
