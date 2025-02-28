<?php
$out = shell_exec('echo $basedir 2>&1');
echo $out;
echo $_SERVER['HOME'];
