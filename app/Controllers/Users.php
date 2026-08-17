<?php

namespace App\Controllers;

use App\Models\UserModel;

class Users extends BaseController
{
    public function index()
    {
        $model = new UserModel();
        return view('users/index', ['users' => $model->orderBy('id', 'desc')->findAll()]);
    }

    public function create()
    {
        return view('users/form', ['user' => null]);
    }

    public function store()
    {
        $model = new UserModel();
        $model->save([
            'name'  => $this->request->getPost('name'),
            'email' => $this->request->getPost('email'),
        ]);
        return redirect()->to('/');
    }

    public function edit($id)
    {
        $user = (new UserModel())->find($id);
        return view('users/form', ['user' => $user]);
    }

    public function update($id)
    {
        $model = new UserModel();
        $model->update($id, [
            'name'  => $this->request->getPost('name'),
            'email' => $this->request->getPost('email'),
        ]);
        return redirect()->to('/');
    }

    public function delete($id)
    {
        (new UserModel())->delete($id);
        return redirect()->to('/');
    }
}