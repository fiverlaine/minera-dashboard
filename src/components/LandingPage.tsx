import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  TrendingUp, 
  Shield, 
  BarChart3,
  ArrowRight,
  Menu,
  X,
  Rocket,
  BookOpen,
  Package,
  Users,
  Target,
  ShoppingBag,
  Download,
  Globe,
  Zap,
  Eye
} from 'lucide-react';
import { NeutralBackground } from './NeutralBackground';
import Logo from './Logo';

const LandingPage: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  const features = [
    {
      icon: <Search className="w-6 h-6" />,
      title: "Mineração Automática",
      description: "Detecta e coleta automaticamente anúncios de alta performance da Facebook Ads Library"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Criativos Vencedores", 
      description: "Identifique os anúncios mais eficazes e analise estratégias de sucesso em tempo real"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Filtros Inteligentes",
      description: "Sistema avançado que elimina duplicatas e filtra apenas anúncios de qualidade"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Dashboard Completo",
      description: "Analise dados detalhados dos anúncios coletados com métricas e insights valiosos"
    }
  ];

  const stats = [
    { number: "10K+", label: "Anúncios Minerados" },
    { number: "99%", label: "Precisão" },
    { number: "24/7", label: "Coleta Automática" },
    { number: "150+", label: "Usuários Ativos" }
  ];

  const companies = [
    "TechCorp", "AdVantage", "MarketPro", "DigitalEdge", "GrowthLab", "InnovateCo"
  ];

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Background */}
      <NeutralBackground />
      
      {/* Header */}
      <motion.header 
        className="relative z-50 w-full px-4 py-6"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Logo className="w-48 h-auto" />

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {['Visão Geral', 'Recursos', 'Preços', 'Suporte'].map((item) => (
              <a 
                key={item}
                href="#" 
                className="text-white/80 hover:text-white transition-colors text-sm font-medium"
              >
                {item}
              </a>
            ))}
          </nav>

          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <button 
              onClick={() => navigate('/login')}
              className="text-white/80 hover:text-white transition-colors text-sm font-medium"
            >
              Login
            </button>
            <button 
              onClick={() => navigate('/login')}
              className="px-6 py-2 rounded-lg text-white font-medium text-sm transition-all duration-300 hover:shadow-lg hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #001bd8, #002560)' }}
            >
              Começar Agora
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div 
            className="md:hidden absolute top-full left-0 w-full bg-black/90 backdrop-blur-lg border-t border-white/10"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="px-4 py-6 space-y-4">
              {['Visão Geral', 'Recursos', 'Preços', 'Suporte'].map((item) => (
                <a 
                  key={item}
                  href="#" 
                  className="block text-white/80 hover:text-white transition-colors py-2"
                >
                  {item}
                </a>
              ))}
              <div className="pt-4 space-y-3">
                <button 
                  onClick={() => navigate('/login')}
                  className="block w-full text-left text-white/80 hover:text-white transition-colors py-2"
                >
                  Login
                </button>
                <button 
                  onClick={() => navigate('/login')}
                  className="w-full px-6 py-3 rounded-lg text-white font-medium transition-all duration-300"
                  style={{ background: 'linear-gradient(135deg, #001bd8, #002560)' }}
                >
                  Começar Agora
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </motion.header>

      {/* Hero Section */}
      <motion.section 
        className="relative z-10 px-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Icon */}
          <motion.div 
            className="mb-12"
            variants={itemVariants}
          >
            <div className="relative mx-auto w-24 h-24">
              {/* Outer glow */}
              <div 
                className="absolute inset-0 rounded-full blur-xl opacity-50"
                style={{ background: 'linear-gradient(135deg, #001bd8, #002560)' }}
              />
              {/* Main icon container */}
              <div 
                className="relative w-full h-full rounded-full flex items-center justify-center shadow-2xl"
                style={{ background: 'linear-gradient(135deg, #001bd8, #002560)' }}
              >
                <TrendingUp className="w-8 h-16 text-white" />
              </div>
            </div>
          </motion.div>

          {/* Hero Title */}
          <motion.h1 
            className="text-3xl md:text-7xl font-bold text-white mb-6 leading-tight"
            variants={itemVariants}
          >
            Minere anúncios{' '}
            <span 
              className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent"
            >
              vencedores
            </span>{' '}
            da Facebook Ads Library
          </motion.h1>

          {/* Hero Subtitle */}
          <motion.p 
            className="text-sm text-white/70 mb-12 max-w-2xl mx-auto leading-relaxed"
            variants={itemVariants}
          >
            Nossa extensão inteligente detecta automaticamente anúncios de alta performance na 
            Biblioteca de Anúncios do Facebook, coletando criativos vencedores, dados detalhados 
            e insights valiosos para suas campanhas.
          </motion.p>

          {/* Video Player */}
          <motion.div 
            className="mb-12 max-w-4xl mx-auto"
            variants={itemVariants}
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10">
              {/* Video Element */}
              <video 
                className="w-full h-auto bg-black/50"
                controls
                poster="https://via.placeholder.com/800x450/001533/ffffff?text=Minera+Demo+Video"
                style={{ aspectRatio: '16/9' }}
              >
                <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" type="video/mp4" />
                <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.webm" type="video/webm" />
                Seu navegador não suporta o elemento de vídeo.
              </video>
              
              {/* Video Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
              
              {/* Video Label */}
              <div className="absolute top-4 left-4 px-3 py-1 bg-blue-500 text-white text-xs font-medium rounded-full">
                Demo do AdHawk
              </div>
            </div>
            
            {/* Video Description */}
            <p className="text-center text-white/60 text-xs mt-4">
              Veja como o AdHawk funciona na prática minerando anúncios da Facebook Ads Library
            </p>
          </motion.div>

          {/* Hero Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
            variants={itemVariants}
          >
            <button 
              onClick={() => navigate('/login')}
              className="px-8 py-4 rounded-lg text-white font-semibold text-lg transition-all duration-300 hover:shadow-xl hover:scale-105 flex items-center gap-2"
              style={{ background: 'linear-gradient(135deg, #001bd8, #002560)' }}
            >
              Começar Agora
              <ArrowRight className="w-5 h-5" />
            </button>
            <button className="px-8 py-4 rounded-lg text-white font-semibold text-lg border border-white/20 hover:bg-white/10 transition-all duration-300">
              Ver Demonstração
            </button>
          </motion.div>

          {/* Stats */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16"
            variants={itemVariants}
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-white/60 text-sm font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>

          
        </div>
      </motion.section>

      {/* Como Funciona Section */}
      <motion.section 
        className="relative z-10 py-12 px-4"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
              <span className="text-blue-400 font-bold">#1</span>
              <span className="text-white/80 text-sm font-medium">Novidades & Originalidade</span>
            </div>
            <div className="flex items-center justify-center gap-2 mb-8">
              
            </div>
            <h3 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Como o AdHawk Funciona
            </h3>
          </div>

          {/* Steps */}
          
          {/* Mobile Layout - Vertical */}
          <div className="block md:hidden max-w-md mx-auto">
            {[
              {
                step: 1,
                icon: <Download className="w-6 h-6 text-white" />,
                title: "Instale a Extensão AdHawk",
                description: "Baixe nossa extensão gratuita e faça login com sua conta"
              },
              {
                step: 2,
                icon: <Globe className="w-6 h-6 text-white" />,
                title: "Acesse a Facebook Ads Library",
                description: "Navegue pela Biblioteca de Anúncios do Facebook como sempre faz"
              },
              {
                step: 3,
                icon: <Zap className="w-6 h-6 text-white" />,
                title: "Coleta Automática Ativada",
                description: "A extensão detecta e minera anúncios automaticamente em tempo real"
              },
              {
                step: 4,
                icon: <BarChart3 className="w-6 h-6 text-white" />,
                title: "Analise no Dashboard",
                description: "Acesse todos os anúncios coletados, baixe mídias e analise dados"
              }
            ].map((item, index) => (
              <motion.div 
                key={index}
                className="relative flex items-start gap-4 pb-8"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                {/* Dotted line */}
                {index < 3 && (
                  <div className="absolute left-6 top-16 w-0.5 h-16 border-l-2 border-dashed border-white/20" />
                )}
                
                {/* Icon circle */}
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg relative z-10">
                  {item.icon}
                </div>
                
                {/* Content */}
                <div className="flex-1 pt-1">
                  <div className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full inline-block mb-2">
                    Step {item.step}
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2 leading-tight">
                    {item.title}
                  </h4>
                  <p className="text-white/70 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Desktop Layout - Grid (Current) */}
          <div className="hidden md:grid md:grid-cols-4 gap-8 mb-16">
            {[
              {
                step: 1,
                icon: <Download className="w-8 h-8 text-white" />,
                title: "Instale a Extensão AdHawk",
                description: "Baixe nossa extensão gratuita e faça login com sua conta"
              },
              {
                step: 2,
                icon: <Globe className="w-8 h-8 text-white" />,
                title: "Acesse a Facebook Ads Library",
                description: "Navegue pela Biblioteca de Anúncios do Facebook como sempre faz"
              },
              {
                step: 3,
                icon: <Zap className="w-8 h-8 text-white" />,
                title: "Coleta Automática Ativada",
                description: "A extensão detecta e minera anúncios automaticamente em tempo real"
              },
              {
                step: 4,
                icon: <BarChart3 className="w-8 h-8 text-white" />,
                title: "Analise no Dashboard",
                description: "Acesse todos os anúncios coletados, baixe mídias e analise dados"
              }
            ].map((item, index) => (
              <motion.div 
                key={index}
                className="text-center relative"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                {/* Connector line */}
                {index < 3 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-white/20 to-white/5 transform -translate-y-1/2 z-0" />
                )}
                
                <div className="relative z-10">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                    {item.icon}
                  </div>
                  <div className="bg-blue-500 text-white text-sm font-bold px-3 py-1 rounded-full inline-block mb-4">
                    Step {item.step}
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-3 leading-tight">
                    {item.title}
                  </h4>
                  <p className="text-white/70 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Vantagens Section */}
      <motion.section 
        className="relative z-10 py-12 px-4"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
              <span className="text-blue-400 font-bold">#2</span>
              <span className="text-white/80 text-sm font-medium">Tecnologia Avançada</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Mineração Inteligente de <br/>
              <span className="text-blue-400">Anúncios do Facebook</span>
            </h2>
            <div className="max-w-4xl mx-auto">
              <p className="text-sm text-white/70 leading-relaxed">
                Nossa extensão utiliza algoritmos avançados para detectar automaticamente anúncios 
                de alta performance na Facebook Ads Library. Colete criativos vencedores, analise 
                estratégias de sucesso e baixe mídias de qualidade, tudo de forma automática 
                enquanto navega pela biblioteca do Facebook.
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        className="relative z-10 py-12 px-4"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                className="p-6 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105"
                style={{ backgroundColor: 'rgba(30, 37, 48, 0.3)' }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                  style={{ background: 'linear-gradient(135deg, #001bd8, #002560)' }}
                >
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-sm text-white/70 leading-relaxed">
                  <span className="text-sm">{feature.description}</span>
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Nichos Section */}
      <motion.section 
        className="relative z-10 py-12 px-4"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left side - Content */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <span className="text-blue-400 font-bold text-lg">Biblioteca de Criativos</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Descubra os anúncios mais<br/>
                <span className="text-blue-400">eficazes do Facebook</span>
              </h2>
              
              <p className="text-lg text-white/70 mb-8 leading-relaxed">
                <span className="text-sm">
                  Com o AdHawk, você tem acesso a uma biblioteca sempre atualizada dos melhores 
                  anúncios do Facebook. Nossa extensão coleta automaticamente criativos de alta 
                  performance, identifica tendências e permite download de mídias para inspiração 
                  e referência nas suas campanhas.
                </span>
              </p>

              <button 
                onClick={() => navigate('/login')}
                className="px-8 py-4 rounded-lg text-white font-semibold text-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #001bd8, #002560)' }}
              >
                Começar a Minerar Anúncios
              </button>
              
              {/* Nichos Grid */}
              <div className="grid grid-cols-3 gap-4 mt-12">
                {[
                  { icon: <Rocket className="w-6 h-6" />, title: "Lançamentos" },
                  { icon: <BookOpen className="w-6 h-6" />, title: "Infoprodutos" },
                  { icon: <Package className="w-6 h-6" />, title: "Drop Shipping" },
                  { icon: <Users className="w-6 h-6" />, title: "Agências" },
                  { icon: <Target className="w-6 h-6" />, title: "Afiliados" },
                  { icon: <ShoppingBag className="w-6 h-6" />, title: "E-commerce" }
                ].map((nicho, index) => (
                  <motion.div 
                    key={index}
                    className="text-center p-4 rounded-lg border border-white/10 hover:border-blue-400/30 transition-all duration-300 hover:scale-105"
                    style={{ backgroundColor: 'rgba(30, 37, 48, 0.2)' }}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center text-blue-400">
                      {nicho.icon}
                    </div>
                    <span className="text-white/80 text-sm font-medium">{nicho.title}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right side - Dashboard Preview */}
            <div className="relative">
              <motion.div 
                className="relative"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                {/* Dashboard mockup */}
                <div 
                  className="rounded-xl overflow-hidden shadow-2xl border border-white/10"
                  style={{ backgroundColor: 'rgba(30, 37, 48, 0.8)' }}
                >
                  <div className="p-6">
                    {/* Browser bar */}
                    <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/10">
                      <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      </div>
                      <div className="flex-1 text-center">
                        <div className="text-white/60 text-sm">Biblioteca de ofertas</div>
                      </div>
                    </div>
                    
                                         {/* Dashboard content */}
                     <div className="space-y-4">
                       {/* Header section */}
                       <div className="flex justify-between items-center">
                         <div className="text-white font-semibold">AdHawk Dashboard</div>
                         <div className="px-3 py-1 bg-green-500 text-white text-xs rounded-full">Online</div>
                       </div>
                       
                       {/* Stats cards */}
                       <div className="grid grid-cols-3 gap-3">
                         {[
                           { label: "Anúncios Minerados", value: "1,247" },
                           { label: "Criativos Únicos", value: "894" },
                           { label: "Alta Performance", value: "156" }
                         ].map((stat, i) => (
                           <div key={i} className="p-3 rounded bg-white/5 border border-white/10">
                             <div className="text-blue-400 text-sm font-medium">{stat.value}</div>
                             <div className="text-white/60 text-xs">{stat.label}</div>
                           </div>
                         ))}
                       </div>
                      
                      {/* Chart area */}
                      <div className="h-32 rounded bg-white/5 border border-white/10 flex items-center justify-center">
                        <BarChart3 className="w-8 h-8 text-blue-400/50" />
                      </div>
                      
                                             {/* Ad cards grid */}
                       <div className="grid grid-cols-2 gap-2">
                         {[
                           { title: "Curso Fitness", perf: "CTR 8.5%" },
                           { title: "E-book Marketing", perf: "CVR 12.3%" },
                           { title: "App Delivery", perf: "CPC $0.18" },
                           { title: "Curso Online", perf: "ROAS 4.2x" }
                         ].map((ad, i) => (
                           <div key={i} className="p-2 rounded bg-white/5 border border-white/10">
                             <div className="w-full h-16 rounded bg-gradient-to-br from-blue-500/20 to-blue-600/20 mb-2 flex items-center justify-center">
                               <Eye className="w-4 h-4 text-blue-400/70" />
                             </div>
                             <div className="text-white/80 text-xs truncate">{ad.title}</div>
                             <div className="text-green-400 text-xs font-medium">{ad.perf}</div>
                           </div>
                         ))}
                       </div>
                    </div>
                  </div>
                </div>

                {/* Glow effect */}
                <div 
                  className="absolute -inset-4 rounded-xl blur-xl opacity-20"
                  style={{ background: 'linear-gradient(135deg, #001bd8, #002560)' }}
                />
              </motion.div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        className="relative z-10 py-12 px-4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <div 
            className="p-12 rounded-2xl border border-white/10"
            style={{ backgroundColor: 'rgba(0, 21, 51, 0.7)' }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Pronto para minerar?
            </h2>
            <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
              <span className="text-sm">Junte-se aos profissionais que já estão descobrindo os anúncios mais eficazes do Facebook com o AdHawk</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => navigate('/login')}
                className="px-8 py-4 rounded-lg text-white font-semibold text-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #001bd8, #002560)' }}
              >
                Começar Gratuitamente
              </button>
              <button className="px-8 py-4 rounded-lg text-white font-semibold text-lg border border-white/20 hover:bg-white/10 transition-all duration-300">
                Falar com Vendas
              </button>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-4 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #001bd8, #002560)' }}
              >
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-bold text-lg">AdHawk</span>
            </div>
            <div className="text-white/50 text-sm">
              © 2024 AdHawk. Todos os direitos reservados.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 