<?php
namespace App\Features\Currency;

final class CurrencyService {
  private const BASE_CURRENCY = 'USD';
  private const UPDATED_AT = '2024-01-15T00:00:00Z';

  private const DEFAULTS = [
    'from' => 'USD',
    'to' => 'EUR',
  ];

  /**
   * Static list of supported currencies with reference rates against USD.
   * The rates are intentionally rounded to mimic data returned by a public API
   * while keeping the feature completely offline for the prototype.
   */
  private const RATES = [
    'USD' => ['name' => 'Dólar estadounidense', 'symbol' => '$',   'rate' => 1.00],
    'EUR' => ['name' => 'Euro',                   'symbol' => '€',  'rate' => 0.92],
    'GBP' => ['name' => 'Libra esterlina',        'symbol' => '£',  'rate' => 0.79],
    'JPY' => ['name' => 'Yen japonés',            'symbol' => '¥',  'rate' => 146.50],
    'CAD' => ['name' => 'Dólar canadiense',       'symbol' => 'C$', 'rate' => 1.34],
    'AUD' => ['name' => 'Dólar australiano',      'symbol' => 'A$', 'rate' => 1.52],
    'BRL' => ['name' => 'Real brasileño',         'symbol' => 'R$', 'rate' => 4.95],
    'CLP' => ['name' => 'Peso chileno',           'symbol' => '$',  'rate' => 890.00],
    'COP' => ['name' => 'Peso colombiano',        'symbol' => '$',  'rate' => 3925.00],
    'MXN' => ['name' => 'Peso mexicano',          'symbol' => '$',  'rate' => 17.10],
    'ARS' => ['name' => 'Peso argentino',         'symbol' => '$',  'rate' => 830.00],
    'PEN' => ['name' => 'Sol peruano',            'symbol' => 'S/', 'rate' => 3.70],
  ];

  public function getRates(): array {
    $currencies = [];

    foreach (self::RATES as $code => $info) {
      $currencies[] = [
        'code' => $code,
        'name' => $info['name'],
        'symbol' => $info['symbol'] ?? null,
        'rate' => (float)$info['rate'],
      ];
    }

    usort($currencies, static fn(array $a, array $b): int => strcmp($a['code'], $b['code']));

    $baseInfo = self::RATES[self::BASE_CURRENCY] ?? ['name' => 'Desconocida'];

    return [
      'base' => [
        'code' => self::BASE_CURRENCY,
        'name' => $baseInfo['name'],
        'symbol' => $baseInfo['symbol'] ?? null,
      ],
      'updatedAt' => self::UPDATED_AT,
      'defaults' => self::DEFAULTS,
      'currencies' => $currencies,
      'count' => count($currencies),
    ];
  }

  public function convert(string $from, string $to, float $amount): array {
    $fromCode = strtoupper($from);
    $toCode = strtoupper($to);

    if (!isset(self::RATES[$fromCode])) {
      throw new \InvalidArgumentException('Moneda de origen no soportada');
    }

    if (!isset(self::RATES[$toCode])) {
      throw new \InvalidArgumentException('Moneda de destino no soportada');
    }

    if (!is_finite($amount) || $amount < 0) {
      throw new \InvalidArgumentException('El monto debe ser mayor o igual a cero');
    }

    $fromInfo = self::RATES[$fromCode];
    $toInfo = self::RATES[$toCode];

    $fromRate = $fromInfo['rate'];
    $toRate = $toInfo['rate'];

    // Convertir a USD (moneda base) y luego a destino
    $amountInUsd = $fromRate > 0 ? $amount / $fromRate : 0.0;
    $convertedAmount = $amountInUsd * $toRate;
    $conversionRate = $amount > 0 ? $convertedAmount / $amount : ($fromCode === $toCode ? 1.0 : $toRate / $fromRate);

    $baseInfo = self::RATES[self::BASE_CURRENCY];

    return [
      'from' => [
        'code' => $fromCode,
        'name' => $fromInfo['name'],
        'symbol' => $fromInfo['symbol'] ?? null,
        'amount' => round($amount, 2),
      ],
      'to' => [
        'code' => $toCode,
        'name' => $toInfo['name'],
        'symbol' => $toInfo['symbol'] ?? null,
        'amount' => round($convertedAmount, 2),
      ],
      'rate' => round($conversionRate, 6),
      'base' => [
        'code' => self::BASE_CURRENCY,
        'name' => $baseInfo['name'],
        'symbol' => $baseInfo['symbol'] ?? null,
      ],
      'amountInBase' => round($amountInUsd, 2),
      'updatedAt' => self::UPDATED_AT,
    ];
  }
}
