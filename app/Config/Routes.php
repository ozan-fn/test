<?php

use CodeIgniter\Router\RouteCollection;

/** @var RouteCollection $routes */
$routes->get('/', 'Users::index');
$routes->get('/create', 'Users::create');
$routes->post('/store', 'Users::store');
$routes->get('/edit/(:num)', 'Users::edit/$1');
$routes->post('/update/(:num)', 'Users::update/$1');
$routes->post('/delete/(:num)', 'Users::delete/$1');
