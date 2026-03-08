# Morgenhelt

En enkel iPad-vennlig webapp som gjør barnas morgenrutiner til et spill, med mørkeblått tema og sterke kontrastfarger.

## Funksjoner i v1

- To barneprofiler (Alma og Ludvik) med egne hverdagsrutiner.
- Begge barn kan ha hver sin aktive morgenøkt samtidig (egen klokke per barn).
- Store, trykkvennlige og mer lekne rutineknapper i stedet for punktliste/checkbox-liste.
- Forelder starter morgenøkter, og hvert barn får poeng + tidsbonus + morsomme lyder.
- Foreldremodus med PIN for å endre poeng og lydinnstillinger.
- Lokal lagring (`localStorage`) uten innlogging.
- PWA-støtte med manifest og service worker for app-lignende bruk på iPad.

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
