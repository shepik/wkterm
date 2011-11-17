<?php
$host = '127.0.0.1';
$port = 21020;
$type = 'time';

if (isset($argv[1])) $host = $argv[1];
if (isset($argv[2])) $port = $argv[2];
if (isset($argv[3])) $type = $argv[3];


function get_data($host,$port) {
	$data = array('method' => 'get_statistics','id'=>0,'param'=>0);
	$socket = fsockopen($host,$port);
	if (!fwrite($socket,json_encode($data)."\r\n")) die('fwrite failed');
	$data = fgets($socket);
	if (!$data) die('no data recieved');
	$data = json_decode($data,true);
	if (isset($data['error'])) die('error: '.$data['error']);
	$data = $data['result'];
	return $data;
}


$curr = get_data($host,$port);

foreach ($curr as $cmd=>$unused) if (is_array($unused) && isset($unused['total_time']) && isset($unused['count'])) echo '0 ';
echo "\n";

while (true) {
    $prev = $curr;
    usleep(500000);
    $curr = get_data($host,$port);

	foreach ($curr as $cmd=>$unused) if (is_array($unused) && isset($unused['total_time']) && isset($unused['count'])) {
		$pval = $prev[$cmd];
		$cval = $curr[$cmd];

		$diff_time = $cval['total_time'] - $pval['total_time'];
		$diff_req = $cval['count'] - $pval['count'];

		if ($type == 'time') {
			$val = ($diff_time / max(1,$diff_req));
		} else {
			$val = $diff_req;
		}
		echo $val.' ';
	}
	echo "\n";
	flush();
}



