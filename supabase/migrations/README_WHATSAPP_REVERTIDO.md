# ⚠️ MIGRAÇÕES WHATSAPP - NÃO UTILIZAR

## 📋 Status: REVERTIDAS na v3.8.6

As seguintes migrações relacionadas a WhatsApp foram **REVERTIDAS** e **NÃO devem ser aplicadas**:

### ❌ Migrações Obsoletas:
- `process_whatsapp_campaigns_v3.8.1.sql`
- `fix_false_positive_whatsapp_v3_8_5.sql`

### 🔄 Motivo da Reversão:
- Funcionalidade WhatsApp foi completamente removida da extensão
- Causava interferência na detecção normal de links
- Complexidade desnecessária
- Usuário solicitou remoção completa

### ✅ Estado Atual:
- **Banco**: LIMPO (link_type = NULL para todos)
- **Extensão**: SEM lógica WhatsApp
- **Detecção**: Simplificada para tipos básicos (ecommerce, instagram, website)

### 🚨 IMPORTANTE:
**NÃO APLICAR** essas migrações. Se foram aplicadas, o sistema ainda funciona, mas a funcionalidade não é mais usada pela extensão.

---
**Data da Reversão**: Dezembro 2024  
**Versão**: v3.8.6  
**Documentação**: Ver `REVERSÃO_WHATSAPP_v3.8.6.md` 