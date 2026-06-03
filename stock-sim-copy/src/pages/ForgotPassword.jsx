import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { TrendingUp, Mail, ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await base44.auth.resetPasswordRequest(email);
    } catch (err) {
      // Always show success
    } finally {
      setLoading(false);
      setSent(true);
    }
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
          <p className="text-sm text-muted-foreground">Reset your password</p>
        </div>

        <Card className="border-border">
          <CardContent className="pt-6 space-y-4">
            {sent ? (
              <div className="text-center space-y-3">
                <p className="text-sm text-muted-foreground">
                  If an account exists with that email, we've sent a password reset link.
                </p>
                <Link to="/login">
                  <Button variant="outline" className="gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back to Sign In
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input type="email" placeholder="trader@example.com" value={email}
                      onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </Button>
                <Link to="/login" className="block text-center text-sm text-muted-foreground hover:text-foreground">
                  Back to Sign In
                </Link>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}