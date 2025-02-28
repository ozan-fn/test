<?php
$output = shell_exec('php -r "copy(\'https://getcomposer.org/installer\', \'composer-setup.php\');"');
echo "<pre>$output</pre>";

$output = shell_exec('php composer-setup.php');
echo "<pre>$output</pre>";

$output = shell_exec('php -r "unlink(\'composer-setup.php\');"');
echo "<pre>$output</pre>";
