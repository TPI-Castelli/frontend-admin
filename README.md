# SmartCity Brescia - Pannello Amministratore

Questo portale è dedicato alla gestione e al monitoraggio in tempo reale del sistema di parcheggi cittadini.

## 🚀 Caratteristiche Principali

- **Analytics Dashboard**: Monitoraggio dell'occupazione attuale tramite progress bar dinamiche.
- **Trend Settimanali**: Visualizzazione dell'andamento delle prenotazioni negli ultimi 7 giorni tramite grafici interattivi.
- **Gestione Utenti**: Tab dedicata alla creazione, visualizzazione ed eliminazione di profili Cittadino o Amministratore.
- **Gestione Parcheggi**: Tab dedicata alla manutenzione del sistema, creazione di nuove aree e reset della cronologia.
- **Aggiornamento Real-time**: Integrazione con WebSockets (Socket.io) per aggiornamenti istantanei senza refresh della pagina.

## 🛠️ Tecnologie Utilizzate

- **React.js** con **TypeScript**
- **Vite** (Build tool)
- **Recharts** (Visualizzazione dati)
- **Axios** (Comunicazione API)
- **Socket.io-client** (Real-time)

## 📦 Installazione e Avvio

1. Assicurati che il backend sia attivo.
2. Naviga nella cartella:
   ```bash
   cd frontend-admin
   ```
3. Installa le dipendenze:
   ```bash
   pnpm install
   ```
4. Avvia il server di sviluppo:
   ```bash
   pnpm dev
   ```

## 🔐 Accesso

Per accedere alle funzionalità amministrative, utilizza le seguenti credenziali predefinite:
- **Username**: `admin`
- **Password**: `adminpass`

> **Nota**: Il sistema è protetto e impedisce l'accesso ad account con ruolo non amministrativo.
