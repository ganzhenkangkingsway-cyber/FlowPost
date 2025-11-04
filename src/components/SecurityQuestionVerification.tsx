import { useState } from 'react';
import { Shield, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SecurityQuestionVerificationProps {
  userId: string;
  question: string;
  onVerified: () => void;
  onCancel: () => void;
}

export function SecurityQuestionVerification({
  userId,
  question,
  onVerified,
  onCancel,
}: SecurityQuestionVerificationProps) {
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const hashAnswer = async (answer: string): Promise<string> => {
    const normalized = answer.toLowerCase().trim();
    const encoder = new TextEncoder();
    const data = encoder.encode(normalized);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const answerHash = await hashAnswer(answer);

      const { data, error: fetchError } = await supabase
        .from('security_questions')
        .select('answer_hash')
        .eq('user_id', userId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (!data) {
        setError('Security question not found');
        setLoading(false);
        return;
      }

      if (data.answer_hash === answerHash) {
        onVerified();
      } else {
        setError('Incorrect answer. Please try again.');
        setAnswer('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-[#1F2937] rounded-2xl shadow-xl border border-[#374151] max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-[#3B82F6]/10 rounded-full flex items-center justify-center">
            <Shield className="w-6 h-6 text-[#3B82F6]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Security Verification</h2>
            <p className="text-sm text-[#9CA3AF]">Answer your security question to continue</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#D1D5DB] mb-2">
              {question}
            </label>
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Enter your answer"
              required
              disabled={loading}
              autoFocus
              className="w-full px-4 py-3 bg-[#0A0A0F] border border-[#374151] rounded-lg text-white placeholder-[#9CA3AF] focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all disabled:opacity-50"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 px-4 py-3 border border-[#374151] text-[#D1D5DB] rounded-lg hover:bg-[#374151] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
