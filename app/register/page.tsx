'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Loader2, UserPlus, ArrowRight, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Состояния интерфейса
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // 1. Валидация на клиенте
    if (password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }

    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    setLoading(true);

    // 2. Регистрация в Supabase
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: email.split('@')[0], // Временное имя из email
          avatar_url: '',
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  // Если регистрация успешна, показываем сообщение
  if (success) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white w-full max-w-md rounded-3xl shadow-xl border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Успешная регистрация!</h2>
          <p className="text-gray-600 mb-8">
            Мы отправили письмо подтверждения на <b>{email}</b>. Пожалуйста, перейдите по ссылке в письме, чтобы активировать аккаунт.
          </p>
          <Link 
            href="/login" 
            className="block w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all"
          >
            Перейти ко входу
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        
        {/* Шапка */}
        <div className="px-8 pt-10 pb-6 text-center">
          <div className="mx-auto w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30 mb-6 transform rotate-3">
            <UserPlus className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Создать аккаунт</h1>
          <p className="text-gray-500 text-base">Заполните форму для регистрации</p>
        </div>

        {/* Ошибки */}
        {error && (
          <div className="mx-8 mb-6 p-4 rounded-xl bg-red-50 text-red-600 border border-red-100 text-sm font-medium flex items-start gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSignUp} className="px-8 pb-8 space-y-5">
          {/* Email */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 ml-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
              placeholder="name@example.com"
            />
          </div>

          {/* Пароль */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 ml-1">Пароль</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none pr-12"
                placeholder="Минимум 6 символов"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Подтверждение пароля */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 ml-1">Подтвердите пароль</label>
            <input
              type={showPassword ? "text" : "password"}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full h-12 px-4 bg-gray-50 border rounded-xl text-gray-900 focus:bg-white focus:ring-2 outline-none transition-all ${
                confirmPassword && password !== confirmPassword 
                  ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' 
                  : 'border-gray-200 focus:ring-blue-500/20 focus:border-blue-500'
              }`}
              placeholder="Повторите пароль"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full h-14 bg-gray-900 hover:bg-black text-white rounded-xl font-bold text-lg shadow-lg shadow-gray-900/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Зарегистрироваться <ArrowRight className="w-5 h-5" /></>}
          </button>
        </form>

        <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 text-center">
          <p className="text-gray-600 text-sm">
            Уже есть аккаунт?{' '}
            <Link 
              href="/login"
              className="text-blue-600 font-bold hover:underline hover:text-blue-700 transition-colors"
            >
              Войти
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}