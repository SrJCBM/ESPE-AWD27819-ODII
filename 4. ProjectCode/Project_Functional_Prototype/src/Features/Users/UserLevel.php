<?php
namespace App\Features\Users;

use MongoDB\BSON\ObjectId;
use MongoDB\BSON\UTCDateTime;

/**
 * UserLevel Model
 * 
 * Representa el nivel de membresía del usuario basado en puntos y viajes completados.
 * 
 * REGLAS DE NEGOCIO CALCULADAS:
 * - BR-LEVEL-001: Bronze  → 0-100 puntos    → 0% descuento
 * - BR-LEVEL-002: Silver  → 101-500 puntos  → 5% descuento
 * - BR-LEVEL-003: Gold    → 501-1000 puntos → 10% descuento
 * - BR-LEVEL-004: Platinum→ 1001+ puntos    → 15% descuento
 * 
 * SISTEMA DE PUNTOS:
 * - BR-POINTS-001: +10 puntos por viaje completado
 * - BR-POINTS-002: +5 puntos por reseña/rating
 * - BR-POINTS-003: +2 puntos por ruta favorita guardada
 * - BR-POINTS-004: +1 punto por destino visitado
 */
final class UserLevel {
  // Constantes de niveles
  public const LEVEL_BRONZE = 'Bronze';
  public const LEVEL_SILVER = 'Silver';
  public const LEVEL_GOLD = 'Gold';
  public const LEVEL_PLATINUM = 'Platinum';

  // Umbrales de puntos
  public const THRESHOLD_SILVER = 101;
  public const THRESHOLD_GOLD = 501;
  public const THRESHOLD_PLATINUM = 1001;

  // Descuentos por nivel
  public const DISCOUNT_BRONZE = 0;
  public const DISCOUNT_SILVER = 5;
  public const DISCOUNT_GOLD = 10;
  public const DISCOUNT_PLATINUM = 15;

  // Propiedades
  public ?ObjectId $id;
  public ObjectId $userId;
  public string $level;
  public int $points;
  public int $tripsCompleted;
  public int $ratingsGiven;
  public int $routesSaved;
  public int $destinationsVisited;
  public float $discountPercentage;
  public array $benefits;
  public UTCDateTime $createdAt;
  public UTCDateTime $updatedAt;

  public function __construct(
    ObjectId $userId,
    int $points = 0,
    int $tripsCompleted = 0,
    int $ratingsGiven = 0,
    int $routesSaved = 0,
    int $destinationsVisited = 0,
    ?ObjectId $id = null
  ) {
    $this->id = $id;
    $this->userId = $userId;
    $this->points = $points;
    $this->tripsCompleted = $tripsCompleted;
    $this->ratingsGiven = $ratingsGiven;
    $this->routesSaved = $routesSaved;
    $this->destinationsVisited = $destinationsVisited;
    
    // Calcular nivel y beneficios automáticamente
    $this->calculateLevel();
    
    $now = new UTCDateTime();
    $this->createdAt = $now;
    $this->updatedAt = $now;
  }

  /**
   * BR-LEVEL-001 a BR-LEVEL-004: Calcula el nivel basado en puntos
   */
  private function calculateLevel(): void {
    if ($this->points >= self::THRESHOLD_PLATINUM) {
      $this->level = self::LEVEL_PLATINUM;
      $this->discountPercentage = self::DISCOUNT_PLATINUM;
      $this->benefits = $this->getPlatinumBenefits();
    } elseif ($this->points >= self::THRESHOLD_GOLD) {
      $this->level = self::LEVEL_GOLD;
      $this->discountPercentage = self::DISCOUNT_GOLD;
      $this->benefits = $this->getGoldBenefits();
    } elseif ($this->points >= self::THRESHOLD_SILVER) {
      $this->level = self::LEVEL_SILVER;
      $this->discountPercentage = self::DISCOUNT_SILVER;
      $this->benefits = $this->getSilverBenefits();
    } else {
      $this->level = self::LEVEL_BRONZE;
      $this->discountPercentage = self::DISCOUNT_BRONZE;
      $this->benefits = $this->getBronzeBenefits();
    }
  }

  private function getBronzeBenefits(): array {
    return [
      'Acceso a destinos básicos',
      'Hasta 5 viajes guardados',
      'Soporte por email'
    ];
  }

  private function getSilverBenefits(): array {
    return [
      'Todo lo de Bronze',
      '5% descuento en servicios',
      'Hasta 15 viajes guardados',
      'Itinerarios con IA básicos',
      'Soporte prioritario'
    ];
  }

  private function getGoldBenefits(): array {
    return [
      'Todo lo de Silver',
      '10% descuento en servicios',
      'Viajes ilimitados',
      'Itinerarios con IA avanzados',
      'Alertas de clima personalizadas',
      'Acceso anticipado a nuevas funciones'
    ];
  }

  private function getPlatinumBenefits(): array {
    return [
      'Todo lo de Gold',
      '15% descuento en servicios',
      'Planificación VIP con IA premium',
      'Concierge de viajes 24/7',
      'Rutas exclusivas verificadas',
      'Insignia Platinum visible',
      'Acceso beta a nuevas funciones'
    ];
  }

  /**
   * Calcula puntos hasta el siguiente nivel
   */
  public function getPointsToNextLevel(): ?int {
    if ($this->level === self::LEVEL_PLATINUM) {
      return null; // Ya está en el máximo nivel
    }
    
    if ($this->level === self::LEVEL_GOLD) {
      return self::THRESHOLD_PLATINUM - $this->points;
    }
    
    if ($this->level === self::LEVEL_SILVER) {
      return self::THRESHOLD_GOLD - $this->points;
    }
    
    return self::THRESHOLD_SILVER - $this->points;
  }

  /**
   * Calcula el progreso porcentual hacia el siguiente nivel
   */
  public function getProgressToNextLevel(): float {
    if ($this->level === self::LEVEL_PLATINUM) {
      return 100.0;
    }

    $currentThreshold = 0;
    $nextThreshold = self::THRESHOLD_SILVER;

    if ($this->level === self::LEVEL_SILVER) {
      $currentThreshold = self::THRESHOLD_SILVER;
      $nextThreshold = self::THRESHOLD_GOLD;
    } elseif ($this->level === self::LEVEL_GOLD) {
      $currentThreshold = self::THRESHOLD_GOLD;
      $nextThreshold = self::THRESHOLD_PLATINUM;
    }

    $pointsInLevel = $this->points - $currentThreshold;
    $pointsNeeded = $nextThreshold - $currentThreshold;

    return round(($pointsInLevel / $pointsNeeded) * 100, 1);
  }

  /**
   * Obtiene el nombre del siguiente nivel
   */
  public function getNextLevel(): ?string {
    return match($this->level) {
      self::LEVEL_BRONZE => self::LEVEL_SILVER,
      self::LEVEL_SILVER => self::LEVEL_GOLD,
      self::LEVEL_GOLD => self::LEVEL_PLATINUM,
      default => null
    };
  }

  public function toArray(): array {
    return [
      'userId' => (string) $this->userId,
      'level' => $this->level,
      'points' => $this->points,
      'tripsCompleted' => $this->tripsCompleted,
      'ratingsGiven' => $this->ratingsGiven,
      'routesSaved' => $this->routesSaved,
      'destinationsVisited' => $this->destinationsVisited,
      'discountPercentage' => $this->discountPercentage,
      'benefits' => $this->benefits,
      'pointsToNextLevel' => $this->getPointsToNextLevel(),
      'progressToNextLevel' => $this->getProgressToNextLevel(),
      'nextLevel' => $this->getNextLevel(),
      'createdAt' => $this->createdAt->toDateTime()->format('c'),
      'updatedAt' => $this->updatedAt->toDateTime()->format('c')
    ];
  }

  public static function fromDocument(array $doc): self {
    $userId = $doc['userId'] instanceof ObjectId 
      ? $doc['userId'] 
      : new ObjectId($doc['userId']);
    
    $id = isset($doc['_id']) 
      ? ($doc['_id'] instanceof ObjectId ? $doc['_id'] : new ObjectId($doc['_id']))
      : null;

    $instance = new self(
      userId: $userId,
      points: (int)($doc['points'] ?? 0),
      tripsCompleted: (int)($doc['tripsCompleted'] ?? 0),
      ratingsGiven: (int)($doc['ratingsGiven'] ?? 0),
      routesSaved: (int)($doc['routesSaved'] ?? 0),
      destinationsVisited: (int)($doc['destinationsVisited'] ?? 0),
      id: $id
    );

    if (isset($doc['createdAt'])) {
      $instance->createdAt = $doc['createdAt'] instanceof UTCDateTime 
        ? $doc['createdAt'] 
        : new UTCDateTime($doc['createdAt']);
    }

    return $instance;
  }
}
