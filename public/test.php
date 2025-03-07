<?php
$home = shell_exec('echo ~');
var_dump($home);
echo shell_exec("cd $home/test_laravel && php $home/composer.phar install");
