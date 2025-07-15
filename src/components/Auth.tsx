'use client'

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, User, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { GridBackground } from './GridBackground';
import Logo from './Logo';

interface InputProps extends React.ComponentProps<"input"> {
  className?: string;
  type?: string;
}

function Input({ className, type, ...props }: InputProps) {
  return (
    <input
      type={type}
      className={`flex h-12 w-full rounded-lg border-0 bg-transparent px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none transition-all duration-300 ${className}`}
      {...props}
    />
  )
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  children: React.ReactNode;
}

function Button({ className, variant = 'default', size = 'default', children, ...props }: ButtonProps) {
  const baseClasses = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl",
    outline: "border border-border bg-background/50 backdrop-blur-sm hover:bg-accent hover:text-accent-foreground",
    ghost: "hover:bg-accent hover:text-accent-foreground"
  };
  
  const sizes = {
    default: "h-12 px-6 py-2",
    sm: "h-9 px-3",
    lg: "h-14 px-8"
  };
  
  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

const FloatingParticles: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const setCanvasSize = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;

      constructor() {
        this.x = Math.random() * (canvas?.width || 0);
        this.y = Math.random() * (canvas?.height || 0);
        this.size = Math.random() * 2 + 1;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.speedY = (Math.random() - 0.5) * 0.3;
        this.opacity = Math.random() * 0.2;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (canvas && this.x > canvas.width) this.x = 0;
        if (canvas && this.x < 0) this.x = canvas.width;
        if (canvas && this.y > canvas.height) this.y = 0;
        if (canvas && this.y < 0) this.y = canvas.height;
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = `rgba(0, 27, 216, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const particles: Particle[] = [];
    const particleCount = 30;

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', setCanvasSize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none opacity-60"
      style={{ zIndex: 1 }}
    />
  );
};

const SolidCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`relative rounded-2xl shadow-2xl border border-white/10 ${className}`}
      style={{ backgroundColor: '#001533' }}
    >
      {children}
    </motion.div>
  );
};

const AnimatedInput: React.FC<{
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon: React.ReactNode;
  showToggle?: boolean;
  onToggle?: () => void;
  showPassword?: boolean;
  required?: boolean;
}> = ({ type, placeholder, value, onChange, icon, showToggle, onToggle, showPassword, required }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  return (
    <motion.div
      className="relative group"
      whileHover={{ scale: 1.02 }}
      whileFocus={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <div
        className="relative rounded-lg border border-white/20 transition-all duration-300"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
        onMouseMove={handleMouseMove}
      >
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/80 transition-colors duration-200 group-focus-within:text-white z-10">
          {icon}
        </div>
        
        <Input
          type={type}
          value={value}
          onChange={onChange}
          className="w-full bg-transparent border-none pl-10 pr-12 py-3 text-white placeholder:text-white/60 focus:ring-2 focus:ring-blue-400/50 relative z-10"
          placeholder={placeholder}
          required={required}
        />

        {showToggle && (
          <button
            type="button"
            onClick={onToggle}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}

        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(200px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255, 255, 255, 0.1) 0%, transparent 70%)`
          }}
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </motion.div>
  );
};

export const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const { signIn, signUp, resetPassword } = useAuth();

  // 3D card effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message);
        }
      } else {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          setError(error.message);
        } else {
          setMessage('Verifique seu email para confirmar a conta!');
        }
      }
    } catch (err) {
      setError('Algo deu errado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Digite seu email primeiro');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const { error } = await resetPassword(email);
      if (error) {
        setError(error.message);
      } else {
        setMessage('Link de recuperação enviado para seu email!');
      }
    } catch (err) {
      setError('Algo deu errado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden" 
      style={{ backgroundColor: '#000814' }}
    >
      <GridBackground />
      <FloatingParticles />

      <motion.div
        className="relative z-10"
        style={{ perspective: 1000, transformStyle: "preserve-3d" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <SolidCard className="w-full max-w-sm p-8 md:p-12">
          <div className="text-center mb-8">
            <Logo className="w-64 h-auto inline-block" />
          </div>

          <AnimatePresence mode="wait">
            <motion.form
              key={isLogin ? "login" : "signup"}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {!isLogin && (
                  <AnimatedInput
                    type="text"
                    placeholder="Nome completo"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    icon={<User size={18} />}
                    required={!isLogin}
                  />
                )}

                <AnimatedInput
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={<Mail size={18} />}
                  required
                />

                <AnimatedInput
                  type={showPassword ? "text" : "password"}
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={<Lock size={18} />}
                  showToggle
                  onToggle={() => setShowPassword(!showPassword)}
                  showPassword={showPassword}
                  required
                />
              </motion.div>

              {/* Error and Success Messages */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-red-900/50 border border-red-500/50 rounded-lg p-3 backdrop-blur-sm"
                  >
                    <p className="text-red-200 text-sm">{error}</p>
                  </motion.div>
                )}

                {message && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-green-900/50 border border-green-500/50 rounded-lg p-3 backdrop-blur-sm"
                  >
                    <p className="text-green-200 text-sm">{message}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Forgot password */}
              {isLogin && (
                <motion.div 
                  className="flex justify-end"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={loading}
                                         className="text-sm transition-colors"
                     style={{ color: '#001bd8' }}
                     onMouseEnter={(e) => e.currentTarget.style.color = '#0066ff'}
                     onMouseLeave={(e) => e.currentTarget.style.color = '#001bd8'}
                  >
                    Esqueceu sua senha?
                  </button>
                </motion.div>
              )}

              {/* Submit button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300"
                  style={{
                    background: 'linear-gradient(to right, #001bd8, #002560)',
                  }}
                >
                  <AnimatePresence mode="wait">
                    {loading ? (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center justify-center"
                      >
                        <Loader2 className="w-5 h-5 animate-spin" />
                      </motion.div>
                    ) : (
                      <motion.span
                        key="button-text"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center justify-center gap-2"
                      >
                        {isLogin ? 'Entrar' : 'Criar Conta'}
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>
            </motion.form>
          </AnimatePresence>

          {/* Sign up/Login toggle */}
          <motion.p 
            className="text-center text-sm text-white/60 mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}{' '}
            <button 
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setMessage('');
              }}
              className="font-medium transition-colors"
              style={{ color: '#001bd8' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#0066ff'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#001bd8'}
            >
              {isLogin ? 'Criar conta' : 'Fazer login'}
            </button>
          </motion.p>
        </SolidCard>
      </motion.div>
    </div>
  );
};

export default Auth;