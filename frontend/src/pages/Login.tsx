import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Building2, User, Shield, KeyRound, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function Login() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register form
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerRole, setRegisterRole] = useState<'consumer' | 'lender'>('consumer');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { success, role } = await login(loginEmail, loginPassword);
    
    if (success) {
      toast.success('Welcome back!');
      if (role === 'admin') {
        navigate('/admin/dashboard');
      } else if (role === 'lender') {
        navigate('/lender');
      } else {
        navigate('/dashboard');
      }
    } else {
      toast.error('Invalid credentials. Please check your email and password.');
    }
    
    setIsLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const success = await register(registerEmail, registerPassword, registerName, registerRole);
    
    if (success) {
      toast.success('Account created successfully!');
      navigate(registerRole === 'lender' ? '/lender' : '/dashboard');
    } else {
      toast.error('Registration failed. Please try again.');
    }
    
    setIsLoading(false);
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Building2 className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold">MortgageNG</span>
          </Link>
          <h1 className="font-display text-2xl font-bold mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to continue your mortgage journey</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <Tabs defaultValue="login">
              <CardHeader className="pb-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Sign In</TabsTrigger>
                  <TabsTrigger value="register">Create Account</TabsTrigger>
                </TabsList>
              </CardHeader>
              
              <CardContent>
                <TabsContent value="login" className="space-y-4 mt-0">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="your@email.com"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="login-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="pl-10 pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Signing in...' : 'Sign In'}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </form>


                </TabsContent>

                <TabsContent value="register" className="space-y-4 mt-0">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-name">Full Name</Label>
                      <Input
                        id="register-name"
                        placeholder="John Doe"
                        value={registerName}
                        onChange={(e) => setRegisterName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="register-email"
                          type="email"
                          placeholder="your@email.com"
                          value={registerEmail}
                          onChange={(e) => setRegisterEmail(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="register-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={registerPassword}
                          onChange={(e) => setRegisterPassword(e.target.value)}
                          className="pl-10 pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>I am a</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setRegisterRole('consumer')}
                          className={`p-4 rounded-lg border text-center transition-colors ${
                            registerRole === 'consumer' 
                              ? 'border-primary bg-primary/5 text-primary' 
                              : 'hover:bg-muted'
                          }`}
                        >
                          <User className="h-6 w-6 mx-auto mb-2" />
                          <p className="font-medium">Homebuyer</p>
                        </button>
                        <button
                          type="button"
                          onClick={() => setRegisterRole('lender')}
                          className={`p-4 rounded-lg border text-center transition-colors ${
                            registerRole === 'lender' 
                              ? 'border-primary bg-primary/5 text-primary' 
                              : 'hover:bg-muted'
                          }`}
                        >
                          <Building2 className="h-6 w-6 mx-auto mb-2" />
                          <p className="font-medium">Lender</p>
                        </button>
                      </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Creating account...' : 'Create Account'}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </form>
                </TabsContent>


              </CardContent>
            </Tabs>
          </Card>
        </motion.div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          By continuing, you agree to our{' '}
          <Link to="/terms" className="underline hover:text-foreground">Terms</Link> and{' '}
          <Link to="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>
        </p>

        {/* Contact Enquiries */}
        <div className="mt-8 text-center text-sm text-muted-foreground bg-card/50 border border-border p-4 rounded-xl max-w-md mx-auto">
          <p className="mb-2 font-medium text-foreground">Need help or have enquiries?</p>
          <div className="flex flex-col gap-2">
            <a href="mailto:vchidiebere.vc@gmail.com" className="flex items-center justify-center gap-2 hover:text-primary transition-colors">
              <Mail className="h-4 w-4" /> vchidiebere.vc@gmail.com
            </a>
            <a href="https://wa.me/2347068488419" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 hover:text-primary transition-colors">
              <MessageCircle className="h-4 w-4" /> WhatsApp: 07068488419
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
