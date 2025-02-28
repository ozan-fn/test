<?php

$output = shell_exec('git reset --hard origin/master 2>&1');

echo "<pre>$output</pre>";
