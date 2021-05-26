<?php
$filename = __DIR__ . $_SERVER['REQUEST_URI'];
if(!file_exists($filename)) {
http_response_code(404);
return;
}
sleep(0.3);
fpassthru(fopen($filename, 'r'));
