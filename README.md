# Morgenhelt

En enkel iPad-vennlig webapp som gjør barnas morgenrutiner til et spill.

## Funksjoner i v1

- To barneprofiler (Alma og Ludvik) med egne hverdagsrutiner.
- Rutinene kan fullføres i valgfri rekkefølge.
- Forelder starter morgenøkten med en knapp, timer går automatisk.
- Poengsystem med basispoeng + tidsbonus + fullført morgenbonus.
- Foreldremodus med PIN for å endre poeng og lydinnstillinger.
- Lokal lagring (`localStorage`) uten innlogging.
- Fargerikt, mer lekent design med fremdriftslinje og oppgave-emojier.
- PWA-støtte med manifest og service worker for app-lignende bruk på iPad.

## Test på iPad (anbefalt)

1. Start appen på maskinen din:

```bash
python3 -m http.server 4173 --bind 0.0.0.0
```

2. Finn lokal IP-adresse på maskinen din (eksempel):

```bash
hostname -I
```

3. På iPad (samme Wi‑Fi), åpne Safari til:

```text
http://DIN_IP:4173
```

4. (Valgfritt, men anbefalt) Installer som app:
   - Trykk **Del** i Safari
   - Velg **Legg til på Hjem-skjerm**

Da kan Morgenhelt brukes mer som en vanlig app i fullskjerm.
