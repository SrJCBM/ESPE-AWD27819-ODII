<?php
namespace App\Features\Trips;

use App\Core\Database\MongoConnection;
use MongoDB\Collection;
use MongoDB\BSON\ObjectId;
use MongoDB\BSON\UTCDateTime;

final class TripRepositoryMongo {
  private Collection $collection;

  public function __construct() {
    $db = MongoConnection::client()->selectDatabase(getenv('MONGO_DB') ?: 'travel_brain');
    $this->collection = $db->selectCollection('trips');
  }

  public function findById(string $id): ?array {
    try {
      $trip = $this->collection->findOne(['_id' => new ObjectId($id)]);
      return $trip ? $this->formatDates((array)$trip) : null;
    } catch (\Exception $e) {
      error_log('Error finding trip by id: ' . $e->getMessage());
      return null;
    }
  }

  public function findByUserId(string $userId, int $skip, int $limit): array {
    try {
      $cursor = $this->collection->find(
        ['userId' => $userId],
        [
          'sort' => ['createdAt' => -1],
          'skip' => $skip,
          'limit' => $limit
        ]
      );
      
      return array_map(fn($doc) => $this->formatDates((array)$doc), iterator_to_array($cursor));
    } catch (\Exception $e) {
      error_log('Error finding trips by user: ' . $e->getMessage());
      return [];
    }
  }

  public function countByUserId(string $userId): int {
    try {
      return $this->collection->countDocuments(['userId' => $userId]);
    } catch (\Exception $e) {
      error_log('Error counting trips: ' . $e->getMessage());
      return 0;
    }
  }

  public function create(array $data): string {
    try {
      // Debug log of payload (no passwords or sensitive data here)
      error_log('TripRepositoryMongo.create inserting: ' . json_encode([
        'userId' => $data['userId'] ?? null,
        'title' => $data['title'] ?? null,
        'destination' => $data['destination'] ?? null,
        'startDateType' => isset($data['startDate']) ? get_class($data['startDate']) : null,
        'endDateType' => isset($data['endDate']) ? get_class($data['endDate']) : null,
      ]));
      $result = $this->collection->insertOne($data);
      return (string)$result->getInsertedId();
    } catch (\Exception $e) {
      error_log('Error creating trip: ' . $e->getMessage() . ' TRACE: ' . $e->getTraceAsString());
      throw new \RuntimeException('Error al crear el viaje');
    }
  }

  public function update(string $id, array $data): bool {
    try {
      $result = $this->collection->updateOne(
        ['_id' => new ObjectId($id)],
        ['$set' => $data]
      );
      
      return $result->getModifiedCount() > 0;
    } catch (\Exception $e) {
      error_log('Error updating trip: ' . $e->getMessage());
      return false;
    }
  }

  public function delete(string $id): bool {
    try {
      $result = $this->collection->deleteOne(['_id' => new ObjectId($id)]);
      return $result->getDeletedCount() > 0;
    } catch (\Exception $e) {
      error_log('Error deleting trip: ' . $e->getMessage());
      return false;
    }
  }

  /**
   * Formatea fechas MongoDB a string legible
   */
  private function formatDates(array $doc): array {
    $dateFields = ['createdAt', 'updatedAt', 'startDate', 'endDate'];
    
    // Convertir _id a string
    if (isset($doc['_id'])) {
      $doc['_id'] = (string)$doc['_id'];
    }
    
    foreach ($dateFields as $field) {
      if (isset($doc[$field])) {
        $doc[$field] = $this->formatDate($doc[$field]);
      }
    }
    return $doc;
  }

  private function formatDate($date): string {
    if ($date === null) return '';
    
    if ($date instanceof UTCDateTime) {
      return $date->toDateTime()->format('Y-m-d H:i:s');
    }
    
    if (is_array($date) || is_object($date)) {
      $arr = (array)$date;
      if (isset($arr['$date'])) {
        $inner = (array)$arr['$date'];
        if (isset($inner['$numberLong'])) {
          $ts = (int)$inner['$numberLong'] / 1000;
          return date('Y-m-d H:i:s', (int)$ts);
        }
      }
    }
    
    return is_string($date) ? $date : '';
  }
}
