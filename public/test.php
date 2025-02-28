<?php
$out = shell_exec('ls /home 2>&1');
echo $out;
