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
    $data = $this->service->getRates();
    Response::json(['ok' => true] + $data);
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
    } catch (\Throwable $exception) {
      error_log('Currency conversion error: ' . $exception->getMessage());
      Response::error('No se pudo completar la conversión', 500);
    }
  }
}
