<?php
namespace App\Features\Currency;

use App\Core\Http\Request;
use App\Core\Http\Response;

final class CurrencyController {
  private CurrencyService $service;

  public function __construct() {
    $this->service = new CurrencyService();
  }

  public function rates(): void {
    try {
      $data = $this->service->getRates();
      Response::json(['ok' => true] + $data);
    } catch (\RuntimeException $exception) {
      error_log('Currency rates error: ' . $exception->getMessage());
      // Fallback amable: devolver tasas offline en lugar de 503
      try {
        $fallback = $this->service->getOfflineRates();
        Response::json(['ok' => true] + $fallback, 200);
      } catch (\Throwable $e) {
        Response::error('El servicio de conversión en línea no está disponible en este momento. Puedes utilizar el conversor offline más abajo.', 503);
      }
    }
  }

  public function convert(): void {
    try {
      $payload = Request::body();
      $from = $payload['from'] ?? Request::get('from');
      $to = $payload['to'] ?? Request::get('to');
      $amountRaw = $payload['amount'] ?? Request::get('amount');

      if ($from === null || $to === null || $amountRaw === null) {
        Response::error('Parámetros incompletos. Debes enviar from, to y amount.', 400);
        return;
      }

      if (!is_numeric($amountRaw)) {
        Response::error('El monto debe ser numérico', 400);
        return;
      }

      $amount = (float)$amountRaw;
      $result = $this->service->convert((string)$from, (string)$to, $amount);

      Response::json(['ok' => true, 'conversion' => $result]);
    } catch (\InvalidArgumentException $exception) {
      Response::error($exception->getMessage(), 400);
    } catch (\RuntimeException $exception) {
      error_log('Currency conversion service unavailable: ' . $exception->getMessage());
      // Fallback amable de conversión
      try {
        $payload = Request::body();
        $from = $payload['from'] ?? Request::get('from') ?? '';
        $to = $payload['to'] ?? Request::get('to') ?? '';
        $amount = (float)($payload['amount'] ?? Request::get('amount') ?? 0);
        $result = $this->service->convertOffline((string)$from, (string)$to, $amount);
        Response::json(['ok' => true, 'conversion' => $result], 200);
      } catch (\Throwable $e) {
        Response::error('El servicio de conversión en línea no está disponible en este momento. Utiliza el conversor offline más abajo.', 503);
      }
    } catch (\Throwable $exception) {
      error_log('Currency conversion error: ' . $exception->getMessage());
      Response::error('No se pudo completar la conversión', 500);
    }
  }
}
