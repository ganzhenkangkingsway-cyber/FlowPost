import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Zap, Mail, Lock, AlertCircle, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { SecurityQuestionVerification } from '../components/SecurityQuestionVerification';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showSecurityQuestion, setShowSecurityQuestion] = useState(false);
  const [securityQuestionData, setSecurityQuestionData] = useState<{ userId: string; question: string } | null>(null);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await signIn(email, password, rememberMe);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: securityQuestion } = await supabase
          .from('security_questions')
          .select('question')
          .eq('user_id', user.id)
          .maybeSingle();

        if (securityQuestion) {
          setSecurityQuestionData({ userId: user.id, question: securityQuestion.question });
          setShowSecurityQuestion(true);
          setLoading(false);
        } else {
          navigate('/dashboard');
        }
      }
    }
  };

  const handleSecurityVerified = () => {
    setShowSecurityQuestion(false);
    navigate('/dashboard');
  };

  const handleSecurityCancel = async () => {
    setShowSecurityQuestion(false);
    await supabase.auth.signOut();
    setEmail('');
    setPassword('');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-[#9CA3AF] hover:text-white transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to home
        </Link>

        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-4 hover:scale-105 transition-transform">
            <div className="w-14 h-14 bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)]">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold text-white">FlowPost</h1>
              <p className="text-sm text-[#9CA3AF]">Design once. Post everywhere.</p>
            </div>
          </Link>
        </div>

        <div className="bg-[#1F2937] rounded-3xl shadow-[0_0_40px_rgba(59,130,246,0.2)] border border-[#374151] p-8 animate-fade-in-up">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Welcome back</h2>
            <p className="text-[#D1D5DB]">Sign in to your account to continue</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#D1D5DB] mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-[#0A0A0F] border border-[#374151] rounded-xl text-white placeholder-[#9CA3AF] focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#D1D5DB] mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-[#0A0A0F] border border-[#374151] rounded-xl text-white placeholder-[#9CA3AF] focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[#374151] bg-[#0A0A0F] text-[#3B82F6] focus:ring-[#3B82F6] cursor-pointer"
                />
                <span className="text-sm text-[#D1D5DB]">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm font-medium text-[#3B82F6] hover:text-[#8B5CF6] transition-colors">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] hover:scale-105 disabled:scale-100 disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition-all duration-300 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] disabled:shadow-none"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-[#D1D5DB]">
              Don't have an account?{' '}
              <Link to="/signup" className="font-semibold text-[#3B82F6] hover:text-[#8B5CF6] transition-colors">
                Create one now
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-sm text-[#9CA3AF] mt-8">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>

      {showSecurityQuestion && securityQuestionData && (
        <SecurityQuestionVerification
          userId={securityQuestionData.userId}
          question={securityQuestionData.question}
          onVerified={handleSecurityVerified}
          onCancel={handleSecurityCancel}
        />
      )}
    </div>
  );
}
