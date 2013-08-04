<?php
define('PROCESS_PATH', __DIR__);
define('EXPORT_PATH', realpath(__DIR__ . '/../data'));

$result = array();
$provinces = json_decode(file_get_contents(PROCESS_PATH . '/json/provinces.json'), true);
$provinces['CAB'] = 'Ciudad de Buenos Aires';

if (($handle = fopen(PROCESS_PATH . '/csv/poblacion.csv', 'r')) !== false) {
  $cols = fgetcsv($handle);

  $sexo_m = array_search('sexo_varon', $cols);
  $sexo_f = array_search('sexo_mujer', $cols);
  $provinceIndex = array_search('provincia', $cols);
  $actividadTotal = array_search('actividad_total', $cols);
  $actividadOcupado = array_search('actividad_ocupado', $cols);
  $actividadInactivo = array_search('actividad_inactivo', $cols);
  $actividadDesocupado = array_search('actividad_desocupado', $cols);

  while (($data = fgetcsv($handle)) !== false) {
    $prov = array_search($data[$provinceIndex], $provinces);
    if (!$prov) {
      continue;
    }

    @$result['sexo-m'][$prov] += $data[$sexo_m];
    @$result['sexo-f'][$prov] += $data[$sexo_f];
    @$result['actividad-total'][$prov] += $data[$actividadTotal];
    @$result['actividad-ocupado'][$prov] += $data[$actividadOcupado];
    @$result['actividad-inactivo'][$prov] += $data[$actividadInactivo];
    @$result['actividad-desocupado'][$prov] += $data[$actividadDesocupado];
  }
  fclose($handle);
}

// save in file
foreach ($result as $name => $values) {
  file_put_contents(EXPORT_PATH . '/' . $name . '.json', json_encode($values));
}

echo "Finished\n";