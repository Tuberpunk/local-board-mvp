'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Loader2, User, Save, Lock, ArrowLeft, Mail, AlertTriangle, Trash2 } from 'lucide-react';
import { ImageUploader } from '@/components/forms/ImageUploader';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Данные профиля
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState<string[]>([]);
  
  // Смена пароля
  const [oldPassword, setOldPassword] = useState(''); // Старый пароль
  const [password, setPassword] = useState('');       // Новый пароль
  const [passwordConfirm, setPasswordConfirm] = useState(''); // Повтор

  useEffect(() => {
    async function getProfile() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.push('/login');
      
      setUserId(session.user.id);
      setEmail(session.user.email || '');

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        setFullName(profile.full_name || '');
        if (profile.avatar_url) setAvatar([profile.avatar_url]);
      } else {
        setFullName(session.user.user_metadata.full_name || '');
        if (session.user.user_metadata.avatar_url) setAvatar([session.user.user_metadata.avatar_url]);
      }
      
      setLoading(false);
    }
    getProfile();
  }, [router, supabase]);

  // --- ОБНОВЛЕНИЕ ДАННЫХ ---
  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const avatarUrl = avatar.length > 0 ? avatar[0] : null;

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          full_name: fullName,
          avatar_url: avatarUrl,
          email: email,
          updated_at: new Date().toISOString(),
        });

      if (profileError) throw profileError;

      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: fullName, avatar_url: avatarUrl }
      });

      if (authError) throw authError;

      toast.success('Профиль обновлен!');
      router.refresh();
    } catch (error: any) {
      toast.error('Ошибка: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  // --- СМЕНА ПАРОЛЯ ---
  const updatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!oldPassword) return alert('Введите старый пароль');
    if (password.length < 6) return alert('Новый пароль слишком короткий');
    if (password !== passwordConfirm) return alert('Новые пароли не совпадают');

    setSaving(true);

    try {
      // 1. Проверяем старый пароль путем попытки входа
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: oldPassword
      });

      if (signInError) {
        throw new Error('Старый пароль введен неверно');
      }

      // 2. Если старый верный, обновляем на новый
      const { error: updateError } = await supabase.auth.updateUser({ 
        password: password 
      });
      
      if (updateError) throw updateError;

      alert('Пароль успешно изменен');
      setOldPassword('');
      setPassword('');
      setPasswordConfirm('');
      
    } catch (error: any) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  // --- УДАЛЕНИЕ АККАУНТА ---
  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Вы уверены, что хотите удалить аккаунт?\n\nВсе ваши магазины, товары и данные будут удалены безвозвратно."
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      // Вызываем нашу SQL функцию через RPC
      const { error } = await supabase.rpc('delete_own_account');
      
      if (error) throw error;

      // Выходим и редиректим
      await supabase.auth.signOut();
      router.push('/');
      router.refresh();
    } catch (error: any) {
      console.error(error);
      alert('Ошибка при удалении: ' + error.message);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center gap-3">
          <Link href="/dashboard" className="text-gray-500 hover:text-gray-900 font-medium">
             <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-bold text-lg text-gray-900">Мой профиль</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        
        {/* Блок 1: Личные данные */}
        <form onSubmit={updateProfile} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" /> Личные данные
          </h2>

          <div className="flex flex-col items-center mb-8">
            <div className="relative w-32 h-32">
              <div className="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100">
                {avatar.length > 0 ? (
                  <img src={avatar[0]} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <User className="w-12 h-12" />
                  </div>
                )}
              </div>
              <div className="absolute bottom-0 right-0">
                 <div className="bg-blue-600 rounded-full shadow-md overflow-hidden w-10 h-10 flex items-center justify-center border-2 border-white hover:bg-blue-700 transition-colors">
                    <ImageUploader 
                       images={avatar} 
                       onImagesChange={setAvatar} 
                       maxImages={1} 
                       className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                    />
                    <Save className="w-4 h-4 text-white pointer-events-none" />
                 </div>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">Нажмите на иконку, чтобы сменить фото</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <div className="relative">
                <input 
                  value={email}
                  disabled
                  className="w-full h-12 pl-10 pr-4 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
                />
                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Ваше имя</label>
              <input 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Иван Иванов"
                className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={saving} 
            className="w-full mt-6 h-12 bg-gray-900 hover:bg-black text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="animate-spin w-4 h-4" /> : "Сохранить изменения"}
          </button>
        </form>

        {/* Блок 2: Смена пароля */}
        <form onSubmit={updatePassword} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Lock className="w-5 h-5 text-orange-500" /> Безопасность
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Старый пароль</label>
              <input 
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
              />
            </div>
            
            <div className="h-px bg-gray-100 my-2"></div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Новый пароль</label>
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Повторите новый пароль</label>
              <input 
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="••••••••"
                className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={saving || !password} 
            className="w-full mt-6 h-12 bg-white border border-gray-200 text-gray-900 hover:bg-gray-50 rounded-xl font-bold transition-all disabled:opacity-50"
          >
            Обновить пароль
          </button>
        </form>

        {/* Блок 3: Удаление аккаунта (ОПАСНАЯ ЗОНА) */}
        <div className="border border-red-200 bg-red-50 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-bold text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> Удаление аккаунта
            </h3>
            <p className="text-sm text-red-600/80 mt-1">
              Действие необратимо. Удалятся все ваши магазины и товары.
            </p>
          </div>
          <button
            onClick={handleDeleteAccount}
            disabled={deleting}
            className="w-full sm:w-auto px-6 py-3 bg-white border border-red-200 text-red-600 hover:bg-red-600 hover:text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
          >
            {deleting ? <Loader2 className="animate-spin w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
            Удалить аккаунт
          </button>
        </div>

      </main>
    </div>
  );
}