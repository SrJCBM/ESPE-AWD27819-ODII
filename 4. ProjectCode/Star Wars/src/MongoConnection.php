<?php
namespace App;

use MongoDB\Client;
use MongoDB\Collection;

class MongoConnection
{
    private Client $client;
    private string $dbName;

    public function __construct(string $uri, string $dbName)
    {
        $this->client = new Client($uri);
        $this->dbName = $dbName;
    }

    public function getCollection(string $name): Collection
    {
        return $this->client->selectCollection($this->dbName, $name);
    }
}
