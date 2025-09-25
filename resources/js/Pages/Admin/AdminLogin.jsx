import PublicLayout from '@/Layouts/PublicLayout';
import { useForm } from "@inertiajs/react";
import { Head, Link } from "@inertiajs/react";
import { useState, useEffect } from "react";
import { Shield, Lock, Eye, EyeOff, LogIn, LoaderCircle, AlertCircle, CheckCircle } from "lucide-react";

export default function AdminLogin({ status, canResetPassword, errors: serverErrors }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "admin@ched.gov.ph",
        password: "admin123",
        remember: false,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [focusedField, setFocusedField] = useState(null);
    const [isFormValid, setIsFormValid] = useState(false);

    // Clear password when leaving the page for security
    useEffect(() => {
        return () => reset("password");
    }, []);

    // Validate form in real-time
    useEffect(() => {
        const emailValid = data.email.includes('@') && data.email.length > 3;
        const passwordValid = data.password.length >= 6;
        setIsFormValid(emailValid && passwordValid);
    }, [data.email, data.password]);

    const submit = (e) => {
        e.preventDefault();
        post(route("admin.login.post"), {
            onSuccess: () => {
                window.location.href = route("admin.dashboard");
            },
        });
    };

    const getInputClasses = (fieldName, hasError) => {
        const baseClasses = "block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none transition-all duration-300 transform";
        const focusClasses = focusedField === fieldName ? "scale-[1.02]" : "";
        
        if (hasError) {
            return `${baseClasses} ${focusClasses} border-red-300 focus:ring-2 focus:ring-red-200 focus:border-red-400 bg-red-50`;
        }
        
        if (focusedField === fieldName) {
            return `${baseClasses} ${focusClasses} border-blue-400 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 bg-blue-50 shadow-lg`;
        }
        
        return `${baseClasses} border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 hover:border-gray-400`;
    };

    const passwordInputClasses = getInputClasses('password', errors.password || serverErrors?.password) + " pr-12";

    return (
        <>
            <Head title="">
                <link rel="icon" type="image/png" href="/images/logo.png" />
            </Head>
            <PublicLayout
            header={
                <div className="flex items-center justify-between w-full">
                <h4 className="text-lg font-semibold leading-tight text-gray-800">
                Admin Portal | Commission on Higher Education - CHED
                </h4>
                </div>
            }
        >
           
            
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-10 left-10 w-32 h-32 bg-blue-400 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-10 right-10 w-24 h-24 bg-indigo-400 rounded-full blur-2xl"></div>
                    <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-cyan-400 rounded-full blur-xl"></div>
                </div>
                
                <div className="max-w-md w-full space-y-6 relative z-10">
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-500 overflow-hidden">
                        {/* Modal Header - Solid color styling */}
                        <div className="flex items-center justify-start p-4 text-white" style={{backgroundColor: '#1e3c73'}}>
                         <div className="flex items-center gap-2">
                             <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center overflow-hidden ring-1 ring-white/20">
                                <img src="/images/logo.png" alt="CHED Logo" className="w-5 h-5 object-contain" />
                            </div>
                        <h2 className="text-lg font-bold">Admin Access</h2>
                             </div>
                                 </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            <div className="text-center mb-6">
                             <p className="text-gray-600 text-sm">Secure portal for system management</p>
                            </div>

                        {status && (
                            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm text-center flex items-center justify-center space-x-2 animate-fade-in">
                            <CheckCircle className="h-4 w-4" />
                             <span>{status}</span>
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-4">
                            <div className="space-y-1">
                            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Email Address
                            </label>
                            <div className="relative group">
                            <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-300 ${
                                        focusedField === 'email' ? 'text-blue-500' : 'text-gray-400'
                                    }`}>
                                        <Shield className="h-5 w-5" />
                                    </div>
                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        onChange={(e) => setData("email", e.target.value)}
                                        onFocus={() => setFocusedField('email')}
                                        onBlur={() => setFocusedField(null)}
                                        className={getInputClasses('email', errors.email || serverErrors?.email).replace('py-3', 'py-2')}
                                        placeholder="Enter your admin email"
                                        required
                                        autoFocus
                                    />
                                </div>
                                {(errors.email || serverErrors?.email) && (
                                    <div className="flex items-center space-x-2 mt-2 text-red-600 animate-fade-in">
                                    <AlertCircle className="h-4 w-4" />
                                     <p className="text-sm">{errors.email || serverErrors?.email}</p>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-1">
                                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Password
                                </label>
                                <div className="relative group">
                                <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-300 ${
                                focusedField === 'password' ? 'text-blue-500' : 'text-gray-400'
                                }`}>
                                <Lock className="h-5 w-5" />
                                </div>
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={data.password}
                                        onChange={(e) => setData("password", e.target.value)}
                                        onFocus={() => setFocusedField('password')}
                                        onBlur={() => setFocusedField(null)}
                                        className={passwordInputClasses.replace('py-3', 'py-2')}
                                        placeholder="Enter your password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center hover:scale-110 transition-transform duration-200"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                        ) : (
                                            <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                        )}
                                    </button>
                                </div>
                                {(errors.password || serverErrors?.password) && (
                                    <div className="flex items-center space-x-2 mt-2 text-red-600 animate-fade-in">
                                        <AlertCircle className="h-4 w-4" />
                                        <p className="text-sm">{errors.password || serverErrors?.password}</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between pt-1">
                                <div className="flex items-center group">
                                    <input
                                        id="remember"
                                        type="checkbox"
                                        name="remember"
                                        checked={data.remember}
                                        onChange={(e) => setData("remember", e.target.checked)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-all duration-200 hover:scale-110"
                                    />
                                    <label htmlFor="remember" className="ml-2 block text-sm text-gray-700 font-medium group-hover:text-gray-900 transition-colors duration-200">
                                        Remember me
                                    </label>
                                </div>
                                {canResetPassword && (
                                    <Link
                                        href={route("password.request")}
                                        className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline transition-all duration-200 transform hover:scale-105"
                                    >
                                        Forgot password?
                                    </Link>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={processing || !isFormValid}
                                className={`group relative w-full flex justify-center py-3 px-5 border-0 text-sm font-semibold rounded-lg text-white transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-blue-300/50 ${
                                    processing || !isFormValid 
                                        ? 'bg-gray-400 cursor-not-allowed' 
                                        : 'shadow-md hover:shadow-lg active:scale-[0.98]'
                                }`}
                                style={processing || !isFormValid ? {} : {backgroundColor: '#1e3c73'}}
                            >
                                <span className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                                {processing ? (
                                    <div className="flex items-center relative z-10">
                                    <LoaderCircle className="animate-spin w-4 h-4 mr-2" />
                                    <span>Signing in...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center relative z-10">
                                    <LogIn className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                                    <span>Sign In Securely</span>
                                    </div>
                                )}
                            </button>
                        </form>

                            <div className="mt-6 text-center">
                                <p className="text-sm text-gray-600">
                                    Need assistance?{' '}
                                <Link 
                                 href="/" 
                                className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-all duration-200 transform hover:scale-105 inline-block"
                                >
                                Contact support team
                                </Link>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="text-center">
                        <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                            <Shield className="h-3 w-3" />
                            <p>Admin access restricted to authorized personnel only</p>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out forwards;
                }
                
                .shadow-3xl {
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                }
            `}</style>
        </PublicLayout>
        </>
    );
}