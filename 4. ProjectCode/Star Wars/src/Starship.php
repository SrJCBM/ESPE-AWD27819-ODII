<?php
namespace App;

class Starship
{
    public ?string $_id = null; // stringified ObjectId
    public string $name;
    public string $model;
    public string $manufacturer;
    public float $maxDistanceParsec;
    public float $hyperdriveRating;

    public function __construct(array $data)
    {
        $this->_id = $data['_id'] ?? null;
        $this->name = (string)($data['name'] ?? '');
        $this->model = (string)($data['model'] ?? '');
        $this->manufacturer = (string)($data['manufacturer'] ?? '');
        $this->maxDistanceParsec = (float)($data['maxDistanceParsec'] ?? 0);
        $this->hyperdriveRating = (float)($data['hyperdriveRating'] ?? 0);
    }

    public function toArray(): array
    {
        return [
            '_id' => $this->_id,
            'name' => $this->name,
            'model' => $this->model,
            'manufacturer' => $this->manufacturer,
            'maxDistanceParsec' => $this->maxDistanceParsec,
            'hyperdriveRating' => $this->hyperdriveRating,
            'maxDistanceLy' => $this->getMaxDistanceLy(),
        ];
    }

    public function getMaxDistanceLy(): float
    {
        return round($this->maxDistanceParsec * Config::LY_PER_PARSEC, 2);
    }
}
