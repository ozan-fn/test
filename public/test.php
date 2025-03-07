<?php
$home = shell_exec('echo ~');
echo shell_exec("cd $home/test_laravel && php $home/composer.phar install");
