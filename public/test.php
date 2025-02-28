<?php
// Use getenv() to access environment variables
$basedir = getenv('BASEDIR'); // Replace 'BASEDIR' with the actual environment variable you want to access
$home = getenv('HOME');

// Output the variables
echo $basedir . "\n";
echo $home . "\n";
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
        <?php echo htmlspecialchars($out, ENT_QUOTES, 'UTF-8'); ?>
    </pre>
</body>

</html>