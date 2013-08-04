<?php
define('PROCESS_PATH', __DIR__);
define('EXPORT_PATH', realpath(__DIR__ . '/../data'));

$result = array();
$provinces = json_decode(file_get_contents(PROCESS_PATH . '/json/provinces.json'), true);

if (($handle = fopen(PROCESS_PATH . '/csv/salud.csv', 'r')) !== false) {

  $columns = fgetcsv($handle);
  $typeIndex = array_search('tipo', $columns);
  $totalIndex = array_search('total', $columns);
  $provinceIndex = array_search('provincia', $columns);

  while (($data = fgetcsv($handle)) !== false) {
    $type = strtolower(trim($data[$typeIndex]));
    $prov = array_search(trim($data[$provinceIndex]), $provinces);
    if (!$prov) {
      continue;
    }
    if ($type == 'publicos') {
      @$result['public'][$prov] += $data[$totalIndex];
    } elseif ($type == 'privados') {
      @$result['private'][$prov] += $data[$totalIndex];
    }
  }
  fclose($handle);
}
file_put_contents(EXPORT_PATH . '/salud-publicos.json', json_encode($result['public']));
file_put_contents(EXPORT_PATH . '/salud-privados.json', json_encode($result['private']));

echo "Finished\n";