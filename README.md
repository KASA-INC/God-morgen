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
