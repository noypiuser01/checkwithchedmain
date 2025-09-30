import { useForm } from "@inertiajs/react";
import { Head, Link } from "@inertiajs/react";

export default function AdminLogin({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("admin.login.post"), {
            onSuccess: () => {
                reset("password");
                window.location.href = route("admin.dashboard");
            },
        });
    };

    return (
        <>
            <Head title="">
                <link rel="icon" type="image/png" href="/images/logo1.png" />
            </Head>
            <div className="min-h-screen flex items-center justify-center bg-white px-4">
                <div className="w-full max-w-md flex flex-col items-center">
                 
                    {/* Logo */}
                    <div className="mb-4">
                        <img src="/images/logo1.png" alt="CHED Logo" className="h-20 w-20" />
                    </div>
                       {/* Title */}
                       <h1 className="text-3xl font-bold text-center text-[#1e3c73] mb-4">CHECK WITH CHED</h1>
                    
                    {/* Instruction text */}
                    <p className="text-sm text-gray-600 text-center mb-8">Enter your username and password below to log in</p>

                    {status && (
                        <div className="mb-4 text-center text-sm font-medium text-green-600">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="w-full space-y-6">
                        {/* Username Field */}
                        <div className="space-y-2">
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
                            <input
                                id="username"
                                type="text"
                                name="email"
                                required
                                autoFocus
                                autoComplete="username"
                                placeholder="Username"
                                className="block w-full rounded-md border border-blue-200 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                value={data.email}
                                onChange={(e) => setData("email", e.target.value)}
                            />
                            {errors.email && (
                                <p className="text-sm text-red-600">{errors.email}</p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                                {canResetPassword && (
                                    <Link href={route("password.request")} className="text-sm text-gray-600 hover:underline">
                                        Forgot password?
                                    </Link>
                                )}
                            </div>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                required
                                autoComplete="current-password"
                                placeholder="Password"
                                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                value={data.password}
                                onChange={(e) => setData("password", e.target.value)}
                            />
                            {errors.password && (
                                <p className="text-sm text-red-600">{errors.password}</p>
                            )}
                        </div>

                        {/* Remember Me Checkbox */}
                        <div className="flex items-center space-x-2">
                            <input
                                id="remember"
                                type="checkbox"
                                name="remember"
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                checked={data.remember}
                                onChange={(e) => setData("remember", e.target.checked)}
                            />
                            <label htmlFor="remember" className="text-sm text-gray-700">Remember me</label>
                        </div>

                        {/* Login Button */}
                        <button
                            type="submit"
                            className="relative inline-flex items-center justify-center font-medium cursor-pointer appearance-none outline-none user-select-none transition-all duration-75 transform-gpu bg-gradient-to-b from-[#3C67B6] to-[#2B5299] text-white border border-solid border-[#21417A] border-b-[4px] border-b-[#193563] shadow-[0_1px_0_rgba(255,255,255,0.25)_inset,0_1px_0_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.06)] hover:bg-gradient-to-b hover:from-[#3A60AD] hover:to-[#2A4F92] active:bg-gradient-to-b active:from-[#274885] active:to-[#213D73] active:shadow-[0_0_0_1px_rgba(0,0,0,0.1)_inset,0_1px_2px_rgba(0,0,0,0.12)_inset] active:translate-y-[1px] active:scale-[0.98] active:border-b active:border-t-[4px] active:border-t-[#193563] focus:outline-none disabled:bg-gradient-to-b disabled:from-[#f6f6f7] disabled:to-[#f6f6f7] disabled:text-[#b9bec7] disabled:border-[#d9d9d9] disabled:border-b-[4px] disabled:border-b-[#d9d9d9] disabled:shadow-none disabled:cursor-not-allowed text-sm min-h-[2.25rem] px-4 py-1.5 rounded-md mt-4 w-full"
                            disabled={processing}
                        >
                            {processing ? "Signing in..." : "Log in"}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}