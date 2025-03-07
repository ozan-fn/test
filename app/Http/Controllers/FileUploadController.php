<?php

namespace App\Http\Controllers;

use App\Models\File;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class FileUploadController extends Controller
{
    public function index()
    {
        // Mengambil semua file dari database
        $files = File::latest()->get();

        return view('upload-form', compact('files'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:10240', // Max 10MB
        ]);

        if ($request->hasFile('file')) {
            // Mengambil file
            $file = $request->file('file');

            // Membuat nama unik untuk file
            $fileName = time() . '_' . $file->getClientOriginalName();

            // Menyimpan file ke direktori storage/app/public/uploads
            $filePath = $file->storeAs('uploads', $fileName, 'public');

            // Menyimpan info file ke database
            File::create([
                'name' => $file->getClientOriginalName(),
                'path' => $filePath,
                'mime_type' => $file->getMimeType(),
                'size' => $file->getSize()
            ]);

            return back()->with('success', 'File berhasil diupload!');
        }

        return back()->with('error', 'Terjadi kesalahan saat upload file!');
    }

    // Menampilkan file
    public function show($id)
    {
        $file = File::findOrFail($id);
        return view('file-detail', compact('file'));
    }

    // Download file
    public function download($id)
    {
        $file = File::findOrFail($id);
        return Storage::disk('public')->download($file->path, $file->name);
    }

    // Hapus file
    public function destroy($id)
    {
        $file = File::findOrFail($id);

        // Hapus file dari storage
        if (Storage::disk('public')->exists($file->path)) {
            Storage::disk('public')->delete($file->path);
        }

        // Hapus record dari database
        $file->delete();

        return redirect()->route('upload.index')->with('success', 'File berhasil dihapus!');
    }
}
