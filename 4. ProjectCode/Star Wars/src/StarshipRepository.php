<?php
namespace App;

use MongoDB\Collection;
use MongoDB\BSON\ObjectId;

class StarshipRepository
{
    private Collection $collection;

    public function __construct(Collection $collection)
    {
        $this->collection = $collection;
    }

    public function insert(Starship $s): Starship
    {
        $doc = [
            'name' => $s->name,
            'model' => $s->model,
            'manufacturer' => $s->manufacturer,
            'maxDistanceParsec' => $s->maxDistanceParsec,
            'hyperdriveRating' => $s->hyperdriveRating,
            'createdAt' => new \MongoDB\BSON\UTCDateTime(),
        ];
        $result = $this->collection->insertOne($doc);
        $s->_id = (string)$result->getInsertedId();
        return $s;
    }

    /**
     * @return Starship[]
     */
    public function findAll(): array
    {
        $cursor = $this->collection->find([], [ 'sort' => ['name' => 1] ]);
        $out = [];
        foreach ($cursor as $doc) {
            $out[] = $this->mapDoc($doc);
        }
        return $out;
    }

    /**
     * @return Starship[]
     */
    public function findByName(string $name): array
    {
        $regex = new \MongoDB\BSON\Regex($name, 'i');
        $cursor = $this->collection->find(['name' => $regex], [ 'sort' => ['name' => 1] ]);
        $out = [];
        foreach ($cursor as $doc) {
            $out[] = $this->mapDoc($doc);
        }
        return $out;
    }

    private function mapDoc($doc): Starship
    {
        $arr = $doc->getArrayCopy();
        $arr['_id'] = isset($arr['_id']) ? (string)$arr['_id'] : null;
        return new Starship($arr);
    }
}
