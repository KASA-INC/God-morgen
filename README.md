# Morgenhelt

En enkel iPad-vennlig webapp som gjør barnas morgenrutiner til et spill, med superhelt-inspirert mørkeblått tema, sterke kontrastfarger og heroiske lydeffekter.

## Funksjoner i v1

- To barneprofiler (Alma og Ludvik) med egne hverdagsrutiner.
- Store, trykkvennlige og lekne rutineknapper i stedet for punktliste/checkbox-liste.
- Egen "Legg til oppgave"-boks per barn for å legge inn nye rutiner direkte i brettet.
- Forelder starter morgenøkter, og hvert barn får poeng + tidsbonus + morsomme lyder.
- Hver oppgave bruker en skjult deltid mellom forrige og neste oppgave for bonusberegning.
- Når siste oppgave er fullført blir morgenen automatisk fullført.
- Rekordvisning per barn: høyeste poengsum og raskeste morgen.
- Statistikk nederst med graf for gjennomsnittlig tid brukt per oppgave.
- Foreldremodus med PIN for å endre poeng og lydinnstillinger.
- Lokal lagring (`localStorage`) uten innlogging.
- PWA-støtte med manifest og service worker for app-lignende bruk på iPad.

## Poenglogikk

- Hver oppgave gir alltid minst `basePoints` (standard 10).
- Tiden brukt på hver oppgave vises i oppgaveboksen når den er fullført.
- Du kan få tidsbonus opp til `maxBonus` (standard 5) for oppgaver gjort tidlig i økten.
- Bonus trappes ned over tid, men går aldri under minstepoengene.
- Fullført morgen gir +20 bonus.

## Profil og synk (Firebase)

Denne versjonen bruker ekte Firebase-integrasjon i frontend for:
- Google-, Facebook- og Apple-innlogging via Firebase Auth.
- Synk av app-state per bruker via Firestore (`profiles/{uid}`).
- Realtime oppdatering mellom enheter med `onSnapshot`.
- Førstegangsoppsett for å legge til barn og oppgaver per barn.

### Oppsett

1. Lag et Firebase-prosjekt.
2. Aktiver **Authentication** providerne: Google, Facebook, Apple.
3. Opprett Firestore database.
4. Fyll inn `firebase-config.js` med verdiene fra Firebase Console.
5. Sett autoriserte domener i Firebase Auth (f.eks. localhost + produksjonsdomene).

### Feilsøking av Google-innlogging

Hvis Google-innlogging feiler i nettleseren:
- Bekreft at `firebase-config.js` er fylt ut med riktig `apiKey`, `authDomain`, `projectId` og `appId`.
- Sjekk at domenet du kjører fra (f.eks. `localhost`, `127.0.0.1` eller produksjonsdomene) ligger i **Authentication → Settings → Authorized domains** i Firebase Console.
- Sjekk at Google-provider er aktivert i **Authentication → Sign-in method**.
- Hvis popup blokkeres av nettleseren, prøver appen automatisk redirect-flyt.

### Eksempel på Firestore-regel (minimum)

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /profiles/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

### iCloud / Apple

iCloud-innlogging i web tilsvarer «Sign in with Apple». I Firebase bruker vi provider `apple.com`.


## Ny innloggingsflyt

- Før innlogging vises en ren login-side med kun logo + innloggingsalternativer.
- Etter innlogging vises hovedsiden.
- Hovedsiden starter tom hvis brukeren ikke har lagt til barn ennå.
- Barn og oppgaver kan legges til/fjernes direkte fra hovedsiden (uten profil-dialog).
