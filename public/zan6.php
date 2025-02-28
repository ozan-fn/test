<?php

$output = shell_exec('/usr/local/bin/composer -v 2>&1');

echo "<pre>$output</pre>";
