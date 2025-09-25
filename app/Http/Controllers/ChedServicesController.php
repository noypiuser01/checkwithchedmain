<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class ChedServicesController extends Controller
{
    /**
     * Display the Ched Services page
     */
    public function index()
    {
        return Inertia::render('ChedServices');
    }
}