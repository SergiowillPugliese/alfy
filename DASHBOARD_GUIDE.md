# 🎛️ Alfy - Guida Dashboard Sysadmin e Admin

## 📋 Panoramica

Questa guida fornisce una panoramica completa delle funzionalità disponibili nelle dashboard di **Sysadmin** e **Admin** del sistema Alfy. Ogni ruolo ha accesso a funzionalità specifiche progettate per gestire efficacemente famiglie e utenti.

## 🔱 Dashboard Sysadmin

Il **Sysadmin** ha controllo completo su tutto il sistema e può gestire famiglie, utenti e configurazioni globali.

### **🏠 Gestione Famiglie**

#### **Visualizza Tutte le Famiglie**
- **Endpoint**: `GET /api/sysadmin/families`
- **Funzionalità**: 
  - Lista completa di tutte le famiglie nel sistema
  - Informazioni su admin, membri attivi/inattivi
  - Stato famiglia (attiva/inattiva)
  - Data creazione e ultimo aggiornamento

**Esempio Risposta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "family_123",
      "name": "Famiglia Rossi",
      "description": "La famiglia di Mario e Giulia",
      "adminId": "user_456",
      "adminName": "Mario Rossi",
      "isActive": true,
      "memberCount": 4,
      "activeMembers": 3,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### **Creare Nuova Famiglia**
- **Endpoint**: `POST /api/sysadmin/families`
- **Funzionalità**:
  - Crea una nuova famiglia nel sistema
  - Assegna nome e descrizione
  - Famiglia inizialmente senza admin (da assegnare successivamente)

**Payload:**
```json
{
  "name": "Famiglia Bianchi",
  "description": "Famiglia di 5 membri con 2 figli"
}
```

#### **Modificare Famiglia Esistente**
- **Endpoint**: `PUT /api/sysadmin/families/{familyId}`
- **Funzionalità**:
  - Modifica nome e descrizione
  - Attiva/disattiva famiglia
  - Cambia stato generale

#### **Cambiare Admin Famiglia**
- **Endpoint**: `PUT /api/sysadmin/families/{familyId}/admin`
- **Funzionalità**:
  - Assegna nuovo admin alla famiglia
  - Rimuove ruolo admin dal precedente
  - Valida che il nuovo admin appartenga alla famiglia

**Payload:**
```json
{
  "newAdminId": "user_789"
}
```

### **👥 Gestione Utenti Globale**

#### **Visualizza Tutti gli Utenti**
- **Endpoint**: `GET /api/sysadmin/users`
- **Funzionalità**:
  - Lista completa di tutti gli utenti del sistema
  - Filtro per famiglia, ruolo, stato
  - Informazioni su ultima attività
  - Stato password reset

**Esempio Risposta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "user_123",
      "email": "mario.rossi@email.com",
      "firstName": "Mario",
      "lastName": "Rossi",
      "globalRole": null,
      "familyRole": "ADMIN",
      "familyName": "Famiglia Rossi",
      "isActive": true,
      "isPasswordReset": true,
      "lastLogin": "2024-01-20T14:30:00Z",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### **Creare Nuovo Utente**
- **Endpoint**: `POST /api/sysadmin/users`
- **Funzionalità**:
  - Crea utente con ruolo ADMIN o USER
  - Assegna a famiglia esistente
  - Password temporanea automatica: `4lf1M3mb3r`
  - Forza reset password al primo login

**Payload:**
```json
{
  "email": "nuovo.utente@email.com",
  "firstName": "Nuovo",
  "lastName": "Utente",
  "role": "ADMIN",  // o "USER"
  "familyId": "family_123"
}
```

#### **Gestire Stato Utenti**
- **Endpoint**: `PUT /api/sysadmin/users/{userId}/status`
- **Funzionalità**:
  - Attiva/disattiva utenti
  - Blocca accesso temporaneamente
  - Mantiene dati per riattivazione futura

**Payload:**
```json
{
  "isActive": false,
  "reason": "Utente temporaneamente sospeso"
}
```

#### **Eliminazione Definitiva**
- **Endpoint**: `DELETE /api/sysadmin/users/{userId}`
- **Funzionalità**:
  - ⚠️ **ATTENZIONE**: Eliminazione permanente
  - Rimuove tutti i dati associati
  - Non reversibile
  - Richiede conferma esplicita

### **📊 Dashboard Analytics Sysadmin**

#### **Statistiche Sistema**
- **Endpoint**: `GET /api/sysadmin/stats`
- **Metriche Disponibili**:
  - Numero totale famiglie attive/inattive
  - Numero totale utenti per ruolo
  - Crescita mensile registrazioni
  - Famiglie più attive
  - Utenti che necessitano reset password

**Esempio Risposta:**
```json
{
  "success": true,
  "data": {
    "totalFamilies": 25,
    "activeFamilies": 23,
    "totalUsers": 127,
    "usersByRole": {
      "ADMIN": 25,
      "USER": 102
    },
    "pendingPasswordResets": 8,
    "monthlyGrowth": {
      "families": 3,
      "users": 12
    }
  }
}
```

## 👑 Dashboard Admin

L'**Admin** gestisce esclusivamente la propria famiglia e i suoi membri.

### **🏠 Gestione Famiglia Propria**

#### **Visualizza Membri Famiglia**
- **Endpoint**: `GET /api/admin/family-members`
- **Funzionalità**:
  - Lista tutti i membri della propria famiglia
  - Stato attivo/inattivo
  - Ultimo accesso
  - Ruolo nella famiglia

**Esempio Risposta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "user_456",
      "email": "giulia.rossi@email.com",
      "firstName": "Giulia",
      "lastName": "Rossi",
      "role": "USER",
      "isActive": true,
      "isPasswordReset": true,
      "lastLogin": "2024-01-20T09:15:00Z",
      "joinedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### **Creare Nuovo Membro**
- **Endpoint**: `POST /api/admin/family-members`
- **Funzionalità**:
  - Crea solo utenti con ruolo USER
  - Non può creare altri admin
  - Password temporanea automatica
  - Aggiunge automaticamente alla propria famiglia

**Payload:**
```json
{
  "email": "figlio.rossi@email.com",
  "firstName": "Luca",
  "lastName": "Rossi"
}
```

#### **Gestire Stato Membri**
- **Endpoint**: `PUT /api/admin/family-members/{memberId}/status`
- **Funzionalità**:
  - Attiva/disattiva membri della famiglia
  - ⚠️ **Limitazione**: Non può disattivare se stesso
  - ⚠️ **Limitazione**: Non può disattivare altri admin

**Payload:**
```json
{
  "isActive": false,
  "reason": "Membro temporaneamente inattivo"
}
```

### **📊 Statistiche Famiglia**

#### **Dashboard Famiglia**
- **Endpoint**: `GET /api/admin/family-stats`
- **Metriche Disponibili**:
  - Numero membri attivi/inattivi
  - Ultima attività membri
  - Risorse condivise nella famiglia
  - Membri che necessitano reset password

**Esempio Risposta:**
```json
{
  "success": true,
  "data": {
    "familyName": "Famiglia Rossi",
    "totalMembers": 4,
    "activeMembers": 3,
    "inactiveMembers": 1,
    "pendingPasswordResets": 1,
    "sharedResources": {
      "shoppingLists": 5,
      "familyEvents": 12
    },
    "lastActivity": "2024-01-20T14:30:00Z"
  }
}
```

### **🔐 Gestione Sicurezza Famiglia**

#### **Monitoraggio Accessi**
- **Endpoint**: `GET /api/admin/family-activity`
- **Funzionalità**:
  - Log accessi membri famiglia
  - Attività sospette
  - Tentativi login falliti
  - Dispositivi utilizzati

#### **Reset Password Membri**
- **Endpoint**: `PUT /api/admin/family-members/{memberId}/reset-password`
- **Funzionalità**:
  - Forza reset password per un membro
  - Genera nuova password temporanea
  - Notifica il membro del reset

## 🛡️ Controlli di Sicurezza

### **Validazioni Sysadmin**
- ✅ **Controllo Ruolo**: Solo utenti con `globalRole: SYSADMIN`
- ✅ **Token Valido**: JWT non scaduto e valido
- ✅ **Operazioni Critiche**: Conferma esplicita per eliminazioni

### **Validazioni Admin**
- ✅ **Controllo Famiglia**: Solo membri della propria famiglia
- ✅ **Prevenzione Auto-Azioni**: Non può disattivare se stesso
- ✅ **Limitazioni Ruolo**: Non può creare altri admin
- ✅ **Isolamento**: Non vede dati di altre famiglie

### **Audit Trail**
Tutte le operazioni critiche vengono loggate:
- 📝 **Creazione/Eliminazione** utenti
- 🔄 **Cambio stato** utenti
- 👑 **Cambio admin** famiglia
- 🔐 **Reset password** forzati

## 🎯 Best Practices

### **Per Sysadmin**
1. **Backup Regolari**: Esporta dati famiglie periodicamente
2. **Monitoraggio Attività**: Controlla statistiche settimanalmente
3. **Gestione Admin**: Assegna admin responsabili per famiglia
4. **Sicurezza**: Cambia password regolarmente
5. **Documentazione**: Mantieni log delle operazioni critiche

### **Per Admin**
1. **Gestione Membri**: Controlla stato membri regolarmente
2. **Password Policy**: Assicurati che i membri cambino password temporanee
3. **Attività Famiglia**: Monitora condivisioni e accessi
4. **Comunicazione**: Informa membri di cambiamenti importanti
5. **Backup Locale**: Esporta dati famiglia periodicamente

## 🚨 Scenari di Emergenza

### **Admin Non Disponibile**
1. **Sysadmin** può cambiare admin famiglia
2. Assegnare temporaneamente a membro fidato
3. Ripristinare admin originale quando disponibile

### **Famiglia Compromessa**
1. **Admin** disattiva tutti i membri temporaneamente
2. **Sysadmin** può intervenire se necessario
3. Reset password forzato per tutti i membri
4. Riattivazione graduale dopo verifica

### **Utente Problematico**
1. **Admin** disattiva immediatamente l'utente
2. **Sysadmin** può eliminare definitivamente se necessario
3. Comunicazione con altri membri famiglia

## 📞 Supporto e Assistenza

### **Contatti**
- 🔱 **Sysadmin**: pugliese.sergio87@gotmail.it
- 📚 **Documentazione**: `http://localhost:3000/api/docs`
- 🆘 **Emergenze**: Contatto diretto sysadmin

### **Risorse Utili**
- 📖 **Setup Guide**: `SETUP_GUIDE.md`
- 🔧 **API Documentation**: Swagger UI
- 📊 **Monitoring**: Dashboard analytics integrate

---

*Ultimo aggiornamento: Ottobre 2025*  
*Versione: 1.0 - Dashboard Complete Guide*
