<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\CurriculumController;
use App\Http\Controllers\UserController;
use Inertia\Inertia;


Route::get('/', fn () => Inertia::render('checkwithched'))->name('dashboard');
Route::get('/checkwithched', fn () => Inertia::render('checkwithched'))->name('dashboard.alt');
Route::get('/ched-services', [App\Http\Controllers\ChedServicesController::class, 'index'])->name('ched-services');
Route::get('/form/cmo-psg', fn () => Inertia::render('Form/CmoPsgForm'))->name('form.cmo-psg');

Route::get('/search', [SearchController::class, 'search'])->name('search');

Route::get('/programs/{instCode}', [SearchController::class, 'fetchPrograms']);
Route::get('/programs/{instCode}/details', [SearchController::class, 'fetchProgramDetails']);
Route::get('/programs/{instCode}/majors', [SearchController::class, 'fetchProgramMajors']);
Route::get('/programs/{instCode}/address', [SearchController::class, 'fetchAddress']);
Route::get('/programs/{instCode}/full-details', [SearchController::class, 'getFullProgramDetails']);
Route::get('/heis', [SearchController::class, 'fetchAllHEI'])->name('fetchAllHEI');

Route::get('/api/curricula', [App\Http\Controllers\CurriculumController::class, 'getAllCurricula'])->name('api.curricula');
Route::get('/api/curricula/inactive', [App\Http\Controllers\CurriculumController::class, 'getInactiveCurricula'])->name('api.curricula.inactive');
Route::get('/api/cmo-category-titles', [App\Http\Controllers\CurriculumController::class, 'getTitlesByCmoAndCategory'])->name('api.cmo-category-titles');
Route::get('/api/cmo-categories', [App\Http\Controllers\CurriculumController::class, 'getCategoriesByCmo'])->name('api.cmo-categories');
Route::get('/api/cmo-program-names', [App\Http\Controllers\CurriculumController::class, 'getProgramNamesByCmo'])->name('api.cmo-program-names');
Route::get('/api/course-code-by-title', [App\Http\Controllers\CurriculumController::class, 'getCourseCodeByTitle'])->name('api.course-code-by-title');
Route::get('/api/course-details-by-title', [App\Http\Controllers\CurriculumController::class, 'getCourseDetailsByTitle'])->name('api.course-details-by-title');
Route::get('/api/course-details-by-code', [App\Http\Controllers\CurriculumController::class, 'getCourseDetailsByCode'])->name('api.course-details-by-code');
Route::get('/api/curriculum-requirements', [App\Http\Controllers\CurriculumController::class, 'getCurriculumRequirements'])->name('api.curriculum-requirements');
Route::get('/api/cmo-program-totals', [App\Http\Controllers\CurriculumController::class, 'getCmoProgramTotals'])->name('api.cmo-program-totals');
Route::get('/api/curriculum-program-totals', [App\Http\Controllers\CurriculumController::class, 'getCurriculumProgramTotals'])->name('api.curriculum-program-totals');
Route::get('/api/cmo-program-courses', [App\Http\Controllers\CurriculumController::class, 'getCmoProgramCourses'])->name('api.cmo-program-courses');
Route::post('/api/curriculum-reports', [App\Http\Controllers\CurriculumController::class, 'storeCurriculumReport'])->name('api.curriculum-reports.store');

Route::get('/admin/login', [App\Http\Controllers\AdminController::class, 'showLoginForm'])->name('admin.login');
Route::post('/admin/login', [App\Http\Controllers\AdminController::class, 'login'])->name('admin.login.post');
Route::get('/admin/dashboard', [App\Http\Controllers\AdminController::class, 'dashboard'])->name('admin.dashboard');
Route::post('/admin/logout', [App\Http\Controllers\AdminController::class, 'logout'])->name('admin.logout');

Route::get('/admin/UserManagement', [UserController::class, 'index'])->name('admin.user-management');
Route::post('/admin/user', [UserController::class, 'store'])->name('admin.user.store');
Route::put('/admin/user/{user}', [UserController::class, 'update'])->name('admin.user.update');
Route::put('/admin/user/{user}/status', [UserController::class, 'updateStatus'])->name('admin.user.status.update');

Route::get('/admin/test-status-update', function() {
    return response()->json(['message' => 'Test route accessible']);
})->name('admin.test.status');

Route::middleware(['web'])->group(function () {
    Route::get('/admin/AddCurriculum', [CurriculumController::class, 'create'])->name('admin.add-curriculum');
    Route::post('/admin/curriculum', [CurriculumController::class, 'store'])->name('admin.curriculum.store');
    Route::get('/admin/CurriculumList', [CurriculumController::class, 'index'])->name('admin.curriculum-list');
    Route::get('/admin/curriculum/{curriculum}', [CurriculumController::class, 'show'])->name('admin.curriculum.show');
    Route::get('/admin/view/{curriculum}', [CurriculumController::class, 'view'])->name('admin.curriculum.view');
    Route::get('/admin/curriculum/{curriculum}/edit', [CurriculumController::class, 'edit'])->name('admin.curriculum.edit');
    Route::put('/admin/curriculum/{curriculum}', [CurriculumController::class, 'update'])->name('admin.curriculum.update');
    Route::delete('/admin/curriculum/{curriculum}', [CurriculumController::class, 'destroy'])->name('admin.curriculum.destroy');
    Route::delete('/admin/curriculum-course/{course}', [CurriculumController::class, 'destroyCourse'])->name('admin.curriculum-course.destroy');
});

Route::get('/users/login', fn () => Inertia::render('Users/UsersLogin'))->name('users.login');
Route::post('/users/login', [App\Http\Controllers\UsersController::class, 'login'])->name('users.login.post');
Route::post('/users/logout', [App\Http\Controllers\UsersController::class, 'logout'])->name('users.logout');
Route::get('/users/dashboard', [App\Http\Controllers\UsersController::class, 'dashboard'])->name('users.dashboard');

Route::get('/users/curriculum', [App\Http\Controllers\UserCurriculumController::class, 'index'])->name('users.curriculum');

Route::get('/users/curriculumlist', [App\Http\Controllers\UsersController::class, 'curriculumList'])->name('users.CurriculumList');

Route::post('/users/curriculum', [App\Http\Controllers\UserCurriculumController::class, 'store'])->name('users.curriculum.store');

require __DIR__ . '/auth.php';
