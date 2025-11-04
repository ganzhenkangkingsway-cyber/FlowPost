import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Zap, Mail, Lock, User, AlertCircle, CheckCircle2 } from 'lucide-react';

export function SignUp() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const { error } = await signUp(email, password, fullName);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
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
            <h2 className="text-2xl font-bold text-white mb-2">Create your account</h2>
            <p className="text-[#D1D5DB]">Start managing your social media presence</p>
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
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-[#0A0A0F] border border-[#374151] rounded-xl text-white placeholder-[#9CA3AF] focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all"
                />
              </div>
            </div>

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
                  placeholder="Create a strong password"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-[#0A0A0F] border border-[#374151] rounded-xl text-white placeholder-[#9CA3AF] focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#D1D5DB] mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-[#0A0A0F] border border-[#374151] rounded-xl text-white placeholder-[#9CA3AF] focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="flex items-start gap-2">
              <input type="checkbox" required className="mt-1 rounded border-[#374151] bg-[#0A0A0F] text-[#3B82F6] focus:ring-[#3B82F6]" />
              <label className="text-sm text-[#D1D5DB]">
                I agree to FlowPost's{' '}
                <a href="#" className="text-[#3B82F6] hover:text-[#8B5CF6] font-medium transition-colors">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-[#3B82F6] hover:text-[#8B5CF6] font-medium transition-colors">Privacy Policy</a>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] hover:scale-105 disabled:scale-100 disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition-all duration-300 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] disabled:shadow-none"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-[#D1D5DB]">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-[#3B82F6] hover:text-[#8B5CF6] transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
