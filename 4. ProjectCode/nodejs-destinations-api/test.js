/**
 * Script de prueba para la API de Destinos
 * Prueba la funcionalidad de destinos compartidos
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function testAPI() {
  console.log('🧪 Iniciando pruebas de API de Destinos\n');
  console.log(`📡 Base URL: ${BASE_URL}\n`);

  try {
    // Test 1: Health check
    console.log('✅ Test 1: Health Check');
    const health = await fetch(`${BASE_URL}/`);
    const healthData = await health.json();
    console.log('   Respuesta:', healthData);
    console.log('');

    // Test 2: GET todos los destinos
    console.log('✅ Test 2: GET /api/destinations (todos los destinos)');
    const allDests = await fetch(`${BASE_URL}/api/destinations?page=1&size=10`);
    const allDestsData = await allDests.json();
    console.log(`   Total destinos: ${allDestsData.total}`);
    console.log(`   Destinos en página: ${allDestsData.items?.length || 0}`);
    console.log('');

    // Test 3: POST nuevo destino "Galápagos"
    console.log('✅ Test 3: POST /api/destinations (crear "Galápagos")');
    const dest1Response = await fetch(`${BASE_URL}/api/destinations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Galápagos',
        country: 'Ecuador',
        description: 'Islas volcánicas con fauna única',
        lat: -0.9538,
        lng: -90.9656
      })
    });
    const dest1 = await dest1Response.json();
    console.log(`   ID creado: ${dest1.id}`);
    console.log(`   Es nuevo: ${dest1.isNew}`);
    console.log('');

    // Test 4: POST el MISMO destino (debe retornar mismo ID)
    console.log('✅ Test 4: POST /api/destinations (mismo destino "Galápagos")');
    const dest2Response = await fetch(`${BASE_URL}/api/destinations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Galápagos',
        country: 'Ecuador',
        description: 'Patrimonio natural de la humanidad',
        lat: -0.9538,
        lng: -90.9656
      })
    });
    const dest2 = await dest2Response.json();
    console.log(`   ID retornado: ${dest2.id}`);
    console.log(`   Es nuevo: ${dest2.isNew}`);
    console.log(`   ¿Mismo ID? ${dest1.id === dest2.id ? '✅ SÍ' : '❌ NO'}`);
    console.log('');

    // Test 5: GET destino específico
    console.log('✅ Test 5: GET /api/destinations/:id');
    const getDestResponse = await fetch(`${BASE_URL}/api/destinations/${dest1.id}`);
    const getDest = await getDestResponse.json();
    console.log(`   Nombre: ${getDest.destination?.name}`);
    console.log(`   País: ${getDest.destination?.country}`);
    console.log('');

    // Test 6: Búsqueda
    console.log('✅ Test 6: GET /api/destinations?search=galápagos');
    const searchResponse = await fetch(`${BASE_URL}/api/destinations?search=galápagos`);
    const searchData = await searchResponse.json();
    console.log(`   Resultados encontrados: ${searchData.items?.length || 0}`);
    console.log('');

    console.log('🎉 Todas las pruebas completadas exitosamente!\n');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
    process.exit(1);
  }
}

// Ejecutar pruebas
testAPI();
