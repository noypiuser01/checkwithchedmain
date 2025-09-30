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
            <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-4 pb-20 px-4">
                    <div className="w-full max-w-md flex flex-col items-center">
                        <img src="/images/logo1.png" alt="CHED Logo" className="h-16 w-16" />
                        <h2 className="mt-3 text-xl font-semibold text-center text-[#1e3c73]">CHECK WITH CHED</h2>
                        <p className="mt-1 text-sm text-gray-600 text-center">Enter your Username and password below to log in</p>

                        {status && (
                            <div className="mt-4 mb-2 text-center text-sm font-medium text-green-600">
                                {status}
                            </div>
                        )}

                        <form onSubmit={submit} className="mt-6 flex w-full flex-col gap-6">
                            <div className="grid gap-2">
                                <label htmlFor="username" className="text-sm font-medium text-gray-700">Username</label>
                                <input
                                    id="username"
                                    type="text"
                                    name="email"
                                    required
                                    autoFocus
                                    autoComplete="username"
                                    placeholder="username"
                                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                    value={data.email}
                                    onChange={(e) => setData("email", e.target.value)}
                                />
                                {errors.email && (
                                    <p className="text-sm text-red-600">{errors.email}</p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
                                    {canResetPassword && (
                                        <Link href={route("password.request")} className="ml-auto text-sm text-blue-600 hover:underline">
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

                            <div className="flex items-center space-x-3">
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

                            <button
                                type="submit"
                                className="mt-2 w-full inline-flex items-center justify-center rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-60"
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