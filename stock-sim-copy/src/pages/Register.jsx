import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { TrendingUp, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

export default function Register() {
  const [step, setStep] = useState('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await base44.auth.register({ email, password });
      setStep('otp');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await base44.auth.verifyOtp({ email, otpCode });
      base44.auth.setToken(result.access_token);
      window.location.href = '/';
    } catch (err) {
      setError(err.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      await base44.auth.resendOtp(email);
    } catch (err) {
      // silently fail
    }
  };

  const handleGoogleLogin = () => {
    base44.auth.loginWithProvider('google', '/');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <TrendingUp className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-display font-black tracking-tight">
              STOCK<span className="text-primary">SIM</span>
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            {step === 'register' ? 'Create your trading account' : 'Verify your email'}
          </p>
        </div>

        <Card className="border-border">
          <CardContent className="pt-6 space-y-4">
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {step === 'register' ? (
              <>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="email" placeholder="trader@example.com"
                        value={email} onChange={(e) => setEmail(e.target.value)}
                        className="pl-10" required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type={showPassword ? 'text' : 'password'} placeholder="••••••••"
                        value={password} onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10" required
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type={showPassword ? 'text' : 'password'} placeholder="••••••••"
                        value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10" required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">or</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full" onClick={handleGoogleLogin}>
                  Continue with Google
                </Button>
              </>
            ) : (
              <div className="space-y-4 text-center">
                <p className="text-sm text-muted-foreground">
                  We sent a verification code to <strong>{email}</strong>
                </p>
                <div className="flex justify-center">
                  <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <Button className="w-full" onClick={handleVerifyOtp} disabled={loading || otpCode.length < 6}>
                  {loading ? 'Verifying...' : 'Verify Email'}
                </Button>
                <Button variant="ghost" size="sm" onClick={handleResendOtp} className="text-xs text-muted-foreground">
                  Resend code
                </Button>
              </div>
            )}

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline">Sign in</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}