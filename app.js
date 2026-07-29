const DEFAULT_STATE = {
  soundEnabled: true,
  bonusTasksEnabled: true,
  scoring: { basePoints: 10, maxBonus: 5 },
  children: {},
  history: [],
  activeSessions: {},
  wildcards: {},
  wildcardHistory: {},
  dayStatusOverrides: {},
  streaks: {},
  pointBank: {},
  levelProgress: {},
  rewardCatalog: [],
  rewardRedemptions: [],
  meta: { updatedAt: 0 },
};

const DEFAULT_REWARD_CATALOG = [
  { id: "velg-film", title: "Velg filmkveld", cost: 150 },
  { id: "velg-middag", title: "Velg middag", cost: 250 },
  { id: "storpremie", title: "Større premie", cost: 500 },
];
const POINT_MILESTONES = [100, 250, 500, 750, 1000];
const DAY_BONUSES = {
  sickBonus: 10,
  weekendSickBonus: 20,
};

const DEFAULT_WILDCARD_TASKS = [
  { id: "kompliment", title: "Gi et ekte kompliment til en hjemme i dag" },
  { id: "rydde-5", title: "Rydd i 5 minutter på et valgfritt sted" },
  { id: "hjelpe-hand", title: "Tilby hjelp uten å bli spurt" },
  { id: "vannpause", title: "Drikk et glass vann før dere går" },
  { id: "smil", title: "Få noen til å smile før dere drar" },
  { id: "ryggsekk", title: "Sjekk at sekken er klar helt selv" },
  { id: "bordet", title: "Hjelp med å dekke eller rydde bordet" },
  { id: "takknemlig", title: "Si én ting du er takknemlig for i dag" },
];
const WILDCARD_HISTORY_LIMIT = 20;
const WILDCARD_REPEAT_GUARD = 4;
let wildcardTasks = [...DEFAULT_WILDCARD_TASKS];
const WILDCARD_REFRESH_KEY = `refresh-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const DEFAULT_LEVEL_DEFINITIONS = [
  {
    "level": 1,
    "name": "Pygméspissmus",
    "requiredCompletedTasks": 0
  },
  {
    "level": 2,
    "name": "Pilgiftfrosk",
    "requiredCompletedTasks": 25
  },
  {
    "level": 3,
    "name": "Blåspurv",
    "requiredCompletedTasks": 50
  },
  {
    "level": 4,
    "name": "Husmus",
    "requiredCompletedTasks": 75
  },
  {
    "level": 5,
    "name": "Rødstrupe",
    "requiredCompletedTasks": 100
  },
  {
    "level": 6,
    "name": "Kanarifugl",
    "requiredCompletedTasks": 125
  },
  {
    "level": 7,
    "name": "Rødøyet løvfrosk",
    "requiredCompletedTasks": 150
  },
  {
    "level": 8,
    "name": "Markmus",
    "requiredCompletedTasks": 175
  },
  {
    "level": 9,
    "name": "Spurv",
    "requiredCompletedTasks": 200
  },
  {
    "level": 10,
    "name": "Isfugl",
    "requiredCompletedTasks": 225
  },
  {
    "level": 11,
    "name": "Lemen",
    "requiredCompletedTasks": 250
  },
  {
    "level": 12,
    "name": "Hærfugl",
    "requiredCompletedTasks": 275
  },
  {
    "level": 13,
    "name": "Jerboa",
    "requiredCompletedTasks": 300
  },
  {
    "level": 14,
    "name": "Stripeekorn",
    "requiredCompletedTasks": 325
  },
  {
    "level": 15,
    "name": "Moldvarp",
    "requiredCompletedTasks": 350
  },
  {
    "level": 16,
    "name": "Axolotl",
    "requiredCompletedTasks": 375
  },
  {
    "level": 17,
    "name": "Salamander",
    "requiredCompletedTasks": 400
  },
  {
    "level": 18,
    "name": "Kengururotte",
    "requiredCompletedTasks": 425
  },
  {
    "level": 19,
    "name": "Hamster",
    "requiredCompletedTasks": 450
  },
  {
    "level": 20,
    "name": "Spøkelsesaper",
    "requiredCompletedTasks": 475
  },
  {
    "level": 21,
    "name": "Pipeharer",
    "requiredCompletedTasks": 500
  },
  {
    "level": 22,
    "name": "Flygeekorn",
    "requiredCompletedTasks": 525
  },
  {
    "level": 23,
    "name": "Kestrel",
    "requiredCompletedTasks": 550
  },
  {
    "level": 24,
    "name": "Skjære",
    "requiredCompletedTasks": 575
  },
  {
    "level": 25,
    "name": "Ekorn",
    "requiredCompletedTasks": 600
  },
  {
    "level": 26,
    "name": "Mustela",
    "requiredCompletedTasks": 625
  },
  {
    "level": 27,
    "name": "Røyskatt",
    "requiredCompletedTasks": 650
  },
  {
    "level": 28,
    "name": "Hakkespett",
    "requiredCompletedTasks": 675
  },
  {
    "level": 29,
    "name": "Lundefugl",
    "requiredCompletedTasks": 700
  },
  {
    "level": 30,
    "name": "Kråke",
    "requiredCompletedTasks": 725
  },
  {
    "level": 31,
    "name": "Oksefrosk",
    "requiredCompletedTasks": 750
  },
  {
    "level": 32,
    "name": "Springspissmus",
    "requiredCompletedTasks": 775
  },
  {
    "level": 33,
    "name": "Chinchilla",
    "requiredCompletedTasks": 800
  },
  {
    "level": 34,
    "name": "Surikat",
    "requiredCompletedTasks": 825
  },
  {
    "level": 35,
    "name": "Tukan",
    "requiredCompletedTasks": 850
  },
  {
    "level": 36,
    "name": "Pinnsvin",
    "requiredCompletedTasks": 875
  },
  {
    "level": 37,
    "name": "Marsvin",
    "requiredCompletedTasks": 900
  },
  {
    "level": 38,
    "name": "Præriehund",
    "requiredCompletedTasks": 925
  },
  {
    "level": 39,
    "name": "Mink",
    "requiredCompletedTasks": 950
  },
  {
    "level": 40,
    "name": "Vandrefalk",
    "requiredCompletedTasks": 975
  },
  {
    "level": 41,
    "name": "Måke",
    "requiredCompletedTasks": 1000
  },
  {
    "level": 42,
    "name": "Kakadu",
    "requiredCompletedTasks": 1025
  },
  {
    "level": 43,
    "name": "Dovenloris",
    "requiredCompletedTasks": 1050
  },
  {
    "level": 44,
    "name": "Grevlingpungdyr",
    "requiredCompletedTasks": 1075
  },
  {
    "level": 45,
    "name": "Skjermflygere",
    "requiredCompletedTasks": 1100
  },
  {
    "level": 46,
    "name": "Båndilder",
    "requiredCompletedTasks": 1125
  },
  {
    "level": 47,
    "name": "Nebbdyr",
    "requiredCompletedTasks": 1150
  },
  {
    "level": 48,
    "name": "Kanin",
    "requiredCompletedTasks": 1175
  },
  {
    "level": 49,
    "name": "Fennek",
    "requiredCompletedTasks": 1200
  },
  {
    "level": 50,
    "name": "Tårnugle",
    "requiredCompletedTasks": 1225
  },
  {
    "level": 51,
    "name": "Ara",
    "requiredCompletedTasks": 1250
  },
  {
    "level": 52,
    "name": "Ravn",
    "requiredCompletedTasks": 1275
  },
  {
    "level": 53,
    "name": "Mår",
    "requiredCompletedTasks": 1300
  },
  {
    "level": 54,
    "name": "Mungo",
    "requiredCompletedTasks": 1325
  },
  {
    "level": 55,
    "name": "Snøugle",
    "requiredCompletedTasks": 1350
  },
  {
    "level": 56,
    "name": "Stokkand",
    "requiredCompletedTasks": 1375
  },
  {
    "level": 57,
    "name": "Hegre",
    "requiredCompletedTasks": 1400
  },
  {
    "level": 58,
    "name": "Dynndjevel",
    "requiredCompletedTasks": 1425
  },
  {
    "level": 59,
    "name": "Fingerdyr",
    "requiredCompletedTasks": 1450
  },
  {
    "level": 60,
    "name": "Saki",
    "requiredCompletedTasks": 1475
  },
  {
    "level": 61,
    "name": "Kiwi",
    "requiredCompletedTasks": 1500
  },
  {
    "level": 62,
    "name": "Kylling",
    "requiredCompletedTasks": 1525
  },
  {
    "level": 63,
    "name": "Flamingo",
    "requiredCompletedTasks": 1550
  },
  {
    "level": 64,
    "name": "Skarv",
    "requiredCompletedTasks": 1575
  },
  {
    "level": 65,
    "name": "Viklebjørn",
    "requiredCompletedTasks": 1600
  },
  {
    "level": 66,
    "name": "Quokka",
    "requiredCompletedTasks": 1625
  },
  {
    "level": 67,
    "name": "Uakari",
    "requiredCompletedTasks": 1650
  },
  {
    "level": 68,
    "name": "Hare",
    "requiredCompletedTasks": 1675
  },
  {
    "level": 69,
    "name": "Pungrotte",
    "requiredCompletedTasks": 1700
  },
  {
    "level": 70,
    "name": "Skunkdyr",
    "requiredCompletedTasks": 1725
  },
  {
    "level": 71,
    "name": "Hubro",
    "requiredCompletedTasks": 1750
  },
  {
    "level": 72,
    "name": "Stork",
    "requiredCompletedTasks": 1775
  },
  {
    "level": 73,
    "name": "Murmeldyr",
    "requiredCompletedTasks": 1800
  },
  {
    "level": 74,
    "name": "Nesebjørn",
    "requiredCompletedTasks": 1825
  },
  {
    "level": 75,
    "name": "Dovendyr",
    "requiredCompletedTasks": 1850
  },
  {
    "level": 76,
    "name": "Gås",
    "requiredCompletedTasks": 1875
  },
  {
    "level": 77,
    "name": "Trane",
    "requiredCompletedTasks": 1900
  },
  {
    "level": 78,
    "name": "Kuskus",
    "requiredCompletedTasks": 1925
  },
  {
    "level": 79,
    "name": "Fugl Føniks",
    "requiredCompletedTasks": 1950
  },
  {
    "level": 80,
    "name": "Rødrev",
    "requiredCompletedTasks": 1975
  },
  {
    "level": 81,
    "name": "Skjelldyr",
    "requiredCompletedTasks": 2000
  },
  {
    "level": 82,
    "name": "Kongeørn",
    "requiredCompletedTasks": 2025
  },
  {
    "level": 83,
    "name": "Påfugl",
    "requiredCompletedTasks": 2050
  },
  {
    "level": 84,
    "name": "Vaskebjørn",
    "requiredCompletedTasks": 2075
  },
  {
    "level": 85,
    "name": "Børstesvin",
    "requiredCompletedTasks": 2100
  },
  {
    "level": 86,
    "name": "Trekenguru",
    "requiredCompletedTasks": 2125
  },
  {
    "level": 87,
    "name": "Bushhund",
    "requiredCompletedTasks": 2150
  },
  {
    "level": 88,
    "name": "Sjakal",
    "requiredCompletedTasks": 2175
  },
  {
    "level": 89,
    "name": "Albatross",
    "requiredCompletedTasks": 2200
  },
  {
    "level": 90,
    "name": "Pelikan",
    "requiredCompletedTasks": 2225
  },
  {
    "level": 91,
    "name": "Mårbjørn",
    "requiredCompletedTasks": 2250
  },
  {
    "level": 92,
    "name": "Brølape",
    "requiredCompletedTasks": 2275
  },
  {
    "level": 93,
    "name": "Kalkun",
    "requiredCompletedTasks": 2300
  },
  {
    "level": 94,
    "name": "Prærieulv",
    "requiredCompletedTasks": 2325
  },
  {
    "level": 95,
    "name": "Svane",
    "requiredCompletedTasks": 2350
  },
  {
    "level": 96,
    "name": "Honninggrevling",
    "requiredCompletedTasks": 2375
  },
  {
    "level": 97,
    "name": "Serval",
    "requiredCompletedTasks": 2400
  },
  {
    "level": 98,
    "name": "Ocelot",
    "requiredCompletedTasks": 2425
  },
  {
    "level": 99,
    "name": "Andeskondor",
    "requiredCompletedTasks": 2450
  },
  {
    "level": 100,
    "name": "Dingo",
    "requiredCompletedTasks": 2475
  },
  {
    "level": 101,
    "name": "Karakal",
    "requiredCompletedTasks": 2500
  },
  {
    "level": 102,
    "name": "Gelada",
    "requiredCompletedTasks": 2525
  },
  {
    "level": 103,
    "name": "Bever",
    "requiredCompletedTasks": 2550
  },
  {
    "level": 104,
    "name": "Gaupe",
    "requiredCompletedTasks": 2575
  },
  {
    "level": 105,
    "name": "Asiatisk villhund",
    "requiredCompletedTasks": 2600
  },
  {
    "level": 106,
    "name": "Jerv",
    "requiredCompletedTasks": 2625
  },
  {
    "level": 107,
    "name": "Neseape",
    "requiredCompletedTasks": 2650
  },
  {
    "level": 108,
    "name": "Gaselle",
    "requiredCompletedTasks": 2675
  },
  {
    "level": 109,
    "name": "Kinesisk kjempesalamander",
    "requiredCompletedTasks": 2700
  },
  {
    "level": 110,
    "name": "Bavian",
    "requiredCompletedTasks": 2725
  },
  {
    "level": 111,
    "name": "Havoter",
    "requiredCompletedTasks": 2750
  },
  {
    "level": 112,
    "name": "Keiserpingvin",
    "requiredCompletedTasks": 2775
  },
  {
    "level": 113,
    "name": "Mandrill",
    "requiredCompletedTasks": 2800
  },
  {
    "level": 114,
    "name": "Ulv",
    "requiredCompletedTasks": 2825
  },
  {
    "level": 115,
    "name": "Maursluker",
    "requiredCompletedTasks": 2850
  },
  {
    "level": 116,
    "name": "Emu",
    "requiredCompletedTasks": 2875
  },
  {
    "level": 117,
    "name": "Sjimpanse",
    "requiredCompletedTasks": 2900
  },
  {
    "level": 118,
    "name": "Capybara",
    "requiredCompletedTasks": 2925
  },
  {
    "level": 119,
    "name": "Gepard",
    "requiredCompletedTasks": 2950
  },
  {
    "level": 120,
    "name": "Impala",
    "requiredCompletedTasks": 2975
  },
  {
    "level": 121,
    "name": "Gemsbukk",
    "requiredCompletedTasks": 3000
  },
  {
    "level": 122,
    "name": "Vikunja",
    "requiredCompletedTasks": 3025
  },
  {
    "level": 123,
    "name": "Snøleopard",
    "requiredCompletedTasks": 3050
  },
  {
    "level": 124,
    "name": "Leopard",
    "requiredCompletedTasks": 3075
  },
  {
    "level": 125,
    "name": "Hyene",
    "requiredCompletedTasks": 3100
  },
  {
    "level": 126,
    "name": "Aardvark",
    "requiredCompletedTasks": 3125
  },
  {
    "level": 127,
    "name": "Geit",
    "requiredCompletedTasks": 3150
  },
  {
    "level": 128,
    "name": "Nise",
    "requiredCompletedTasks": 3175
  },
  {
    "level": 129,
    "name": "Kasuar",
    "requiredCompletedTasks": 3200
  },
  {
    "level": 130,
    "name": "Puma",
    "requiredCompletedTasks": 3225
  },
  {
    "level": 131,
    "name": "Orangutang",
    "requiredCompletedTasks": 3250
  },
  {
    "level": 132,
    "name": "Sau",
    "requiredCompletedTasks": 3275
  },
  {
    "level": 133,
    "name": "Alpakka",
    "requiredCompletedTasks": 3300
  },
  {
    "level": 134,
    "name": "Fjellgeit",
    "requiredCompletedTasks": 3325
  },
  {
    "level": 135,
    "name": "Vortesvin",
    "requiredCompletedTasks": 3350
  },
  {
    "level": 136,
    "name": "Guanako",
    "requiredCompletedTasks": 3375
  },
  {
    "level": 137,
    "name": "Varulv",
    "requiredCompletedTasks": 3400
  },
  {
    "level": 138,
    "name": "Kjempepanda",
    "requiredCompletedTasks": 3425
  },
  {
    "level": 139,
    "name": "Villsvin",
    "requiredCompletedTasks": 3450
  },
  {
    "level": 140,
    "name": "Sel",
    "requiredCompletedTasks": 3475
  },
  {
    "level": 141,
    "name": "Struts",
    "requiredCompletedTasks": 3500
  },
  {
    "level": 142,
    "name": "Alpesteinbukk",
    "requiredCompletedTasks": 3525
  },
  {
    "level": 143,
    "name": "Gris",
    "requiredCompletedTasks": 3550
  },
  {
    "level": 144,
    "name": "Svartbjørn",
    "requiredCompletedTasks": 3575
  },
  {
    "level": 145,
    "name": "Reinsdyr",
    "requiredCompletedTasks": 3600
  },
  {
    "level": 146,
    "name": "Llama",
    "requiredCompletedTasks": 3625
  },
  {
    "level": 147,
    "name": "Antilope",
    "requiredCompletedTasks": 3650
  },
  {
    "level": 148,
    "name": "Gorilla",
    "requiredCompletedTasks": 3675
  },
  {
    "level": 149,
    "name": "Hjort",
    "requiredCompletedTasks": 3700
  },
  {
    "level": 150,
    "name": "Yeti",
    "requiredCompletedTasks": 3725
  },
  {
    "level": 151,
    "name": "Esel",
    "requiredCompletedTasks": 3750
  },
  {
    "level": 152,
    "name": "Gnu",
    "requiredCompletedTasks": 3775
  },
  {
    "level": 153,
    "name": "Okapi",
    "requiredCompletedTasks": 3800
  },
  {
    "level": 154,
    "name": "Sasquatch",
    "requiredCompletedTasks": 3825
  },
  {
    "level": 155,
    "name": "Griff",
    "requiredCompletedTasks": 3850
  },
  {
    "level": 156,
    "name": "Brunbjørn",
    "requiredCompletedTasks": 3875
  },
  {
    "level": 157,
    "name": "Buskbukk",
    "requiredCompletedTasks": 3900
  },
  {
    "level": 158,
    "name": "Sjøløve",
    "requiredCompletedTasks": 3925
  },
  {
    "level": 159,
    "name": "Takin",
    "requiredCompletedTasks": 3950
  },
  {
    "level": 160,
    "name": "Grizzlybjørn",
    "requiredCompletedTasks": 3975
  },
  {
    "level": 161,
    "name": "Wapiti",
    "requiredCompletedTasks": 4000
  },
  {
    "level": 162,
    "name": "Zebra",
    "requiredCompletedTasks": 4025
  },
  {
    "level": 163,
    "name": "Minotaur",
    "requiredCompletedTasks": 4050
  },
  {
    "level": 164,
    "name": "Hippogriff",
    "requiredCompletedTasks": 4075
  },
  {
    "level": 165,
    "name": "Isbjørn",
    "requiredCompletedTasks": 4100
  },
  {
    "level": 166,
    "name": "Pegasus",
    "requiredCompletedTasks": 4125
  },
  {
    "level": 167,
    "name": "Elg",
    "requiredCompletedTasks": 4150
  },
  {
    "level": 168,
    "name": "Hest",
    "requiredCompletedTasks": 4175
  },
  {
    "level": 169,
    "name": "Yakokse",
    "requiredCompletedTasks": 4200
  },
  {
    "level": 170,
    "name": "Enhjørning",
    "requiredCompletedTasks": 4225
  },
  {
    "level": 171,
    "name": "Kamel",
    "requiredCompletedTasks": 4250
  },
  {
    "level": 172,
    "name": "Eland",
    "requiredCompletedTasks": 4275
  },
  {
    "level": 173,
    "name": "Kodiakbjørn",
    "requiredCompletedTasks": 4300
  },
  {
    "level": 174,
    "name": "Kentaur",
    "requiredCompletedTasks": 4325
  },
  {
    "level": 175,
    "name": "Bison",
    "requiredCompletedTasks": 4350
  },
  {
    "level": 176,
    "name": "Vannbøffel",
    "requiredCompletedTasks": 4375
  },
  {
    "level": 177,
    "name": "Hvalross",
    "requiredCompletedTasks": 4400
  },
  {
    "level": 178,
    "name": "Sjiraff",
    "requiredCompletedTasks": 4425
  },
  {
    "level": 179,
    "name": "Flodhest",
    "requiredCompletedTasks": 4450
  },
  {
    "level": 180,
    "name": "Hvithval",
    "requiredCompletedTasks": 4475
  },
  {
    "level": 181,
    "name": "Narhval",
    "requiredCompletedTasks": 4500
  },
  {
    "level": 182,
    "name": "Halvspekkhogger",
    "requiredCompletedTasks": 4525
  },
  {
    "level": 183,
    "name": "Nesehorn",
    "requiredCompletedTasks": 4550
  },
  {
    "level": 184,
    "name": "Kyklop",
    "requiredCompletedTasks": 4575
  },
  {
    "level": 185,
    "name": "Grindhvaler",
    "requiredCompletedTasks": 4600
  },
  {
    "level": 186,
    "name": "Sjøelefant",
    "requiredCompletedTasks": 4625
  },
  {
    "level": 187,
    "name": "Troll",
    "requiredCompletedTasks": 4650
  },
  {
    "level": 188,
    "name": "Spekkhogger",
    "requiredCompletedTasks": 4675
  },
  {
    "level": 189,
    "name": "Drage",
    "requiredCompletedTasks": 4700
  },
  {
    "level": 190,
    "name": "Elefant",
    "requiredCompletedTasks": 4725
  },
  {
    "level": 191,
    "name": "King Kong",
    "requiredCompletedTasks": 4750
  },
  {
    "level": 192,
    "name": "Nessie",
    "requiredCompletedTasks": 4775
  },
  {
    "level": 193,
    "name": "Knølhval",
    "requiredCompletedTasks": 4800
  },
  {
    "level": 194,
    "name": "Spermhval",
    "requiredCompletedTasks": 4825
  },
  {
    "level": 195,
    "name": "Kraken",
    "requiredCompletedTasks": 4850
  },
  {
    "level": 196,
    "name": "Leviatan",
    "requiredCompletedTasks": 4875
  },
  {
    "level": 197,
    "name": "Finnhval",
    "requiredCompletedTasks": 4900
  },
  {
    "level": 198,
    "name": "Godzilla",
    "requiredCompletedTasks": 4925
  },
  {
    "level": 199,
    "name": "Blåhval",
    "requiredCompletedTasks": 4950
  },
  {
    "level": 200,
    "name": "Midgardsormen",
    "requiredCompletedTasks": 4975
  }
];
let levelDefinitions = [...DEFAULT_LEVEL_DEFINITIONS];

const STORAGE_KEY = "morgenhelt-state-v1";
let state = loadState();
const sessions = createAllSessions();
let timerId = null;
let audioCtx = null;
let activeChildName = null;

const authScreen = document.getElementById("authScreen");
const appShell = document.getElementById("appShell");
const authStatus = document.getElementById("authStatus");
const authEmailInput = document.getElementById("authEmail");
const authPasswordInput = document.getElementById("authPassword");
const authGuestBtn = document.getElementById("authGuest");
const authEmailSignInBtn = document.getElementById("authEmailSignIn");
const authEmailCreateBtn = document.getElementById("authEmailCreate");

const childBoards = document.getElementById("childBoards");
const pointsOverviewEl = document.getElementById("pointsOverview");
const weeklyStatsEl = document.getElementById("weeklyStats");
const addChildBtn = document.getElementById("addChildBtn");
const childNameInput = document.getElementById("newChildName");
const emptyState = document.getElementById("emptyState");

const openSettingsBtn = document.getElementById("openSettings");

const parentDialog = document.getElementById("parentDialog");
const parentSettings = document.getElementById("parentSettings");
const closeSettingsX = document.getElementById("closeSettingsX");
const soundToggle = document.getElementById("soundToggle");
const bonusTasksToggle = document.getElementById("bonusTasksToggle");
const basePoints = document.getElementById("basePoints");
const bonusPoints = document.getElementById("bonusPoints");
const basePlus = document.getElementById("basePlus");
const baseMinus = document.getElementById("baseMinus");
const bonusPlus = document.getElementById("bonusPlus");
const bonusMinus = document.getElementById("bonusMinus");
const basePointsDisplay = document.getElementById("basePointsDisplay");
const bonusPointsDisplay = document.getElementById("bonusPointsDisplay");
const rewardSettingsList = document.getElementById("rewardSettingsList");
const rewardTitleInput = document.getElementById("rewardTitleInput");
const rewardCostInput = document.getElementById("rewardCostInput");
const addRewardBtn = document.getElementById("addRewardBtn");
const settingsLogout = document.getElementById("settingsLogout");

const cloud = createCloudAdapter();

void initApp();

async function initApp() {
  setupAuthUI();
  cloud.init();
  await Promise.all([loadWildcardTasks(), loadAnimalLevels()]);
  renderAll();
  startTimerLoop();
  registerServiceWorker();
}

function createAllSessions() {
  return sanitizeActiveSessions(state.activeSessions, state.children);
}

function createSession(childName) {
  return { childName, startedAt: null, lastTaskAt: null, completedTasks: {}, score: 0 };
}

function sanitizeActiveSessions(rawSessions, childrenSource = state.children) {
  const source = rawSessions && typeof rawSessions === "object" ? rawSessions : {};

  return Object.fromEntries(
    Object.keys(childrenSource).map((childName) => {
      const base = createSession(childName);
      const incoming = source[childName];
      if (!incoming || typeof incoming !== "object") return [childName, base];

      const startedAt = Number(incoming.startedAt);
      const lastTaskAt = Number(incoming.lastTaskAt);
      const score = Number(incoming.score);
      const completedRaw = incoming.completedTasks && typeof incoming.completedTasks === "object" ? incoming.completedTasks : {};
      const completedTasks = {};

      Object.entries(completedRaw).forEach(([idx, details]) => {
        if (!details || typeof details !== "object") return;
        const points = Number(details.points);
        const durationSec = Number(details.durationSec);
        const completedAtMs = Number(details.completedAtMs);
        if (!Number.isFinite(points) || !Number.isFinite(durationSec) || !Number.isFinite(completedAtMs)) return;
        const taskName = typeof details.taskName === "string" ? details.taskName : undefined;
        const isWildcard = !!details.isWildcard;
        completedTasks[idx] = {
          points: Math.max(0, Math.round(points)),
          durationSec: Math.max(1, Math.round(durationSec)),
          completedAtMs: Math.max(0, Math.round(completedAtMs)),
          ...(taskName ? { taskName } : {}),
          ...(isWildcard ? { isWildcard } : {}),
        };
      });

      return [
        childName,
        {
          childName,
          startedAt: Number.isFinite(startedAt) && startedAt > 0 ? Math.round(startedAt) : null,
          lastTaskAt: Number.isFinite(lastTaskAt) && lastTaskAt > 0 ? Math.round(lastTaskAt) : null,
          completedTasks,
          score: Number.isFinite(score) ? Math.max(0, Math.round(score)) : 0,
        },
      ];
    })
  );
}

function syncActiveSessionsIntoState() {
  state.activeSessions = sanitizeActiveSessions(sessions, state.children);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function sanitizeChildren(rawChildren) {
  const source = rawChildren && typeof rawChildren === "object" ? rawChildren : {};

  return Object.fromEntries(
    Object.entries(source).map(([name, info]) => {
      const validInfo = info && typeof info === "object" ? info : {};
      const routines = Array.isArray(validInfo.routines)
        ? validInfo.routines.filter((task) => typeof task === "string" && task.trim()).map((task) => task.trim())
        : [];

      return [
        name,
        {
          age: Number.isFinite(validInfo.age) ? Math.max(0, Math.round(validInfo.age)) : 0,
          routines,
        },
      ];
    })
  );
}

function sanitizeWildcards(rawWildcards, childrenSource = state.children) {
  const source = rawWildcards && typeof rawWildcards === "object" ? rawWildcards : {};

  return Object.fromEntries(
    Object.keys(childrenSource).map((childName) => {
      const entry = source[childName] && typeof source[childName] === "object" ? source[childName] : {};
      return [
        childName,
        {
          dateKey: typeof entry.dateKey === "string" ? entry.dateKey : "",
          taskId: typeof entry.taskId === "string" ? entry.taskId : "",
        },
      ];
    })
  );
}


function sanitizeWildcardCatalog(rawCatalog) {
  if (!Array.isArray(rawCatalog)) return [];

  const seen = new Set();
  const rows = [];
  rawCatalog.forEach((row, index) => {
    const title = typeof row?.title === "string" ? row.title.trim() : "";
    const fromId = typeof row?.id === "string" ? row.id.trim() : "";
    const fallbackId = `wildcard-${index + 1}`;
    const id = (fromId || fallbackId).toLowerCase().replace(/[^a-z0-9-]/g, "-");
    if (!title || !id || seen.has(id)) return;
    seen.add(id);
    rows.push({ id, title });
  });

  return rows;
}

async function fetchJsonCandidates(fileName) {
  const candidates = [
    `./${fileName}`,
    fileName,
    `/${fileName}`,
    new URL(fileName, window.location.href).href,
  ];
  const tried = new Set();

  for (const candidate of candidates) {
    const target = String(candidate || "").trim();
    if (!target || tried.has(target)) continue;
    tried.add(target);
    try {
      const response = await fetch(target, { cache: "no-store" });
      if (!response.ok) continue;
      const payload = await response.json();
      return payload;
    } catch {
      // prøv neste kandidatsti
    }
  }

  if ("caches" in window) {
    for (const candidate of candidates) {
      const target = String(candidate || "").trim();
      if (!target) continue;
      try {
        const cached = await caches.match(target);
        if (!cached || !cached.ok) continue;
        const payload = await cached.json();
        return payload;
      } catch {
        // ignorer og prøv videre
      }
    }
  }

  const embeddedId = fileName === "animal-levels.json" ? "animalLevelsData" : (fileName === "wildcard-tasks.json" ? "wildcardTasksData" : "");
  if (embeddedId) {
    try {
      const embeddedNode = document.getElementById(embeddedId);
      const embeddedText = embeddedNode?.textContent?.trim();
      if (embeddedText) return JSON.parse(embeddedText);
    } catch {
      // fallback til null
    }
  }

  return null;
}

async function loadWildcardTasks() {
  try {
    const payload = await fetchJsonCandidates("wildcard-tasks.json");
    if (!payload) return;
    const nextTasks = sanitizeWildcardCatalog(payload);
    if (!nextTasks.length) return;

    wildcardTasks = nextTasks;
    renderBoards();
  } catch {
    // fallback til innebygde wildcard-oppgaver
  }
}

function sanitizeLevelDefinitions(rawDefinitions) {
  if (!Array.isArray(rawDefinitions)) return [];

  const rows = rawDefinitions
    .map((row) => ({
      level: Number(row?.level),
      name: typeof row?.name === "string" ? row.name.trim() : "",
      requiredCompletedTasks: Number(row?.requiredCompletedTasks),
    }))
    .filter((row) => Number.isFinite(row.level) && row.level > 0 && row.name && Number.isFinite(row.requiredCompletedTasks) && row.requiredCompletedTasks >= 0)
    .map((row) => ({
      level: Math.round(row.level),
      name: row.name,
      requiredCompletedTasks: Math.round(row.requiredCompletedTasks),
    }))
    .sort((a, b) => a.requiredCompletedTasks - b.requiredCompletedTasks || a.level - b.level);

  const dedup = [];
  const seen = new Set();
  rows.forEach((row) => {
    if (seen.has(row.level)) return;
    seen.add(row.level);
    dedup.push(row);
  });
  return dedup;
}

async function loadAnimalLevels() {
  try {
    const payload = await fetchJsonCandidates("animal-levels.json");
    if (!payload) return;
    const nextDefs = sanitizeLevelDefinitions(payload);
    if (!nextDefs.length) return;

    levelDefinitions = nextDefs;
    renderBoards();
  } catch {
    // fallback til innebygde nivådefinisjoner
  }
}

function sanitizeLevelProgress(rawProgress, childrenSource = state.children) {
  const source = rawProgress && typeof rawProgress === "object" ? rawProgress : {};
  return Object.fromEntries(
    Object.keys(childrenSource).map((childName) => {
      const row = source[childName] && typeof source[childName] === "object" ? source[childName] : {};
      const completedTasksTotal = Number(row.completedTasksTotal);
      return [childName, { completedTasksTotal: Number.isFinite(completedTasksTotal) ? Math.max(0, Math.round(completedTasksTotal)) : 0 }];
    })
  );
}

function resolveLevelInfo(completedTasksTotal) {
  const defs = levelDefinitions.length ? levelDefinitions : DEFAULT_LEVEL_DEFINITIONS;
  const total = Math.max(0, Math.round(Number(completedTasksTotal) || 0));

  let current = defs[0];
  let next = null;
  defs.forEach((row, idx) => {
    if (total >= row.requiredCompletedTasks) {
      current = row;
      next = defs[idx + 1] || null;
    }
  });

  const progressPct = next
    ? Math.max(0, Math.min(100, Math.round(((total - current.requiredCompletedTasks) / Math.max(1, next.requiredCompletedTasks - current.requiredCompletedTasks)) * 100)))
    : 100;

  return { current, next, total, progressPct };
}

function ensureChildLevelProgress(childName) {
  if (!state.levelProgress[childName]) {
    state.levelProgress[childName] = { completedTasksTotal: 0 };
  }
  return state.levelProgress[childName];
}

function sanitizeWildcardHistory(rawHistory, childrenSource = state.children) {
  const source = rawHistory && typeof rawHistory === "object" ? rawHistory : {};

  return Object.fromEntries(
    Object.keys(childrenSource).map((childName) => {
      const entries = Array.isArray(source[childName]) ? source[childName] : [];
      return [
        childName,
        entries.filter((taskId) => typeof taskId === "string" && taskId.trim()).slice(-WILDCARD_HISTORY_LIMIT),
      ];
    })
  );
}

function sanitizePointBank(rawBank, childrenSource = state.children) {
  const source = rawBank && typeof rawBank === "object" ? rawBank : {};
  return Object.fromEntries(
    Object.keys(childrenSource).map((childName) => {
      const row = source[childName] && typeof source[childName] === "object" ? source[childName] : {};
      const earnedTotal = Number(row.earnedTotal);
      const spentTotal = Number(row.spentTotal);
      const claimedMilestones = Array.isArray(row.claimedMilestones)
        ? row.claimedMilestones.filter((v) => Number.isFinite(Number(v))).map((v) => Number(v))
        : [];
      return [
        childName,
        {
          earnedTotal: Number.isFinite(earnedTotal) ? Math.max(0, Math.round(earnedTotal)) : 0,
          spentTotal: Number.isFinite(spentTotal) ? Math.max(0, Math.round(spentTotal)) : 0,
          claimedMilestones,
        },
      ];
    })
  );
}

function sanitizeDayStatusOverrides(rawOverrides, childrenSource = state.children) {
  const source = rawOverrides && typeof rawOverrides === "object" ? rawOverrides : {};

  return Object.fromEntries(
    Object.keys(childrenSource).map((childName) => {
      const childRows = source[childName] && typeof source[childName] === "object" ? source[childName] : {};
      const cleanRows = Object.fromEntries(
        Object.entries(childRows)
          .filter(([dateKey]) => /^\d{4}-\d{2}-\d{2}$/.test(dateKey))
          .map(([dateKey, status]) => {
            if (status && typeof status === "object") {
              if (status.sick) return [dateKey, "sick"];
              if (status.holiday) return [dateKey, "holiday"];
              return [dateKey, "normal"];
            }
            if (status === "holiday" || status === "sick") return [dateKey, status];
            return [dateKey, "normal"];
          })
          .filter(([, status]) => status !== "normal")
      );
      return [childName, cleanRows];
    })
  );
}

function sanitizeStreaks(rawStreaks, childrenSource = state.children) {
  const source = rawStreaks && typeof rawStreaks === "object" ? rawStreaks : {};
  return Object.fromEntries(
    Object.keys(childrenSource).map((childName) => {
      const row = source[childName] && typeof source[childName] === "object" ? source[childName] : {};
      const count = Number(row.count);
      return [
        childName,
        {
          count: Number.isFinite(count) ? Math.max(0, Math.round(count)) : 0,
          lastCompletedDate: typeof row.lastCompletedDate === "string" ? row.lastCompletedDate : "",
        },
      ];
    })
  );
}

function sanitizeRewardCatalog(rawCatalog) {
  const source = Array.isArray(rawCatalog) ? rawCatalog : DEFAULT_REWARD_CATALOG;
  return source
    .map((item, index) => {
      const title = typeof item?.title === "string" ? item.title.trim() : "";
      const id = typeof item?.id === "string" && item.id.trim() ? item.id.trim() : `reward-${index + 1}`;
      const cost = Number(item?.cost);
      if (!title || !Number.isFinite(cost) || cost <= 0) return null;
      return { id, title, cost: Math.round(cost) };
    })
    .filter(Boolean);
}

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return structuredClone(DEFAULT_STATE);
    const parsed = JSON.parse(saved);
    return {
      ...structuredClone(DEFAULT_STATE),
      ...parsed,
      scoring: { ...structuredClone(DEFAULT_STATE).scoring, ...parsed.scoring },
      children: sanitizeChildren(parsed.children),
      history: Array.isArray(parsed.history) ? parsed.history : [],
      activeSessions: sanitizeActiveSessions(parsed.activeSessions, sanitizeChildren(parsed.children)),
      wildcards: sanitizeWildcards(parsed.wildcards, sanitizeChildren(parsed.children)),
      wildcardHistory: sanitizeWildcardHistory(parsed.wildcardHistory, sanitizeChildren(parsed.children)),
      dayStatusOverrides: sanitizeDayStatusOverrides(parsed.dayStatusOverrides, sanitizeChildren(parsed.children)),
      streaks: sanitizeStreaks(parsed.streaks, sanitizeChildren(parsed.children)),
      pointBank: sanitizePointBank(parsed.pointBank, sanitizeChildren(parsed.children)),
      levelProgress: sanitizeLevelProgress(parsed.levelProgress, sanitizeChildren(parsed.children)),
      rewardCatalog: sanitizeRewardCatalog(parsed.rewardCatalog),
      rewardRedemptions: Array.isArray(parsed.rewardRedemptions) ? parsed.rewardRedemptions : [],
      meta: { updatedAt: Number(parsed?.meta?.updatedAt) || 0 },
    };
  } catch {
    return structuredClone(DEFAULT_STATE);
  }
}

function saveState() {
  syncActiveSessionsIntoState();
  state.meta = { updatedAt: Date.now() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  cloud.pushState(structuredClone(state));
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {});
  });
}

function renderAll() {
  renderBoards();
  renderPointsOverview();
  renderStats();
}



function renderBoards() {
  childBoards.innerHTML = "";
  const names = Object.keys(state.children);
  if (!names.length) {
    activeChildName = null;
    document.body.classList.add("setup-only");
    emptyState.hidden = true;
    renderHeroShell(0, 0);
    return;
  }
  document.body.classList.remove("setup-only");
  emptyState.hidden = true;

  if (activeChildName && !state.children[activeChildName]) activeChildName = null;

  let wildcardStateChanged = false;
  const familyProgress = names.reduce((sum, name) => {
    const info = state.children[name];
    const session = sessions[name] || createSession(name);
    sessions[name] = session;
    const todayKey = getLocalDateKey();
    const requiredCount = getRequiredRoutineCount(info.routines.length, getEffectiveDayMode(todayKey, getChildDayOverride(name, todayKey)));
    const doneCount = countRoutineCompletions(session);
    return sum + (requiredCount ? Math.min(1, doneCount / requiredCount) : 1);
  }, 0);
  renderHeroShell(names.length, Math.round((familyProgress / Math.max(1, names.length)) * 100));

  if (!activeChildName) {
    renderHomeScreen(names);
    return;
  }

  const name = activeChildName;
  const info = state.children[name];
  const session = sessions[name] || createSession(name);
  sessions[name] = session;
  const doneCount = countRoutineCompletions(session);
  const total = info.routines.length;
  const todayKey = getLocalDateKey();
  const manualStatus = getChildDayOverride(name, todayKey);
  const effectiveMode = getEffectiveDayMode(todayKey, manualStatus);
  const requiredCount = getRequiredRoutineCount(total, effectiveMode);
  const streak = ensureChildStreak(name);
  const account = ensureChildPointAccount(name);
  const started = !!session.startedAt;
  const progress = requiredCount ? Math.min(100, Math.round((doneCount / requiredCount) * 100)) : 100;
  const wildcardEnabled = state.bonusTasksEnabled !== false;
  const wildcardState = wildcardEnabled ? getOrAssignDailyWildcard(name) : null;
  if (wildcardState?.didAssign) wildcardStateChanged = true;
  const wildcardTask = wildcardState?.task || null;
  const wildcardTaskKey = wildcardState ? `wildcard:${wildcardState.dateKey}` : null;
  const wildcardDone = wildcardTaskKey ? !!session.completedTasks[wildcardTaskKey] : false;
  const levelProgress = ensureChildLevelProgress(name);
  const levelInfo = resolveLevelInfo(levelProgress.completedTasksTotal);
  const levelCode = String(levelInfo.current.level).padStart(3, "0");

  const board = document.createElement("section");
  board.className = "child-board child-board--quest";
  board.innerHTML = `
    <div class="quest-nav">
      <button class="ghost-btn back-home-btn" type="button" aria-label="Tilbake til familien">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
        Familie
      </button>
      <button class="ghost-btn remove-child-btn" type="button" aria-label="Fjern barn">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>
      </button>
    </div>
    <div class="hero-card child-hero-card">
      <div class="avatar-stage">
        <div class="avatar-glow"></div>
        <img class="child-level-animal" src="./icons/levels/level-${levelCode}.png" alt="${escapeHtml(levelInfo.current.name)}" width="300" height="300" hidden />
        <div class="avatar-fallback" aria-hidden="true"><span></span></div>
      </div>
      <div class="child-title-block">
        <p class="eyebrow">Dagens heltereise</p>
        <h3>${escapeHtml(name)}</h3>
        <p class="child-level-name">${escapeHtml(levelInfo.current.name)}</p>
      </div>
      <div class="stat-pills" aria-label="Heltestatus">
        <span class="stat-pill"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3c3 3 5 5.5 5 9a5 5 0 0 1-10 0c0-3.5 2-6 5-9Z" /></svg>${streak.count} rekke</span>
        <span class="stat-pill"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.2l-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" /></svg>${account.earnedTotal} HP</span>
        <span class="stat-pill"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 6v6l4 2" /><circle cx="12" cy="12" r="9" /></svg>${formatElapsed(session.startedAt)}</span>
      </div>
      <div class="xp-panel">
        <div class="xp-label"><span>XP mot nivå ${levelInfo.next ? levelInfo.next.level : levelInfo.current.level}</span><strong>${levelInfo.progressPct}%</strong></div>
        <div class="child-level-progress" aria-label="XP mot neste nivå"><div class="child-level-progress-bar" style="width:${levelInfo.progressPct}%"></div></div>
        <p class="child-level-progress-text">${levelInfo.next ? `${levelInfo.total}/${levelInfo.next.requiredCompletedTasks} XP til neste dyr` : "Legendarisk makslevel"}</p>
      </div>
    </div>
    <section class="quest-controls" aria-label="Morgenstyring">
      <div class="day-status-row">
        <div class="day-status-control" role="radiogroup" aria-label="Dagens status">
          <button class="day-status-step ${manualStatus === "holiday" ? "active" : ""}" type="button" data-status="holiday" role="radio" aria-checked="${manualStatus === "holiday"}"></button>
          <button class="day-status-step ${manualStatus === "normal" ? "active" : ""}" type="button" data-status="normal" role="radio" aria-checked="${manualStatus === "normal"}"></button>
          <button class="day-status-step ${manualStatus === "sick" ? "active" : ""}" type="button" data-status="sick" role="radio" aria-checked="${manualStatus === "sick"}"></button>
        </div>
        <div class="day-status-labels"><span>Fri</span><span>Vanlig</span><span>Syk</span></div>
      </div>
      <p class="day-mode-note"></p>
      <div class="morning-progress-card">
        <div class="xp-label"><span>Dagens progresjon</span><strong>${requiredCount ? `${doneCount}/${requiredCount}` : "Fri"}</strong></div>
        <div class="progress-wrap"><div class="progress-bar" style="width:${progress}%"></div></div>
      </div>
      <div class="actions">
        <button class="primary start-btn" ${started ? "disabled" : ""}>Start eventyret</button>
        <button class="secondary finish-btn" ${!started ? "disabled" : ""}>Fullfør morgen</button>
      </div>
    </section>
    <section class="quest-section">
      <div class="section-heading"><p class="eyebrow">Oppdrag</p><h4>Dagens helteoppgaver</h4></div>
      <div class="task-grid"></div>
    </section>
  `;

  const levelAnimalImage = board.querySelector(".child-level-animal");
  const fallback = board.querySelector(".avatar-fallback");
  if (levelAnimalImage) {
    levelAnimalImage.onerror = () => {
      levelAnimalImage.hidden = true;
      if (fallback) fallback.hidden = false;
    };
    levelAnimalImage.onload = () => {
      levelAnimalImage.hidden = false;
      if (fallback) fallback.hidden = true;
    };
  }

  const dayModeNote = board.querySelector(".day-mode-note");
  if (dayModeNote) {
    if (effectiveMode.includes("_holiday")) {
      dayModeNote.textContent = "I dag er det fridag i eventyrboken.";
    } else if (effectiveMode.includes("weekend") && effectiveMode.includes("_sick")) {
      dayModeNote.textContent = "Rolig helgedag – små heltedåd teller ekstra.";
    } else if (effectiveMode.includes("_sick")) {
      dayModeNote.textContent = "Rolig dag: halvparten av oppdragene holder.";
    } else {
      dayModeNote.textContent = "";
    }
  }

  board.querySelector(".back-home-btn")?.addEventListener("click", () => {
    activeChildName = null;
    renderAll();
  });
  board.querySelectorAll(".day-status-step").forEach((stepBtn) => {
    stepBtn.addEventListener("click", () => setChildDayStatusForToday(name, stepBtn.dataset.status));
  });
  board.querySelector(".start-btn")?.addEventListener("click", () => startMorning(name));
  board.querySelector(".finish-btn")?.addEventListener("click", () => abortMorning(name));
  board.querySelector(".remove-child-btn")?.addEventListener("click", () => removeChild(name));

  const taskGrid = board.querySelector(".task-grid");
  info.routines.forEach((task, idx) => {
    const details = session.completedTasks[idx];
    const done = !!details;
    const taskItem = document.createElement("article");
    taskItem.className = `task-item quest-task ${done ? "quest-task--done" : ""}`;
    taskItem.innerHTML = `
      <button class="task-btn" type="button" ${!started || effectiveMode.includes("_holiday") ? "disabled" : ""}>
        <span class="task-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12.5 9.5 17 19 7" /></svg></span>
        <span class="task-text">${escapeHtml(task)}</span>
        <small>${done ? `${formatDuration(details.durationSec)} · +${details.points} HP` : `+${state.scoring.basePoints} HP`}</small>
      </button>
      <button class="icon-btn remove-task-btn" type="button" aria-label="Fjern oppgave"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg></button>
    `;
    taskItem.querySelector(".task-btn")?.addEventListener("click", () => toggleTask(name, idx));
    taskItem.querySelector(".remove-task-btn")?.addEventListener("click", () => removeTask(name, idx));
    taskGrid.appendChild(taskItem);
  });

  const addTaskBtn = document.createElement("button");
  addTaskBtn.className = "task-btn add-task-btn quest-add-task";
  addTaskBtn.type = "button";
  addTaskBtn.innerHTML = '<span class="task-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg></span><span class="task-text">Nytt oppdrag</span><small>Legg til</small>';
  addTaskBtn.addEventListener("click", () => addTask(name));
  taskGrid.appendChild(addTaskBtn);

  if (wildcardEnabled && wildcardTask && wildcardTaskKey && !effectiveMode.includes("_holiday")) {
    const bonus = document.createElement("section");
    bonus.className = `bonus-card ${wildcardDone ? "bonus-card--done" : ""}`;
    bonus.innerHTML = `
      <div><p class="eyebrow">Dagens utfordring</p><h4>${escapeHtml(wildcardTask.title)}</h4><p>${wildcardDone ? `Fullført · +${session.completedTasks[wildcardTaskKey].points} HP` : "Et ekstra lite eventyr for bonuspoeng."}</p></div>
      <button class="primary wildcard-btn" type="button" ${!started ? "disabled" : ""}>${wildcardDone ? "Angre" : "Fullfør"}</button>
    `;
    bonus.querySelector(".wildcard-btn")?.addEventListener("click", () => toggleWildcardTask(name));
    board.appendChild(bonus);
  }

  childBoards.appendChild(board);
  if (wildcardStateChanged) saveState();
}

function renderHeroShell(childCount, progressPct) {
  const heroTitle = document.getElementById("heroTitle");
  const heroSubtitle = document.getElementById("heroSubtitle");
  const heroProgress = document.getElementById("heroProgress");
  if (heroTitle) heroTitle.textContent = activeChildName ? "Heltereisen er i gang" : "God morgen";
  if (heroSubtitle) heroSubtitle.textContent = activeChildName ? "Fullfør dagens oppdrag og fyll XP-baren." : `${childCount || "Ingen"} helter klare for dagens eventyr.`;
  if (heroProgress) heroProgress.style.width = `${Math.max(0, Math.min(100, progressPct || 0))}%`;
}

function renderHomeScreen(names) {
  const shell = document.createElement("section");
  shell.className = "home-screen";
  shell.innerHTML = `
    <div class="home-heading">
      <p class="eyebrow">Velg helt</p>
      <h2>Hvem starter eventyret?</h2>
    </div>
    <div class="hero-selector-grid"></div>
  `;
  const grid = shell.querySelector(".hero-selector-grid");
  names.forEach((name) => {
    const info = state.children[name];
    const session = sessions[name] || createSession(name);
    sessions[name] = session;
    const streak = ensureChildStreak(name);
    const account = ensureChildPointAccount(name);
    const levelInfo = resolveLevelInfo(ensureChildLevelProgress(name).completedTasksTotal);
    const todayKey = getLocalDateKey();
    const required = getRequiredRoutineCount(info.routines.length, getEffectiveDayMode(todayKey, getChildDayOverride(name, todayKey)));
    const done = countRoutineCompletions(session);
    const pct = required ? Math.min(100, Math.round((done / required) * 100)) : 100;
    const levelCode = String(levelInfo.current.level).padStart(3, "0");
    const card = document.createElement("article");
    card.className = "hero-select-card";
    card.innerHTML = `
      <button class="hero-select-main" type="button">
        <img src="./icons/levels/level-${levelCode}.png" alt="" width="120" height="120" onerror="this.hidden=true" />
        <span class="hero-select-name">${escapeHtml(name)}</span>
        <span class="hero-select-level">${escapeHtml(levelInfo.current.name)}</span>
        <span class="mini-progress"><span style="width:${pct}%"></span></span>
        <span class="hero-select-meta">${streak.count} rekke · ${account.earnedTotal} HP</span>
      </button>
    `;
    card.querySelector(".hero-select-main")?.addEventListener("click", () => {
      activeChildName = name;
      renderAll();
    });
    grid.appendChild(card);
  });
  childBoards.appendChild(shell);
}

function ensureChildPointAccount(childName) {
  if (!state.pointBank[childName]) {
    state.pointBank[childName] = { earnedTotal: 0, spentTotal: 0, claimedMilestones: [] };
  }
  return state.pointBank[childName];
}

function getSpendablePoints(childName) {
  const account = ensureChildPointAccount(childName);
  return Math.max(0, account.earnedTotal - account.spentTotal);
}

function renderPointsOverview() {
  if (!pointsOverviewEl) return;
  pointsOverviewEl.innerHTML = "";

  Object.keys(state.children).forEach((childName) => {
    const account = ensureChildPointAccount(childName);
    const availablePoints = getSpendablePoints(childName);
    const rewards = state.rewardCatalog.slice().sort((a, b) => a.cost - b.cost);

    const rewardItems = rewards.length
      ? rewards
          .map((reward) => {
            const pct = Math.max(0, Math.min(100, Math.round((availablePoints / Math.max(1, reward.cost)) * 100)));
            return `
              <article class="reward-choice" data-child="${escapeHtml(childName)}" data-reward-id="${escapeHtml(reward.id)}">
                <div class="reward-ring" style="--progress:${pct}%">
                  <span>${availablePoints}/${reward.cost}</span>
                </div>
                <h5>${escapeHtml(reward.title)}</h5>
                <button class="reward-claim-btn ${availablePoints < reward.cost ? "reward-claim-btn--hidden" : ""}" type="button" data-child="${escapeHtml(childName)}" data-reward-id="${escapeHtml(reward.id)}" ${availablePoints < reward.cost ? "disabled aria-hidden='true'" : ""}>Få premie</button>
              </article>
            `;
          })
          .join("")
      : '<p class="note">Ingen premier definert ennå. Legg til premier i Innstillinger.</p>';

    const redemptionItems = state.rewardRedemptions
      .filter((entry) => entry.childName === childName)
      .slice(0, 6)
      .map(
        (entry) =>
          `<li>${escapeHtml(entry.rewardTitle)} <span class="reward-history-cost">−${Number(entry.cost) || 0} poeng</span></li>`
      )
      .join("");

    const card = document.createElement("article");
    card.className = "points-card";
    card.innerHTML = `
      <div class="points-header">
        <h4>${escapeHtml(childName)}</h4>
        <p>Totalpoeng: <strong>${account.earnedTotal}</strong> · Tilgjengelig: <strong>${availablePoints}</strong></p>
      </div>
      <div class="reward-menu reward-menu-rings">${rewardItems}</div>
      <section class="reward-history">
        <h5>Valgte premier</h5>
        <ul>${redemptionItems || '<li class="note">Ingen premier innløst ennå.</li>'}</ul>
      </section>
    `;

    card.querySelectorAll(".reward-claim-btn").forEach((button) => {
      button.addEventListener("click", () => redeemReward(childName, button.dataset.rewardId));
    });

    pointsOverviewEl.appendChild(card);
  });
}

function getPendingChildName() {
  const fromInput = childNameInput?.value?.trim();
  if (fromInput) return fromInput;
  const fromPrompt = prompt("Navn på barn:");
  return fromPrompt ? fromPrompt.trim() : "";
}

function addChild() {
  const childName = getPendingChildName();
  if (!childName) return;
  if (state.children[childName]) {
    alert("Barn med dette navnet finnes allerede.");
    return;
  }
  state.children[childName] = { age: 0, routines: [] };
  sessions[childName] = createSession(childName);
  ensureChildPointAccount(childName);
  ensureChildLevelProgress(childName);
  if (childNameInput) childNameInput.value = "";
  saveState();
  renderAll();
}

function removeChild(childName) {
  if (!confirm(`Fjerne ${childName} og all historikk?`)) return;
  delete state.children[childName];
  delete sessions[childName];
  delete state.wildcards[childName];
  delete state.wildcardHistory[childName];
  delete state.dayStatusOverrides[childName];
  delete state.streaks[childName];
  delete state.pointBank[childName];
  delete state.levelProgress[childName];
  state.history = state.history.filter((entry) => entry.childName !== childName);
  saveState();
  renderAll();
}

function addTask(childName) {
  const title = prompt(`Ny oppgave for ${childName}:`);
  if (!title) return;
  const trimmed = title.trim();
  if (!trimmed) return;
  state.children[childName].routines.push(trimmed);
  saveState();
  renderAll();
}

function removeTask(childName, taskIndex) {
  const taskName = state.children[childName].routines[taskIndex];
  if (!confirm(`Fjern oppgaven "${taskName}"?`)) return;

  state.children[childName].routines.splice(taskIndex, 1);
  const session = sessions[childName];
  if (session && session.startedAt) {
    const nextCompletedTasks = {};
    Object.entries(session.completedTasks || {}).forEach(([key, details]) => {
      const numericKey = Number(key);
      if (!Number.isInteger(numericKey)) {
        nextCompletedTasks[key] = details;
        return;
      }
      if (numericKey === taskIndex) return;
      const shiftedKey = numericKey > taskIndex ? numericKey - 1 : numericKey;
      nextCompletedTasks[String(shiftedKey)] = details;
    });
    session.completedTasks = nextCompletedTasks;
    session.score = Object.values(nextCompletedTasks).reduce((sum, entry) => sum + (Number(entry?.points) || 0), 0);
    const remaining = Object.values(nextCompletedTasks).filter(Boolean);
    session.lastTaskAt = remaining.length ? Math.max(...remaining.map((item) => Number(item.completedAtMs) || 0)) : session.startedAt;
  } else {
    sessions[childName] = createSession(childName);
  }
  state.history = state.history.map((entry) => {
    if (entry.childName !== childName) return entry;
    return {
      ...entry,
      taskEntries: (entry.taskEntries || []).filter((t) => t.taskName !== taskName),
    };
  });
  saveState();
  renderAll();
}

function startMorning(childName) {
  sessions[childName] = createSession(childName);
  sessions[childName].startedAt = Date.now();
  sessions[childName].lastTaskAt = sessions[childName].startedAt;
  saveState();
  renderBoards();
}

function toggleTask(childName, taskIndex) {
  const session = sessions[childName];
  if (!session.startedAt) return;

  const current = session.completedTasks[taskIndex];
  if (!current) {
    const taskName = state.children[childName].routines[taskIndex] || `Oppgave ${Number(taskIndex) + 1}`;
    completeTask(childName, session, taskIndex, { taskName });

    if (state.soundEnabled) playTaskSound();
  } else {
    delete session.completedTasks[taskIndex];
    session.score -= current.points;

    const remaining = Object.values(session.completedTasks).filter(Boolean);
    session.lastTaskAt = remaining.length ? Math.max(...remaining.map((item) => item.completedAtMs)) : session.startedAt;
  }

  const total = state.children[childName].routines.length;
  const todayKey = getLocalDateKey();
  const effectiveMode = getEffectiveDayMode(todayKey, getChildDayOverride(childName, todayKey));
  const requiredCount = getRequiredRoutineCount(total, effectiveMode);
  const doneCount = countRoutineCompletions(session);
  if (requiredCount > 0 && doneCount >= requiredCount) {
    finishMorning(childName, true);
    return;
  }

  saveState();
  renderBoards();
}

function toggleWildcardTask(childName) {
  const session = sessions[childName];
  if (!session?.startedAt || state.bonusTasksEnabled === false) return;

  const wildcardState = getOrAssignDailyWildcard(childName);
  const wildcardTaskKey = `wildcard:${wildcardState.dateKey}`;
  const current = session.completedTasks[wildcardTaskKey];

  if (!current) {
    completeTask(childName, session, wildcardTaskKey, {
      taskName: `Wildcard: ${wildcardState.task.title}`,
      isWildcard: true,
    });
    if (state.soundEnabled) playTaskSound();
  } else {
    delete session.completedTasks[wildcardTaskKey];
    session.score -= current.points;
  }

  const remaining = Object.values(session.completedTasks).filter(Boolean);
  session.lastTaskAt = remaining.length ? Math.max(...remaining.map((item) => item.completedAtMs)) : session.startedAt;

  saveState();
  renderBoards();
}

function getAverageDurationForTask(childName, taskName) {
  const entries = state.history.filter((entry) => entry.childName === childName);
  const samples = [];
  entries.forEach((entry) => {
    (entry.taskEntries || []).forEach((task) => {
      if (task.taskName === taskName && !task.isWildcard && Number.isFinite(task.durationSec)) {
        samples.push(task.durationSec);
      }
    });
  });
  if (!samples.length) return null;
  return Math.round(samples.reduce((sum, sec) => sum + sec, 0) / samples.length);
}

function completeTask(childName, session, taskKey, extra = {}) {
  const now = Date.now();
  const segmentStart = session.lastTaskAt || session.startedAt;
  const elapsedSec = Math.max(1, Math.round((now - segmentStart) / 1000));

  const speedFactor = Math.max(0, 1 - elapsedSec / 480);
  const bonus = Math.round(state.scoring.maxBonus * speedFactor);
  const avgSec = extra.taskName && !extra.isWildcard ? getAverageDurationForTask(childName, extra.taskName) : null;
  const efficiencyFactor = avgSec && elapsedSec < avgSec ? (avgSec - elapsedSec) / Math.max(1, avgSec) : 0;
  const efficiencyBonus = Math.round(state.scoring.maxBonus * efficiencyFactor);
  const points = Math.max(state.scoring.basePoints, state.scoring.basePoints + bonus + efficiencyBonus);

  session.completedTasks[taskKey] = { points, durationSec: elapsedSec, completedAtMs: now, ...extra };
  session.score += points;
  session.lastTaskAt = now;
}

function countRoutineCompletions(session) {
  return Object.keys(session.completedTasks).filter((key) => Number.isInteger(Number(key))).length;
}

function celebrateMilestonesIfNeeded(childName, previousTotal, nextTotal) {
  const account = ensureChildPointAccount(childName);
  const reached = POINT_MILESTONES.filter((point) => previousTotal < point && nextTotal >= point && !account.claimedMilestones.includes(point));
  if (!reached.length) return;
  account.claimedMilestones = [...account.claimedMilestones, ...reached].sort((a, b) => a - b);
  alert(`🎉 ${childName} nådde milepæl: ${reached.join(", ")} poeng!`);
}

function redeemReward(childName, rewardId) {
  const reward = state.rewardCatalog.find((item) => item.id === rewardId);
  if (!reward) return;

  const available = getSpendablePoints(childName);
  if (available < reward.cost) return;
  if (!confirm(`${childName} vil løse inn "${reward.title}" for ${reward.cost} poeng. Fortsette?`)) return;

  const account = ensureChildPointAccount(childName);
  account.spentTotal += reward.cost;
  state.rewardRedemptions = [
    { childName, rewardId: reward.id, rewardTitle: reward.title, cost: reward.cost, redeemedAt: new Date().toISOString() },
    ...state.rewardRedemptions,
  ].slice(0, 200);

  saveState();
  renderPointsOverview();
}


function abortMorning(childName) {
  const session = sessions[childName];
  if (!session?.startedAt) return;

  const total = state.children[childName].routines.length;
  const todayKey = getLocalDateKey();
  const effectiveMode = getEffectiveDayMode(todayKey, getChildDayOverride(childName, todayKey));
  const requiredCount = getRequiredRoutineCount(total, effectiveMode);
  const doneCount = countRoutineCompletions(session);

  if (requiredCount > 0 && doneCount < requiredCount) {
    const streak = ensureChildStreak(childName);
    streak.count = 0;
    streak.lastCompletedDate = "";
  }

  if (session.score > 0) {
    const account = ensureChildPointAccount(childName);
    const previousTotal = account.earnedTotal;
    account.earnedTotal += session.score;
    celebrateMilestonesIfNeeded(childName, previousTotal, account.earnedTotal);
  }

  sessions[childName] = createSession(childName);
  saveState();
  renderAll();
}

function finishMorning(childName, automatic = false) {
  const session = sessions[childName];
  const routines = state.children[childName].routines;
  const total = routines.length;
  const todayKey = getLocalDateKey();
  const effectiveMode = getEffectiveDayMode(todayKey, getChildDayOverride(childName, todayKey));
  const requiredCount = getRequiredRoutineCount(total, effectiveMode);
  const doneCount = countRoutineCompletions(session);
  if (!session.startedAt || requiredCount === 0 || doneCount < requiredCount) return;

  const finishedAt = Date.now();
  session.score += 20;
  session.score += getDayModeBonus(effectiveMode);
  const account = ensureChildPointAccount(childName);
  const previousTotal = account.earnedTotal;
  account.earnedTotal += session.score;
  celebrateMilestonesIfNeeded(childName, previousTotal, account.earnedTotal);

  const levelProgress = ensureChildLevelProgress(childName);
  const taskCompletionCount = Object.values(session.completedTasks).filter(Boolean).length;
  levelProgress.completedTasksTotal += taskCompletionCount;
  updateChildStreakOnCompletion(childName, todayKey);

  const taskEntries = Object.entries(session.completedTasks).map(([idx, details]) => {
    const taskName = Number.isInteger(Number(idx))
      ? routines[Number(idx)] || `Oppgave ${Number(idx) + 1}`
      : details.taskName || "Bonusoppgave";
    return {
      taskName,
      durationSec: details.durationSec,
      points: details.points,
      isWildcard: !!details.isWildcard,
    };
  });

  state.history = [
    {
      childName,
      score: session.score,
      durationSec: Math.round((finishedAt - session.startedAt) / 1000),
      completedAt: new Date(finishedAt).toISOString(),
      taskEntries,
    },
    ...state.history,
  ].slice(0, 100);

  if (state.soundEnabled) playCompletionJingle();
  alert(`${automatic ? "Alle oppgavene er fullført!" : "Bra jobbet!"}\n${childName} fikk ${session.score} poeng.`);
  sessions[childName] = createSession(childName);
  saveState();
  renderAll();
}

function renderStats() {
  weeklyStatsEl.innerHTML = "";

  Object.keys(state.children).forEach((name) => {
    const entries = state.history.filter((h) => h.childName === name);

    const taskMap = new Map();
    state.children[name].routines.forEach((task) => {
      taskMap.set(task, { totalSec: 0, count: 0 });
    });

    entries.forEach((entry) => {
      (entry.taskEntries || []).forEach((t) => {
        if (t?.isWildcard) return;
        if (!taskMap.has(t.taskName)) taskMap.set(t.taskName, { totalSec: 0, count: 0 });
        const row = taskMap.get(t.taskName);
        row.totalSec += t.durationSec;
        row.count += 1;
      });
    });

    const averages = Array.from(taskMap.entries()).map(([task, data]) => ({
      task,
      avgSec: data.count ? Math.round(data.totalSec / data.count) : 0,
    }));
    const maxAvg = Math.max(1, ...averages.map((x) => x.avgSec));

    const graphBars = averages
      .map((row) => `
        <div class="graph-row">
          <span class="graph-label">${escapeHtml(row.task)}</span>
          <div class="graph-track"><div class="graph-fill" style="width:${Math.max(3, Math.round((row.avgSec / maxAvg) * 100))}%"></div></div>
          <span class="graph-value">${row.avgSec ? formatDuration(row.avgSec) : "-"}</span>
        </div>
      `)
      .join("");

    const card = document.createElement("div");
    card.className = "stat-card stat-card-extended";
    card.innerHTML = `
      <h4>${escapeHtml(name)}</h4>
      <h5>Tid per oppgave (snitt)</h5>
      <div class="graph-list">${graphBars || '<p class="note">Ingen oppgaver ennå.</p>'}</div>
    `;
    weeklyStatsEl.appendChild(card);
  });
}

function startTimerLoop() {
  timerId = setInterval(renderBoards, 1000);
}

function formatElapsed(startedAt) {
  if (!startedAt) return "00:00";
  const totalSec = Math.floor((Date.now() - startedAt) / 1000);
  return formatDuration(totalSec);
}

function formatDuration(totalSec) {
  const min = String(Math.floor(totalSec / 60)).padStart(2, "0");
  const sec = String(totalSec % 60).padStart(2, "0");
  return `${min}:${sec}`;
}

function getLocalDateKey(ts = Date.now()) {
  const date = new Date(ts);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function dateKeyToDate(dateKey) {
  const [y, m, d] = String(dateKey).split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

function getBaseDayType(dateKey) {
  const day = dateKeyToDate(dateKey).getDay();
  return day === 0 || day === 6 ? "weekend" : "weekday";
}

function getChildDayOverride(childName, dateKey) {
  const status = state.dayStatusOverrides?.[childName]?.[dateKey];
  return status === "holiday" || status === "sick" ? status : "normal";
}

function getEffectiveDayMode(dateKey, manualStatus) {
  const base = getBaseDayType(dateKey);
  return `${base}_${manualStatus || "normal"}`;
}

function getRequiredRoutineCount(totalRoutines, effectiveMode) {
  if (effectiveMode.includes("_holiday")) return 0;
  if (effectiveMode.includes("_sick")) return Math.max(1, Math.ceil(totalRoutines * 0.5));
  if (effectiveMode === "weekend_normal") return Math.max(1, Math.ceil(totalRoutines * 0.7));
  return totalRoutines;
}

function getDayModeBonus(effectiveMode) {
  if (effectiveMode.includes("weekend") && effectiveMode.includes("_sick")) return DAY_BONUSES.weekendSickBonus;
  if (effectiveMode.includes("_sick")) return DAY_BONUSES.sickBonus;
  return 0;
}

function ensureChildStreak(childName) {
  if (!state.streaks[childName]) state.streaks[childName] = { count: 0, lastCompletedDate: "" };
  return state.streaks[childName];
}

function nextDateKey(dateKey) {
  const date = dateKeyToDate(dateKey);
  date.setDate(date.getDate() + 1);
  return getLocalDateKey(date.getTime());
}

function dayIsProtectedForStreak(childName, dateKey) {
  const manual = getChildDayOverride(childName, dateKey);
  return manual === "holiday" || manual === "sick";
}

function canBridgeStreak(childName, fromDateKey, toDateKey) {
  let cursor = nextDateKey(fromDateKey);
  while (cursor < toDateKey) {
    if (!dayIsProtectedForStreak(childName, cursor)) return false;
    cursor = nextDateKey(cursor);
  }
  return true;
}

function updateChildStreakOnCompletion(childName, completionDateKey) {
  const streak = ensureChildStreak(childName);
  if (!streak.lastCompletedDate) {
    streak.count = 1;
    streak.lastCompletedDate = completionDateKey;
    return;
  }

  const expectedNext = nextDateKey(streak.lastCompletedDate);
  if (completionDateKey === streak.lastCompletedDate) return;

  if (completionDateKey === expectedNext || canBridgeStreak(childName, streak.lastCompletedDate, completionDateKey)) {
    streak.count += 1;
  } else {
    streak.count = 1;
  }
  streak.lastCompletedDate = completionDateKey;
}

function setChildDayStatusForToday(childName, status) {
  const dateKey = getLocalDateKey();
  if (!state.dayStatusOverrides[childName]) state.dayStatusOverrides[childName] = {};

  if (status === "normal") {
    delete state.dayStatusOverrides[childName][dateKey];
  } else {
    state.dayStatusOverrides[childName][dateKey] = status;
  }

  saveState();
  renderBoards();
}

function getUsedWildcardIdsForDate(dateKey, excludeChildName) {
  return new Set(
    Object.entries(state.wildcards || {})
      .filter(([name, row]) => name !== excludeChildName && row?.dateKey === dateKey && row?.taskId)
      .map(([, row]) => row.taskId)
  );
}

function pickWildcardTask(childName, dateKey, usedToday = new Set()) {
  const recent = state.wildcardHistory[childName] || [];
  const recentSet = new Set(recent.slice(-WILDCARD_REPEAT_GUARD));
  const catalog = wildcardTasks.length ? wildcardTasks : DEFAULT_WILDCARD_TASKS;

  const unusedToday = catalog.filter((task) => !usedToday.has(task.id));
  const candidates = unusedToday.filter((task) => !recentSet.has(task.id));
  const pool = candidates.length ? candidates : (unusedToday.length ? unusedToday : catalog);

  const seed = `${childName}:${dateKey}`;
  const hash = seed.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return pool[hash % pool.length];
}

function getOrAssignDailyWildcard(childName) {
  const dateKey = WILDCARD_REFRESH_KEY;
  const usedToday = getUsedWildcardIdsForDate(dateKey, childName);
  const existing = state.wildcards[childName];

  if (existing?.dateKey === dateKey && existing.taskId) {
    const conflict = usedToday.has(existing.taskId);
    if (!conflict || (wildcardTasks.length || DEFAULT_WILDCARD_TASKS.length) <= 1) {
      const match = wildcardTasks.find((task) => task.id === existing.taskId) || wildcardTasks[0] || DEFAULT_WILDCARD_TASKS[0];
      return { task: match, dateKey, didAssign: false };
    }
  }

  const task = pickWildcardTask(childName, dateKey, usedToday);
  state.wildcards[childName] = { dateKey, taskId: task.id };
  const history = state.wildcardHistory[childName] || [];
  state.wildcardHistory[childName] = [...history, task.id].slice(-WILDCARD_HISTORY_LIMIT);
  return { task, dateKey, didAssign: true };
}

function createAudioContext() {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  if (!audioCtx) audioCtx = new Ctx();
  if (audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
  return audioCtx;
}

function playTaskSound() {
  const ctx = createAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  [740, 932, 1175].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(freq, now + i * 0.06);
    gain.gain.value = 0.0001;
    gain.gain.exponentialRampToValueAtTime(0.05, now + i * 0.06 + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.06 + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + i * 0.06);
    osc.stop(now + i * 0.06 + 0.13);
  });
}

function playCompletionJingle() {
  const ctx = createAudioContext();
  if (!ctx) return;

  const melody = [392, 523, 659, 784, 1046, 1318];
  const now = ctx.currentTime;
  melody.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.value = freq;
    gain.gain.value = 0.0001;
    gain.gain.exponentialRampToValueAtTime(0.09, now + i * 0.1 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.1 + 0.22);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + i * 0.1);
    osc.stop(now + i * 0.1 + 0.24);
  });
}

openSettingsBtn?.addEventListener("click", () => {
  soundToggle.checked = !!state.soundEnabled;
  if (bonusTasksToggle) bonusTasksToggle.checked = state.bonusTasksEnabled !== false;
  basePoints.value = state.scoring.basePoints;
  bonusPoints.value = state.scoring.maxBonus;
  syncScoreDisplays();
  renderRewardSettings();
  parentDialog.showModal();
});

function buildRewardId(title) {
  const normalized = String(title || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 40);
  const base = normalized || `reward-${Date.now()}`;
  const exists = new Set((state.rewardCatalog || []).map((item) => item.id));
  if (!exists.has(base)) return base;
  let n = 2;
  while (exists.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}

function renderRewardSettings() {
  if (!rewardSettingsList) return;
  rewardSettingsList.innerHTML = "";

  state.rewardCatalog
    .slice()
    .sort((a, b) => a.cost - b.cost)
    .forEach((reward) => {
      const row = document.createElement("div");
      row.className = "reward-settings-item";
      row.innerHTML = `
        <span>${escapeHtml(reward.title)}</span>
        <span>${reward.cost} poeng</span>
        <button class="reward-remove-btn" type="button" aria-label="Fjern premie">✕</button>
      `;
      row.querySelector(".reward-remove-btn")?.addEventListener("click", () => {
        state.rewardCatalog = state.rewardCatalog.filter((item) => item.id !== reward.id);
        saveState();
        renderRewardSettings();
        renderPointsOverview();
      });
      rewardSettingsList.appendChild(row);
    });
}

function addRewardFromSettings() {
  const title = rewardTitleInput?.value?.trim() || "";
  const cost = clampNumber(rewardCostInput?.value, 1, 100000, 100);
  if (!title) return;

  state.rewardCatalog = sanitizeRewardCatalog([
    ...state.rewardCatalog,
    { id: buildRewardId(title), title, cost },
  ]);

  if (rewardTitleInput) rewardTitleInput.value = "";
  if (rewardCostInput) rewardCostInput.value = "";

  saveState();
  renderRewardSettings();
  renderPointsOverview();
}

function syncScoreDisplays() {
  if (basePointsDisplay) basePointsDisplay.textContent = String(basePoints.value || state.scoring.basePoints);
  if (bonusPointsDisplay) bonusPointsDisplay.textContent = String(bonusPoints.value || state.scoring.maxBonus);
}

function changeScoreValue(target, delta) {
  if (target === "base") {
    basePoints.value = clampNumber(Number(basePoints.value || state.scoring.basePoints) + delta, 1, 50, 10);
  } else {
    bonusPoints.value = clampNumber(Number(bonusPoints.value || state.scoring.maxBonus) + delta, 0, 20, 5);
  }
  syncScoreDisplays();
}

function saveSettingsFromDialog() {
  state.soundEnabled = soundToggle.checked;
  state.bonusTasksEnabled = bonusTasksToggle ? bonusTasksToggle.checked : true;
  state.scoring.basePoints = clampNumber(basePoints.value, 1, 50, 10);
  state.scoring.maxBonus = clampNumber(bonusPoints.value, 0, 20, 5);
  saveState();
}

closeSettingsX?.addEventListener("click", () => {
  saveSettingsFromDialog();
  parentDialog.close();
});

function setupAuthUI() {
  const getEmailCredentials = () => ({
    email: authEmailInput?.value?.trim() || "",
    password: authPasswordInput?.value || "",
  });

  const submitEmailLogin = () => {
    const { email, password } = getEmailCredentials();
    cloud.signInWithEmail(email, password);
  };

  const submitEmailCreate = () => {
    const { email, password } = getEmailCredentials();
    cloud.createAccountWithEmail(email, password);
  };

  authEmailInput?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") submitEmailLogin();
  });
  authPasswordInput?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") submitEmailLogin();
  });

  authGuestBtn?.addEventListener("click", () => {
    setSignedInUI({ uid: "guest-local" });
    updateAuthStatus("Lokal modus uten synk er aktiv.");
  });

  authEmailSignInBtn?.addEventListener("click", submitEmailLogin);
  authEmailCreateBtn?.addEventListener("click", submitEmailCreate);
  settingsLogout?.addEventListener("click", async () => {
    await cloud.signOut();
    parentDialog.close();
  });

  basePlus?.addEventListener("click", () => changeScoreValue("base", 1));
  baseMinus?.addEventListener("click", () => changeScoreValue("base", -1));
  bonusPlus?.addEventListener("click", () => changeScoreValue("bonus", 1));
  bonusMinus?.addEventListener("click", () => changeScoreValue("bonus", -1));
  addRewardBtn?.addEventListener("click", addRewardFromSettings);
  rewardTitleInput?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") addRewardFromSettings();
  });
  rewardCostInput?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") addRewardFromSettings();
  });

  addChildBtn?.addEventListener("click", addChild);
  childNameInput?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") addChild();
  });
}

function updateAuthStatus(text) {
  if (authStatus) authStatus.textContent = text;
}

function setSignedInUI(user) {
  const signedIn = !!user;
  if (authScreen) {
    authScreen.hidden = signedIn;
    authScreen.style.display = signedIn ? "none" : "grid";
  }
  if (appShell) {
    appShell.hidden = !signedIn;
    appShell.style.display = signedIn ? "block" : "none";
  }
}

function createCloudAdapter() {
  let firebaseApp = null;
  let auth = null;
  let db = null;
  let currentUser = null;
  let unsubscribeProfile = null;
  let pendingPushState = null;
  let pushInFlight = false;

  function normalizeFirebaseConfig(rawCfg) {
    if (!rawCfg || typeof rawCfg !== "object") return null;

    const cfg = { ...rawCfg };
    const clean = (value) => String(value || "").trim();

    cfg.apiKey = clean(cfg.apiKey);
    cfg.projectId = clean(cfg.projectId);
    cfg.appId = clean(cfg.appId);

    let authDomain = clean(cfg.authDomain);
    if (authDomain) {
      authDomain = authDomain
        .replace(/^https?:\/\//i, "")
        .replace(/\/.*$/, "")
        .trim();
    }
    if (!authDomain && cfg.projectId) {
      authDomain = `${cfg.projectId}.firebaseapp.com`;
    }
    cfg.authDomain = authDomain;

    if (!cfg.apiKey || !cfg.projectId || !cfg.appId || !cfg.authDomain) return null;
    return cfg;
  }

  function getConfig() {
    return normalizeFirebaseConfig(window.MORGENHELT_FIREBASE_CONFIG);
  }

  function isEnabled() {
    return !!(window.firebase && getConfig());
  }

  function buildStateFromRemote(remote) {
    return {
      ...structuredClone(DEFAULT_STATE),
      ...remote,
      scoring: { ...structuredClone(DEFAULT_STATE).scoring, ...remote.scoring },
      children: sanitizeChildren(remote.children),
      history: Array.isArray(remote.history) ? remote.history : [],
      activeSessions: sanitizeActiveSessions(remote.activeSessions, sanitizeChildren(remote.children)),
      wildcards: sanitizeWildcards(remote.wildcards, sanitizeChildren(remote.children)),
      wildcardHistory: sanitizeWildcardHistory(remote.wildcardHistory, sanitizeChildren(remote.children)),
      dayStatusOverrides: sanitizeDayStatusOverrides(remote.dayStatusOverrides, sanitizeChildren(remote.children)),
      streaks: sanitizeStreaks(remote.streaks, sanitizeChildren(remote.children)),
      pointBank: sanitizePointBank(remote.pointBank, sanitizeChildren(remote.children)),
      levelProgress: sanitizeLevelProgress(remote.levelProgress, sanitizeChildren(remote.children)),
      rewardCatalog: sanitizeRewardCatalog(remote.rewardCatalog),
      rewardRedemptions: Array.isArray(remote.rewardRedemptions) ? remote.rewardRedemptions : [],
      meta: { updatedAt: Number(remote?.meta?.updatedAt) || 0 },
    };
  }

  function applyRemoteState(remote) {
    const nextState = buildStateFromRemote(remote);
    const remoteUpdatedAt = Number(nextState?.meta?.updatedAt) || 0;
    const localUpdatedAt = Number(state?.meta?.updatedAt) || 0;
    if (remoteUpdatedAt && localUpdatedAt && remoteUpdatedAt < localUpdatedAt) return;
    if (JSON.stringify(nextState) === JSON.stringify(state)) return;

    state = nextState;
    Object.keys(sessions).forEach((key) => delete sessions[key]);
    Object.assign(sessions, createAllSessions());
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    renderAll();
  }

  function ensureFirebase() {
    if (!isEnabled()) return false;
    if (firebaseApp) return true;

    firebaseApp = firebase.initializeApp(getConfig());
    auth = firebase.auth(firebaseApp);
    db = firebase.firestore(firebaseApp);
    return true;
  }

  function setProfileSubscription(uid) {
    if (!db || !uid) return;
    unsubscribeProfile?.();
    unsubscribeProfile = db.collection("profiles").doc(uid).onSnapshot(
      { includeMetadataChanges: true },
      (snap) => {
        if (!snap.exists) return;
        const payload = snap.data()?.state;
        if (!payload) return;
        applyRemoteState(payload);
      },
      () => {}
    );
  }


  function enqueuePush(nextState) {
    pendingPushState = structuredClone(nextState);
    void flushPush();
  }

  async function flushPush() {
    if (pushInFlight || !pendingPushState || !currentUser || !db) return;

    pushInFlight = true;
    const payload = pendingPushState;
    pendingPushState = null;

    try {
      await db.collection("profiles").doc(currentUser.uid).set(
        {
          state: payload,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    } catch {
      pendingPushState = payload;
      setTimeout(() => {
        void flushPush();
      }, 1500);
    } finally {
      pushInFlight = false;
      if (pendingPushState) void flushPush();
    }
  }

  function init() {
    if (!isEnabled()) {
      setSignedInUI(null);
      updateAuthStatus("");
      return;
    }

    ensureFirebase();

    const cfg = getConfig();
    if (cfg?.authDomain && cfg.authDomain.includes("/")) {
      updateAuthStatus("Firebase authDomain ser feil ut. Bruk kun domenenavn uten https:// og sti.");
    }

    auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(() => {});

    auth.getRedirectResult()
      .then(async (result) => {
        if (!result?.user) return;
        currentUser = result.user;
        setSignedInUI(result.user);
        updateAuthStatus(`Logget inn som ${result.user.email || result.user.displayName || "bruker"}.`);
        setProfileSubscription(result.user.uid);
        try {
          await pullState();
        } finally {
          void flushPush();
        }
      })
      .catch((err) => {
        updateAuthStatus(`Innlogging feilet: ${describeAuthError(err)}`);
      });

    auth.onAuthStateChanged(async (user) => {
      currentUser = user;
      setSignedInUI(user);
      if (!user) {
        unsubscribeProfile?.();
        unsubscribeProfile = null;
        updateAuthStatus("");
        return;
      }

      updateAuthStatus(`Logget inn som ${user.email || user.displayName || "bruker"}.`);
      setProfileSubscription(user.uid);
      try {
        await pullState();
      } finally {
        void flushPush();
      }
    });
  }

  function providerFor(type) {
    if (type === "google") return new firebase.auth.GoogleAuthProvider();
    if (type === "facebook") return new firebase.auth.FacebookAuthProvider();
    return null;
  }

  function getAuthDomainHint() {
    const cfg = getConfig() || {};
    const runtimeHost = window.location.host || "ukjent-host";
    const authDomain = cfg.authDomain || "ukjent-authDomain";
    const projectId = cfg.projectId || "ukjent-projectId";
    return `Runtime-host: ${runtimeHost}. Config authDomain: ${authDomain} (project: ${projectId}).`;
  }

  function describeAuthError(err) {
    const code = err?.code || "";
    if (code === "auth/unauthorized-domain") {
      return `Dette domenet er ikke autorisert i Firebase Auth. ${getAuthDomainHint()} Sjekk at korrekt Firebase-prosjekt brukes på denne enheten og at hosten (inkl. www/ikke-www) er lagt til i Authorized domains.`;
    }
    if (code === "auth/operation-not-allowed") {
      return "Google-innlogging er ikke aktivert i Firebase Console. Aktiver Google-provideren under Authentication → Sign-in method.";
    }
    if (code === "auth/popup-closed-by-user") {
      return "Innlogging ble avbrutt fordi popup-vinduet ble lukket før fullføring.";
    }
    if (code === "auth/network-request-failed") {
      return "Nettverksfeil under innlogging. Sjekk internett og prøv igjen.";
    }
    return err?.message || "ukjent feil";
  }

  function shouldPreferRedirect() {
    const ua = navigator.userAgent || "";
    const isIOS = /iPad|iPhone|iPod/.test(ua);
    const isSafari = /^((?!chrome|android|crios|fxios).)*safari/i.test(ua);
    return isIOS || isSafari;
  }

  async function signIn(providerType) {
    if (!ensureFirebase()) {
      alert("Innlogging er ikke tilgjengelig akkurat nå. Sjekk firebase-config.js.");
      return;
    }

    const provider = providerFor(providerType);
    if (!provider) return;

    if (shouldPreferRedirect()) {
      try {
        updateAuthStatus("Sender til innlogging…");
        await auth.signInWithRedirect(provider);
        return;
      } catch (redirectErr) {
        alert(`Innlogging feilet: ${describeAuthError(redirectErr)}`);
        return;
      }
    }

    try {
      await auth.signInWithPopup(provider);
      setSignedInUI({ uid: "pending" });
    } catch (err) {
      const fallbackToRedirect = [
        "auth/popup-blocked",
        "auth/cancelled-popup-request",
        "auth/operation-not-supported-in-this-environment",
      ].includes(err?.code);

      if (fallbackToRedirect) {
        try {
          updateAuthStatus("Sender til innlogging…");
        await auth.signInWithRedirect(provider);
          return;
        } catch (redirectErr) {
          alert(`Innlogging feilet: ${describeAuthError(redirectErr)}`);
          return;
        }
      }

      alert(`Innlogging feilet: ${describeAuthError(err)}`);
    }
  }

  async function signInWithEmail(email, password) {
    if (!ensureFirebase()) {
      alert("Innlogging er ikke tilgjengelig akkurat nå.");
      return;
    }
    if (!email || password.length < 6) {
      alert("Fyll inn e-post og passord (minst 6 tegn).");
      return;
    }

    try {
      await auth.signInWithEmailAndPassword(email, password);
      setSignedInUI({ uid: "pending" });
    } catch (err) {
      if (err?.code === "auth/user-not-found") {
        alert("Ingen konto funnet for e-posten. Trykk 'Opprett konto' for å registrere deg.");
        return;
      }
      alert(`Innlogging feilet: ${describeAuthError(err)}`);
    }
  }

  async function createAccountWithEmail(email, password) {
    if (!ensureFirebase()) {
      alert("Innlogging er ikke tilgjengelig akkurat nå.");
      return;
    }
    if (!email || password.length < 6) {
      alert("Fyll inn e-post og passord (minst 6 tegn).");
      return;
    }

    try {
      await auth.createUserWithEmailAndPassword(email, password);
      setSignedInUI({ uid: "pending" });
    } catch (err) {
      if (err?.code === "auth/email-already-in-use") {
        alert("Konto finnes allerede. Bruk 'Logg inn med e-post'.");
        return;
      }
      alert(`Kunne ikke opprette konto: ${describeAuthError(err)}`);
    }
  }

  async function signOut() {
    if (!auth) return;
    await auth.signOut();
    setSignedInUI(null);
  }

  function pushState(nextState) {
    enqueuePush(nextState);
  }

  async function pullState() {
    if (!currentUser || !db) return;

    let snap = null;
    try {
      snap = await db.collection("profiles").doc(currentUser.uid).get({ source: "server" });
    } catch {
      snap = await db.collection("profiles").doc(currentUser.uid).get();
    }

    if (!snap.exists) {
      pushState(state);
      return;
    }

    const payload = snap.data()?.state;
    if (!payload) return;

    applyRemoteState(payload);
  }

  return { init, signIn, signInWithEmail, createAccountWithEmail, signOut, pushState };
}

function clampNumber(value, min, max, fallback) {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.min(max, Math.max(min, Math.round(num)));
}

window.addEventListener(
  "pointerdown",
  () => {
    const ctx = createAudioContext();
    if (ctx?.state === "suspended") ctx.resume().catch(() => {});
  },
  { once: true }
);

window.addEventListener("beforeunload", saveState);
