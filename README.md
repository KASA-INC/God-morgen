# Morgenhelt

En enkel iPad-vennlig webapp som gjør barnas morgenrutiner til et spill, med mørkeblått tema og sterke kontrastfarger.

## Funksjoner i v1

- To barneprofiler (Alma og Ludvik) med egne hverdagsrutiner.
- Begge barn kan ha hver sin aktive morgenøkt samtidig (egen klokke per barn).
- Store, trykkvennlige og mer lekne rutineknapper i stedet for punktliste/checkbox-liste.
- Forelder starter morgenøkter, og hvert barn får poeng + tidsbonus + morsomme lyder.
- Når siste oppgave er fullført blir morgenen automatisk fullført.
- Rekordvisning per barn: høyeste poengsum, raskeste morgen og totalt antall økter.
- Foreldremodus med PIN for å endre poeng og lydinnstillinger.
- Lokal lagring (`localStorage`) uten innlogging.
- PWA-støtte med manifest og service worker for app-lignende bruk på iPad.

## Poenglogikk

- Hver oppgave gir alltid minst `basePoints` (standard 10).
- Du kan få tidsbonus opp til `maxBonus` (standard 5) for oppgaver gjort tidlig i økten.
- Bonus trappes ned over tid, men går aldri under minstepoengene.
- Fullført morgen gir +20 bonus.

## Test på iPad (anbefalt)

1. Start appen på maskinen din:

```bash
python3 -m http.server 4173 --bind 0.0.0.0
```

2. Finn lokal IP-adresse på maskinen din:

```bash
hostname -I
```

3. På iPad (samme Wi‑Fi), åpne Safari til:

```text
http://DIN_IP:4173
```
