# 🚀 Guia de Início Rápido - Minera Dashboard

## ⚡ Setup Rápido (5 minutos)

### 1. Instalar Dependências
```bash
npm install
```

### 2. Executar o Dashboard
```bash
npm run dev
```

### 3. Acessar o Sistema
- **URL**: http://localhost:5173
- **Criar conta**: Use qualquer email válido
- **Senha**: Mínimo 6 caracteres

### 4. Instalar Extensão Chrome
1. Abra `chrome://extensions/`
2. Ative "Modo do desenvolvedor"
3. Clique "Carregar sem compactação"
4. Selecione a pasta `../minera-extension`

## 🎯 Teste Rápido

### Dashboard
1. ✅ Registre-se com email/senha
2. ✅ Veja a tela inicial (vazia)
3. ✅ Teste os filtros no header
4. ✅ Clique no menu do usuário

### Extensão
1. ✅ Vá para Facebook Ads Library
2. ✅ Veja anúncios destacados com borda azul
3. ✅ Use o botão "Minerar" na barra inferior
4. ✅ Ajuste o filtro de usos mínimos

## 🔧 Funcionalidades Principais

### ✨ Dashboard Web
- 🔐 **Autenticação completa** (login/registro/recuperação)
- 📊 **Grid responsivo** de anúncios
- 🔍 **Busca avançada** por título/descrição/anunciante
- 🎛️ **Filtros inteligentes** (categoria, usos, ordenação)
- 📈 **Estatísticas em tempo real**
- 👤 **Gerenciamento de perfil**

### 🔍 Extensão Chrome
- 🎯 **Detecção automática** de anúncios
- 🔥 **Destaque visual** (anúncios com 5+ usos)
- ⬇️ **Download direto** de vídeos criativos
- 🎚️ **Filtro avançado** com slider (1-200 usos)
- 🤖 **Auto-scroll** para mineração automática
- 📊 **Contador em tempo real**

## 🗄️ Banco de Dados

### Estrutura Criada
- ✅ **profiles** - Dados dos usuários
- ✅ **ads** - Anúncios minerados
- ✅ **categories** - Categorias personalizadas
- ✅ **tags** - Tags para organização
- ✅ **analytics** - Métricas de uso

### Segurança
- 🔒 **Row Level Security (RLS)** ativo
- 🛡️ **Políticas de acesso** por usuário
- 🔑 **JWT Authentication** com Supabase

## 🌐 API Endpoints

### Edge Function Criada
- **POST** `/functions/v1/receive-ad`
- 📨 Recebe dados da extensão
- 🔐 Autenticação via Bearer token
- ✅ Validação de dados
- 🔄 Upsert inteligente (cria ou atualiza)

## 🎨 UI/UX

### Design System
- 🎨 **TailwindCSS 4.0** para styling
- 🌙 **Tema escuro** moderno
- 📱 **Totalmente responsivo**
- 🎯 **Lucide React** para ícones
- ⚡ **Animações suaves**

### Componentes
- 🔧 **Modular e reutilizável**
- 📝 **TypeScript** para type safety
- 🎛️ **Hooks customizados** para estado
- 🔄 **Context API** para dados globais

## 📊 Status do Projeto

### ✅ Implementado
- [x] Sistema de autenticação completo
- [x] Dashboard funcional com dados reais
- [x] Extensão Chrome v1.8.0 completa
- [x] Banco de dados com RLS
- [x] API Edge Functions
- [x] Filtros e busca avançada
- [x] Interface moderna e responsiva
- [x] Documentação completa

### 🔄 Em Desenvolvimento
- [ ] Integração extensão → dashboard
- [ ] Testes automatizados
- [ ] Analytics dashboard
- [ ] Exportação de dados

### 🔮 Próximos Passos
- [ ] Deploy em produção
- [ ] Mobile app
- [ ] AI insights
- [ ] API pública

## 🐛 Resolução de Problemas

### Dashboard não carrega
```bash
# Limpe cache e reinstale
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Extensão não funciona
1. Verifique se está no Facebook Ads Library
2. Recarregue a extensão em `chrome://extensions/`
3. Verifique console para erros (F12)

### Erro de autenticação
1. Verifique credenciais do Supabase
2. Confirme email se necessário
3. Tente fazer logout/login

## 📞 Suporte

### Logs Úteis
- **Dashboard**: Console do navegador (F12)
- **Extensão**: Console da extensão (F12 → Sources)
- **Supabase**: Dashboard do Supabase

### Contato
- 📧 **Email**: suporte@minera.com
- 💬 **Discord**: [Link do servidor]
- 🐛 **Issues**: GitHub Issues

---

**🎉 Pronto para minerar anúncios como um profissional!** 