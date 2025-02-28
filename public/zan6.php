<?php

$output = shell_exec('composer -v 2>&1');

echo "<pre>$output</pre>";
