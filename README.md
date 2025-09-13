# 🏠 Alfy - Home Management App

## 🎯 Vision & Concetto

**Alfy** è un'applicazione per la gestione completa della vita domestica e familiare. L'obiettivo è centralizzare tutte le attività quotidiane di una famiglia in un'unica app intuitiva e moderna.

### 🎪 Il Nome
"Alfy" deriva da "Alfred", il maggiordomo di Batman - rappresenta l'assistente digitale perfetto che si prende cura di tutti i dettagli della gestione domestica.

## 🌟 Funzionalità Core

### 📋 **Liste della Spesa** (Implementato)
- ✅ Creazione e gestione liste multiple
- ✅ Aggiunta/rimozione articoli  
- ✅ Segna come acquistato/non acquistato
- 🔄 **TODO**: Condivisione familiare
- 🔄 **TODO**: Prodotti preferiti e suggerimenti
- 🔄 **TODO**: Categorizzazione automatica
- 🔄 **TODO**: Integrazione con negozi online

### 👥 **Gestione Multi-Utente & Famiglia** (Da Implementare)
- **Profili Utente**: Ogni membro ha il suo profilo personalizzato
- **Famiglia Condivisa**: Creazione/join di gruppi familiari
- **Permessi Granulari**: 
  - Contenuti personali (solo utente)
  - Contenuti familiari (tutti i membri)
  - Ruoli admin/membro
- **Dashboard Personalizzate**: Vista filtrata per ogni utente

### 📅 **Calendar & Appuntamenti** (Da Implementare)
- **Appuntamenti Personali**: Medico, lavoro, hobby
- **Eventi Familiari**: Compleanni, vacanze, riunioni scolastiche
- **Promemoria Intelligenti**: Notifiche mirate
- **Integrazione Calendario**: Sync con Google/Apple Calendar
- **Recurring Events**: Gestione eventi ricorrenti

### ⏰ **Scadenze & Reminder** (Da Implementare)
- **Scadenze Domestiche**: Bollette, assicurazioni, controlli
- **Scadenze Personali**: Documenti, certificazioni
- **Smart Notifications**: 
  - Notifiche individuali per scadenze personali
  - Broadcast familiare per scadenze condivise
  - Escalation se non gestite
- **Templates**: Scadenze ricorrenti pre-impostate

### 💰 **Gestione Spese** (Da Implementare)
- **Expense Tracking**: Registrazione spese quotidiane
- **Categorizzazione**: Casa, cibo, trasporti, svago, etc.
- **Budget Familiari**: Limiti di spesa per categoria
- **Split Expenses**: Divisione spese tra membri famiglia
- **Reports & Analytics**: Grafici e trend di spesa
- **Integrazione Bancaria**: Import automatico movimenti (futuro)

### 🔔 **Sistema Notifiche Avanzato** (Da Implementare)
- **Push Notifications**: Promemoria in tempo reale
- **In-App Notifications**: Centro notifiche interno
- **Email Digest**: Riassunto settimanale attività
- **Smart Scheduling**: Notifiche basate su abitudini utente
- **Quiet Hours**: Modalità silenziosa per fasce orarie

## 🏗️ Architettura Tecnica

### **Architettura Monorepo con Nx**
Il progetto utilizza **Nx Workspace** per gestire un monorepo con architettura a microfrontend:

```
alfy/
├── apps/
│   ├── alfy-fe/          # Shell principale (Angular)
│   ├── mfShopping/       # Microfrontend Shopping Lists
│   ├── alfy-be/          # Backend API (NestJS)
│   └── alfy-be-e2e/      # Test E2E backend
├── libs/
│   └── alfy-shared-lib/  # Libreria condivisa
└── dist/                 # Build artifacts
```

### **Patterns Architetturali**
- **Microfrontend Architecture**: Applicazioni modulari e indipendenti
- **Module Federation**: Sharing di codice tra microfrontend
- **Clean Architecture**: Separazione domini, use case, infrastructure
- **Angular Signals**: State management reattivo
- **Standalone Components**: Approccio moderno Angular
- **Repository Pattern**: Astrazione data access
- **Dependency Injection**: IoC container Angular e NestJS

### **Tech Stack**

#### **Frontend**
- **Framework**: Angular 20+ con Standalone Components
- **Architettura**: Microfrontend con Module Federation
- **State Management**: Angular Signals + RxJS
- **Styling**: PrimeNG
- **Forms**: Reactive Forms
- **Build**: Webpack con Module Federation
- **Monorepo**: Nx Workspace

#### **Backend** 
- **Framework**: NestJS con TypeScript
- **Architecture**: Modular con Clean Architecture
- **Database**: TypeORM (configurabile)
- **API**: RESTful con OpenAPI/Swagger
- **Validation**: Class Validator + Class Transformer
- **Testing**: Jest

#### **Shared**
- **Library**: Nx shared library per tipi, servizi e componenti comuni
- **API Client**: Generato automaticamente con Orval da OpenAPI
- **Interceptors**: Gestione errori e autenticazione centralizzata

#### **DevOps & Tooling**
- **Monorepo**: Nx 21.3.6 con npm
- **Testing**: Jest + Testing Library
- **Linting**: ESLint con configurazioni condivise
- **Build**: Nx build system con caching
- **Code Generation**: Nx generators per consistenza

### **Struttura Applicazioni**

#### **alfy-fe (Shell Application)**
- **Ruolo**: Application shell principale che orchestrا i microfrontend
- **Responsabilità**: Routing, layout comune, autenticazione
- **Tecnologie**: Angular + Module Federation

#### **mfShopping (Microfrontend)**
- **Ruolo**: Gestione completa delle liste della spesa
- **Features**: CRUD liste, gestione articoli, interfaccia shopping
- **Esposizione**: Moduli e route esportati via Module Federation

#### **alfy-be (Backend API)**
- **Ruolo**: API REST per tutti i servizi
- **Architettura**: NestJS con moduli per dominio (shopping-list, etc.)
- **Features**: CRUD operations, validazione, documentazione OpenAPI

#### **alfy-shared-lib (Shared Library)**
- **Ruolo**: Codice condiviso tra applicazioni
- **Contenuto**: 
  - Servizi API generati automaticamente
  - Componenti UI comuni
  - Interceptors e utilities
  - Tipi TypeScript condivisi

### **Comandi di Sviluppo**

```bash
# Installazione dipendenze
npm install

# Sviluppo (tutti i servizi in parallelo)
npm run start:all

# Sviluppo singole applicazioni
nx serve alfy-fe          # Frontend shell
nx serve mfShopping       # Microfrontend shopping
nx serve alfy-be          # Backend API

# Build
nx build alfy-fe --prod   # Build produzione frontend
nx build alfy-be --prod   # Build produzione backend
nx build alfy-shared-lib  # Build libreria condivisa

# Testing
nx test alfy-fe           # Test frontend
nx test alfy-be           # Test backend
nx e2e alfy-be-e2e        # Test E2E

# Linting
nx lint alfy-fe           # Lint frontend
nx lint alfy-be           # Lint backend

# Generazione API client (da OpenAPI)
npm run generate:api      # Rigenera client da schema OpenAPI

# Visualizzazione dependency graph
nx graph                  # Mostra grafo delle dipendenze
```

## 📱 User Experience

### **Navigation Flow**
```
🏠 Dashboard
├── 📋 Shopping Lists
│   ├── My Lists
│   ├── Family Lists  
│   └── Shared Items
├── 📅 Calendar
│   ├── Personal Events
│   ├── Family Events
│   └── Deadlines
├── 💰 Expenses
│   ├── Add Expense
│   ├── Budget Overview
│   └── Reports
├── 🔔 Notifications
└── ⚙️ Settings
    ├── Profile
    ├── Family Management
    └── Preferences
```

### **Key User Journeys**

#### **Nuovo Utente**
1. Download app → Onboarding → Registrazione
2. Setup profilo → Crea famiglia o join esistente
3. Tutorial guidato → Prime configurazioni
4. Prima lista spesa → Primo appuntamento

#### **Uso Quotidiano Famiglia**
1. Check dashboard mattutina
2. Aggiunta spese durante giornata  
3. Update shopping list dal supermercato
4. Review notifiche serali
5. Planning settimanale weekend

## 🚀 Roadmap di Sviluppo

### **Phase 0: Architettura & Foundation (✅ Completato)**
- [x] Setup Nx monorepo workspace
- [x] Architettura microfrontend con Module Federation
- [x] Backend NestJS con architettura modulare
- [x] Shared library per codice comune
- [x] Sistema build e development workflow
- [x] Generazione automatica API client da OpenAPI

### **Phase 1: Shopping Lists Core (✅ In Corso)**
- [x] CRUD shopping lists (Backend API)
- [x] Interfaccia gestione liste (Frontend)
- [x] Gestione articoli con unità di misura
- [ ] Ottimizzazione UX e responsive design
- [ ] Sistema autenticazione (JWT)
- [ ] Gestione profili utente
- [ ] Refactor per supporto multi-user

### **Phase 2: Calendar & Notifications (Q2 2024)**
- [ ] Gestione appuntamenti personali/familiari
- [ ] Sistema scadenze con reminder
- [ ] Push notifications (Capacitor)
- [ ] In-app notification center
- [ ] Integrazione calendario nativo

### **Phase 3: Expense Management (Q3 2024)**
- [ ] Tracking spese con categorizzazione
- [ ] Budget familiari e alerting
- [ ] Split expenses tra membri
- [ ] Reports e analytics avanzati
- [ ] Export dati (PDF/Excel)

### **Phase 4: Advanced Features (Q4 2024)**
- [ ] AI suggestions per shopping list
- [ ] Geofencing per reminder location-based
- [ ] Integrazione assistenti vocali
- [ ] Dark mode & accessibility
- [ ] Multi-language support

### **Phase 5: Ecosystem (2025)**
- [ ] API pubbliche per integrazioni
- [ ] Web app companion
- [ ] Smart home integrations
- [ ] Marketplace template/plugins
- [ ] Community features

## 🎨 Design System

### **Color Palette**
- **Primary**: `#5D9B9B` (Teal calmo e affidabile)
- **Secondary**: `#F1C40F` (Giallo energico per azioni)
- **Success**: `#22C55E` (Verde per conferme)
- **Accent**: `#1ABC9C` (Azzurro per highlights)

### **Typography**
- **Headings**: Roboto Bold
- **Body**: Roboto Regular  
- **UI Elements**: Roboto Medium

### **Component Library**
- Basato su Ionic Design System
- Custom components per business logic
- Responsive design mobile-first
- Gestures native (swipe, pull-to-refresh)

## 📊 Metriche di Successo

### **Engagement**
- Daily Active Users (DAU)
- Session duration media
- Feature adoption rate
- Retention rate (1/7/30 giorni)

### **Business Value**
- Tempo risparmiato per famiglia/settimana
- Accuratezza gestione budget
- Riduzione spese impulso
- Stress reduction index (survey)

### **Technical**
- App performance (startup time < 2s)
- Crash rate < 0.1%
- API response time < 500ms
- Offline capability

## 🔮 Vision a Lungo Termine

**Alfy** diventerà il **"sistema operativo della famiglia moderna"** - l'unico punto di accesso per gestire tutti gli aspetti della vita domestica con intelligence artificiale che impara dalle abitudini familiari e suggerisce ottimizzazioni proattive.

### **Integrazione Ecosystem**
- **Smart Home**: Integrazione IoT (luci, termostato, sicurezza)
- **E-commerce**: Auto-ordering prodotti finiti
- **Services**: Booking automatico servizi (pulizie, riparazioni)
- **Financial**: Sincronizzazione conti e investimenti familiari

---

## 🛠️ Stato Attuale del Progetto

**Architettura**: ✅ Nx Monorepo con Microfrontend  
**Backend**: ✅ NestJS con moduli shopping-list  
**Frontend**: ✅ Angular Shell + Microfrontend Shopping  
**Shared Library**: ✅ API client e componenti comuni  
**Development Workflow**: ✅ Completamente funzionante  

Il progetto ha migrato con successo da Ionic a un'architettura moderna basata su **Nx workspace** con **microfrontend Angular** e **backend NestJS**. La struttura attuale permette scalabilità, manutenibilità e sviluppo parallelo di features indipendenti.

---

*Ultimo aggiornamento: 12 Settembre 2025*  
*Versione documento: 2.0 - Architettura Nx* 