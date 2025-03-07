<?php

use App\Http\Controllers\FileUploadController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/upload', [FileUploadController::class, 'index'])->name('upload.index');
Route::post('/upload', [FileUploadController::class, 'store'])->name('upload.store');
Route::get('/upload/{id}', [FileUploadController::class, 'show'])->name('upload.show');
Route::get('/upload/{id}/download', [FileUploadController::class, 'download'])->name('upload.download');
Route::delete('/upload/{id}', [FileUploadController::class, 'destroy'])->name('upload.destroy');
