# 🚀 Alfy - Guida Setup Sistema Ruoli e Famiglie

## 📋 Panoramica

Questa guida ti accompagna nel setup completo del sistema di gestione ruoli e famiglie di Alfy. Il sistema implementa un approccio **completamente chiuso** dove:

- ❌ **Nessuna registrazione pubblica**
- ✅ **Solo login pubblico disponibile**
- ✅ **Bootstrap sicuro per il primo sysadmin**
- ✅ **Onboarding controllato**: Solo sysadmin/admin possono creare utenti

## 🎯 Ruoli del Sistema

### **🔱 SYSADMIN** (Sergio Pugliese)
- **Controllo Completo**: Gestisce tutto il sistema
- **Gestione Famiglie**: Crea, modifica, elimina famiglie
- **Gestione Utenti**: Crea admin/user, cambia ruoli, elimina permanentemente
- **Cambio Admin**: Unico che può cambiare l'admin di una famiglia

### **👑 ADMIN** (Uno per famiglia)
- **Gestione Famiglia**: Gestisce solo la propria famiglia
- **Creazione Membri**: Può creare solo USER (non altri admin)
- **Attivazione/Disattivazione**: Gestisce stato membri (non può auto-disattivarsi)
- **Limitazioni**: Non vede dati privati degli utenti

### **👤 USER** (Membri famiglia)
- **Gestione Risorse**: Crea e gestisce le proprie risorse
- **Condivisione Granulare**: Privato, famiglia, membri selezionati
- **Limitazioni**: Non può creare altri utenti o gestire membri

## 🔧 Setup Iniziale

### **Prerequisiti**
```bash
# Verifica versioni
node --version    # >= 18.x
npm --version     # >= 9.x
nx --version      # >= 21.x
```

### **1. Installazione e Avvio**
```bash
# Clona il repository
git clone <repository-url>
cd alfy

# Installa dipendenze
npm install

# Avvia il backend
nx serve alfy-be
```

Il server sarà disponibile su: `http://localhost:3000`

### **2. Bootstrap del Sistema (SOLO PRIMA VOLTA)**

⚠️ **IMPORTANTE**: Questo endpoint funziona **SOLO** se non esiste già un sysadmin nel sistema.

```bash
curl -X POST http://localhost:3000/api/bootstrap/sysadmin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "pugliese.sergio87@gotmail.it",
    "password": "AdminPassword123!",
    "firstName": "Sergio",
    "lastName": "Pugliese"
  }'
```

**Risposta di successo:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "pugliese.sergio87@gotmail.it",
      "firstName": "Sergio",
      "lastName": "Pugliese",
      "globalRole": "SYSADMIN",
      "isPasswordReset": true
    }
  },
  "message": "Sysadmin created successfully"
}
```

### **3. Login Sysadmin**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "pugliese.sergio87@gotmail.it",
    "password": "AdminPassword123!"
  }'
```

**Salva il token dalla risposta:**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "...",
    "user": { ... }
  }
}
```

## 🏠 Gestione Famiglie (Sysadmin)

### **Creare una Famiglia**
```bash
curl -X POST http://localhost:3000/api/sysadmin/families \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Famiglia Rossi",
    "description": "La famiglia di Mario e Giulia Rossi"
  }'
```

### **Lista Famiglie**
```bash
curl -X GET http://localhost:3000/api/sysadmin/families \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### **Modificare una Famiglia**
```bash
curl -X PUT http://localhost:3000/api/sysadmin/families/FAMILY_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Famiglia Rossi Aggiornata",
    "description": "Descrizione aggiornata"
  }'
```

## 👥 Gestione Utenti (Sysadmin)

### **Creare un Admin per una Famiglia**
```bash
curl -X POST http://localhost:3000/api/sysadmin/users \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "mario.rossi@email.com",
    "firstName": "Mario",
    "lastName": "Rossi",
    "role": "ADMIN",
    "familyId": "FAMILY_ID"
  }'
```

### **Creare un User per una Famiglia**
```bash
curl -X POST http://localhost:3000/api/sysadmin/users \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "giulia.rossi@email.com",
    "firstName": "Giulia",
    "lastName": "Rossi",
    "role": "USER",
    "familyId": "FAMILY_ID"
  }'
```

**⚠️ Password Temporanea**: Tutti i nuovi utenti ricevono la password temporanea: `4lf1M3mb3r`

### **Lista Tutti gli Utenti**
```bash
curl -X GET http://localhost:3000/api/sysadmin/users \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### **Attivare/Disattivare un Utente**
```bash
# Disattivare
curl -X PUT http://localhost:3000/api/sysadmin/users/USER_ID/status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"isActive": false}'

# Attivare
curl -X PUT http://localhost:3000/api/sysadmin/users/USER_ID/status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"isActive": true}'
```

### **Cambiare Admin di una Famiglia**
```bash
curl -X PUT http://localhost:3000/api/sysadmin/families/FAMILY_ID/admin \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"newAdminId": "USER_ID"}'
```

### **Eliminare Definitivamente un Utente**
```bash
curl -X DELETE http://localhost:3000/api/sysadmin/users/USER_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 👑 Gestione Famiglia (Admin)

### **Login Admin**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "mario.rossi@email.com",
    "password": "4lf1M3mb3r"
  }'
```

**⚠️ Primo Login**: L'admin dovrà cambiare la password temporanea.

### **Cambiare Password (Obbligatorio al primo login)**
```bash
curl -X PUT http://localhost:3000/api/auth/change-password \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "4lf1M3mb3r",
    "newPassword": "NewSecurePassword123!"
  }'
```

### **Creare un Membro Famiglia**
```bash
curl -X POST http://localhost:3000/api/admin/family-members \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "figlio.rossi@email.com",
    "firstName": "Luca",
    "lastName": "Rossi"
  }'
```

### **Lista Membri della Famiglia**
```bash
curl -X GET http://localhost:3000/api/admin/family-members \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### **Attivare/Disattivare un Membro**
```bash
curl -X PUT http://localhost:3000/api/admin/family-members/MEMBER_ID/status \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"isActive": false}'
```

### **Statistiche Famiglia**
```bash
curl -X GET http://localhost:3000/api/admin/family-stats \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

## 👤 Utilizzo User

### **Login User**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "luca.rossi@email.com",
    "password": "4lf1M3mb3r"
  }'
```

### **Cambio Password Obbligatorio**
```bash
curl -X PUT http://localhost:3000/api/auth/change-password \
  -H "Authorization: Bearer USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "4lf1M3mb3r",
    "newPassword": "MySecurePassword123!"
  }'
```

### **Gestione Shopping List con Condivisione**
```bash
# Creare lista privata
curl -X POST http://localhost:3000/api/shopping-list \
  -H "Authorization: Bearer USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Lista Spesa Personale",
    "sharingLevel": "PRIVATE"
  }'

# Creare lista condivisa con la famiglia
curl -X POST http://localhost:3000/api/shopping-list \
  -H "Authorization: Bearer USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Lista Spesa Famiglia",
    "sharingLevel": "FAMILY"
  }'

# Creare lista condivisa con membri selezionati
curl -X POST http://localhost:3000/api/shopping-list \
  -H "Authorization: Bearer USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Lista Spesa Condivisa",
    "sharingLevel": "SELECTED_MEMBERS",
    "sharedWithUsers": ["USER_ID_1", "USER_ID_2"]
  }'
```

## 🔍 Documentazione API Completa

### **Swagger/OpenAPI**
Una volta avviato il server, accedi alla documentazione completa:

**URL**: `http://localhost:3000/api/docs`

La documentazione include:
- 📋 **Tutti gli endpoint** con esempi
- 🔐 **Sistema di autenticazione** integrato
- 📝 **Schemi di validazione** completi
- 🧪 **Testing interattivo** degli endpoint

## 🛡️ Sistema di Sicurezza

### **Guard Implementati**
1. **JwtAuthGuard**: Autenticazione JWT base
2. **SysAdminGuard**: Solo sysadmin
3. **FamilyAdminGuard**: Solo admin della famiglia
4. **FamilyAccessGuard**: Accesso alla famiglia
5. **FamilyMembershipGuard**: Appartenenza alla famiglia
6. **PreventSelfActionGuard**: Previene auto-azioni
7. **ResourceAccessGuard**: Controllo accesso risorse

### **Validazioni Password**
Le password devono contenere:
- ✅ Almeno 8 caratteri
- ✅ Almeno una lettera maiuscola
- ✅ Almeno una lettera minuscola
- ✅ Almeno un numero
- ✅ Almeno un carattere speciale

### **Isolamento Famiglie**
- ✅ **Zero Cross-Contamination**: Le famiglie sono completamente isolate
- ✅ **Controlli Multi-Livello**: Guard, service, database
- ✅ **Validazioni Rigorose**: Ogni operazione è validata

## 🚨 Troubleshooting

### **Errore: "Sysadmin already exists"**
Il bootstrap può essere eseguito solo una volta. Se hai già un sysadmin, usa il login normale.

### **Errore: "Access denied"**
Verifica che:
1. Il token JWT sia valido e non scaduto
2. L'utente abbia i permessi necessari per l'endpoint
3. L'utente appartenga alla famiglia corretta (per endpoint famiglia)

### **Errore: "Password must be reset"**
Tutti i nuovi utenti devono cambiare la password temporanea al primo login usando `/auth/change-password`.

### **Errore: "Family not found"**
Assicurati che:
1. La famiglia esista nel sistema
2. L'utente abbia accesso a quella famiglia
3. L'ID famiglia sia corretto

## 📞 Supporto

Per problemi o domande:
- 📧 **Email**: pugliese.sergio87@gotmail.it
- 📚 **Documentazione**: `http://localhost:3000/api/docs`
- 🐛 **Issues**: Usa il sistema di issue del repository

---

*Ultimo aggiornamento: Ottobre 2025*  
*Versione: 1.0 - Sistema Ruoli e Famiglie Completo*
