<?php
$out = shell_exec('cd .. && php artisan optimize 2>&1');
?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>

<body>
    <pre>
        <?php echo $out; ?>
    </pre>
</body>

</html>