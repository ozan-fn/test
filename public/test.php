<?php
$env = array_keys($_SERVER);
sort($env);
echo '<pre>' . implode("\n", $env) . '</pre>';
