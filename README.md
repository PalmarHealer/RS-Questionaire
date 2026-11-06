# RS-Questionaire

Ein Quiz zur Ermittlung persoenlicher Werte und Beduerfnisse. Nutzer waehlen Karten aus, vergleichen sie im Turnier-Modus und erhalten ein persoenliches Ranking.

## Projektstruktur

```
RS-Questionaire/
├── index.html                        # Haupt-HTML (Modals, Screens, Footer)
├── js/script.js                      # Anwendungslogik (jQuery)
├── css/style.css                     # Styling mit CSS-Variablen
├── static/
│   ├── cards-werte.json              # Konfiguration Wertetest
│   ├── cards-beduerfnisse.json       # Konfiguration Beduerfnistest
│   ├── font/                         # Inter-Schriftart (lokal)
│   ├── fontawesome/                  # Font Awesome Free 6.7.2 (lokal)
│   └── *.jpg, *.png                  # Bilder
```

---

## Wo welche Texte und Links bearbeitet werden

### 1. Quiz-Inhalte (Titel, Untertitel, Buttons, Karten)

Die meisten sichtbaren Texte kommen aus den JSON-Dateien im `static/`-Ordner. Aenderungen dort wirken sich direkt auf das Quiz aus, ohne dass JavaScript angepasst werden muss.

**Dateien:**
- [`static/cards-werte.json`](./static/cards-werte.json) (Wertetest)
- [`static/cards-beduerfnisse.json`](./static/cards-beduerfnisse.json) (Beduerfnistest)

| Was                                | Wo in der JSON-Datei             | Beispiel                                             |
|------------------------------------|----------------------------------|------------------------------------------------------|
| Quiz-Name                          | `label`                          | `"Wertetest"`                                        |
| Vorschau-Titel                     | `preScreen.title`                | `"Wertetest"`                                        |
| Vorschau-Beschreibung              | `preScreen.description`          | `"Entdecke, welche Werte dir wirklich wichtig sind"` |
| Startseite Titel                   | `screens.start.title`            | `"Dein Einstieg in den Wertetest"`                   |
| Startseite Untertitel              | `screens.start.subtitle`         | Unterstuetzt HTML (`<strong>`, `<br>`)               |
| Startseite Button                  | `screens.start.cta`              | `"Werte auswaehlen"`                                 |
| Vergleichsseite Titel              | `screens.compare.title`          | `"Jetzt geht's ins Duell"`                           |
| Vergleichsseite Untertitel         | `screens.compare.subtitle`       | Unterstuetzt HTML                                    |
| Vergleichsseite Button             | `screens.compare.cta`            | `"Vergleiche starten"`                               |
| Finale Titel                       | `screens.finale.title`           | `"Geschafft!"`                                       |
| Finale Untertitel                  | `screens.finale.subtitle`        | Unterstuetzt HTML                                    |
| Finale Button                      | `screens.finale.cta`             | `"Ergebnis anzeigen"`                                |
| Auswahl-Statusmeldungen            | `selection.messages.*`           | `belowMin`, `readyLow`, `readyMid`, etc.             |
| Auswahl-Hinweistext                | `selection.hint`                 | Optionaler Hilfstext unter der Auswahl               |
| Min/Max Kartenzahl                 | `selection.limits.min/max`       | `3` / `20`                                           |
| Button "Weiter"                    | `flow.nextButton`                | `"Weiter"`                                           |
| Button "PDF speichern"             | `flow.saveButton`                | `"PDF speichern"`                                    |
| Button "Neu starten"              | `flow.restartButton`             | `"Neu starten"`                                      |
| Turnier-Ueberschrift               | `tournament.title`               | `"Waehle, was dir wichtiger ist"`                     |
| Turnier-Meilensteinmeldungen       | `tournament.milestones[]`        | `{ "percent": 66, "text": "Zwei Drittel geschafft"}` |
| Ergebnis-Titel                     | `results.title`                  | `"Dein Ergebnis"`                                    |
| Ergebnis-Hinweistext               | `results.note`                   | Text unter dem Ergebnis-Titel                        |
| Ergebnis-Zwischentext              | `results.betweenText`            | Optionaler Text zwischen Ranking und CTA             |
| Kategorien anzeigen                | `results.showCategories`         | `true` (nur Beduerfnistest)                           |
| Kategorien                         | `categories[]`                   | `id`, `name`, `description` (nur Beduerfnistest)      |
| Einzelne Karten                    | `cards[]`                        | `id`, `name`, `description`, `icon`, `categoryId`    |

### 2. Statischer HTML-Text (index.html)

Texte, die **nicht** aus der JSON-Konfiguration kommen, sondern direkt in [`index.html`](./index.html) stehen:

| Was                                | Datei & Zeile                                        | Aktueller Text                                       |
|------------------------------------|------------------------------------------------------|------------------------------------------------------|
| Seitentitel (Browser-Tab)          | [`index.html:6`](./index.html#L6)                   | `Quiz`                                               |
| Info-Text Zeitaufwand              | [`index.html:34`](./index.html#L34)                  | `"Dieser Test benoetigt ein wenig Zeit..."`           |
| Datenschutz-Hinweis                | [`index.html:35`](./index.html#L35)                  | `"Waehrend des gesamten Tests verlassen..."`          |
| Button "Weiter" (Fallback)        | [`index.html:64`](./index.html#L64)                  | `Weiter`                                             |
| Button "PDF speichern" (Fallback) | [`index.html:65`](./index.html#L65)                  | `PDF speichern`                                      |
| Button "Neustarten" (Fallback)    | [`index.html:66`](./index.html#L66)                  | `Neustarten`                                         |
| Button "Ueber"                     | [`index.html:67`](./index.html#L67)                  | `Ueber`                                               |

### 3. Modal "Ueber dieses Quiz" (index.html)

| Was                                | Datei & Zeile                                        | Aktueller Text / Link                                |
|------------------------------------|------------------------------------------------------|------------------------------------------------------|
| Modal-Ueberschrift                  | [`index.html:77`](./index.html#L77)                  | `"Ueber dieses Quiz"`                                 |
| Team-Rolle 1                       | [`index.html:83`](./index.html#L83)                  | `"Idee"`                                             |
| Team-Name 1                        | [`index.html:84`](./index.html#L84)                  | `"Robert Schmikale"`                                 |
| Team-Rolle 2                       | [`index.html:90`](./index.html#L90)                  | `"Umsetzung"`                                        |
| Team-Name 2                        | [`index.html:91`](./index.html#L91)                  | `"Palmar Healer"`                                    |
| Credit-Link Font Awesome           | [`index.html:97`](./index.html#L97)                  | `https://fontawesome.com/icons`                      |
| Credit-Text Font Awesome           | [`index.html:99`](./index.html#L99)                  | `"Font Awesome fuer Icons"`                           |
| Credit-Link Inter Schrift          | [`index.html:101`](./index.html#L101)                | `https://rsms.me/inter/`                             |
| Credit-Text Inter                  | [`index.html:105`](./index.html#L105)                | `"Inter als Schriftart"`                             |
| Cookie-Hinweis                     | [`index.html:110`](./index.html#L110)                | `"Dieses Quiz benutzt keine Cookies."`               |
| Lizenz-Text                        | [`index.html:112`](./index.html#L112)                | `"...GNU General Public License v3.0"`               |
| Lizenz-Berechtigungen              | [`index.html:117-121`](./index.html#L117-L121)      | Kommerzielle Nutzung, Aenderungen, etc.              |
| Lizenz-Einschraenkungen            | [`index.html:127-128`](./index.html#L127-L128)      | Haftung, Gewaehrleistung                              |
| Lizenz-Bedingungen                 | [`index.html:134-137`](./index.html#L134-L137)      | Urheberrechtshinweis, Quellcode, etc.                |

### 4. CTA-Link auf Ergebnisseite (js/script.js)

Der Call-to-Action-Button auf der Ergebnisseite ist in JavaScript hartcodiert:

| Was                                | Datei & Zeile                                        | Aktueller Wert                                       |
|------------------------------------|------------------------------------------------------|------------------------------------------------------|
| CTA-Link (URL)                     | [`js/script.js:626`](./js/script.js#L626)           | `https://www.robertschmikale.de/`                   |
| CTA-Link-Text                      | [`js/script.js:626`](./js/script.js#L626)           | `"Mehr ueber meine Begleitung erfahren"`              |

### 5. Fallback-Texte in JavaScript (js/script.js)

Falls die JSON-Konfiguration bestimmte Felder nicht enthaelt, werden diese Fallbacks verwendet. In der Regel muessen sie **nicht** angepasst werden, da die JSON-Dateien die Werte ueberschreiben.

| Was                                | Datei & Zeile                                        |
|------------------------------------|------------------------------------------------------|
| Meilenstein-Meldungen (Standard)   | [`js/script.js:10-13`](./js/script.js#L10-L13)      |
| Auswahl-Statusmeldungen (Standard) | [`js/script.js:34-38`](./js/script.js#L34-L38)      |
| Screen-Titel Fallbacks             | [`js/script.js:225-240`](./js/script.js#L225-L240)  |
| Turnier-Titel Fallback             | [`js/script.js:431`](./js/script.js#L431)            |
| Ergebnis-Titel/Note Fallbacks      | [`js/script.js:522-523`](./js/script.js#L522-L523)  |

### 6. Farben und Design (css/style.css)

Alle Farben werden ueber CSS-Variablen in [`css/style.css:2-32`](./css/style.css#L2-L32) gesteuert:

| Variable                           | Beschreibung                     | Standardwert                                         |
|------------------------------------|----------------------------------|------------------------------------------------------|
| `--color-background`               | Hintergrundfarbe                 | `#fff3c6` (helles Gelb)                              |
| `--color-surface`                  | Oberflaechenfarbe                 | `#fde396`                                            |
| `--color-text`                     | Textfarbe                        | `#0f1111`                                            |
| `--color-accent`                   | Akzentfarbe (Buttons etc.)       | `#d88c17` (Gold/Orange)                              |
| `--color-accent-track`             | Fortschrittsbalken-Hintergrund   | `#fde396`                                            |
| `--color-versus-badge`             | VS-Badge im Turnier              | `#fbd357`                                            |
| `--selection-danger`               | Auswahl: zu wenige Karten        | `#d94c3f` (Rot)                                      |
| `--selection-warning`              | Auswahl: Achtung                 | `#d88c17` (Orange)                                   |
| `--selection-success`              | Auswahl: bereit                  | `#139a43` (Gruen)                                    |

### 7. Fotos im Modal "Ueber dieses Quiz" (css/style.css)

| Was                                | Datei & Zeile                                        | Pfad                                                 |
|------------------------------------|------------------------------------------------------|------------------------------------------------------|
| Foto Idee                          | [`css/style.css:933`](./css/style.css#L933)          | `static/img1.jpg`                                    |
| Foto Umsetzung                     | [`css/style.css:940`](./css/style.css#L940)          | `static/img2.png`                                    |

### 8. Icons und Schrift (lokal eingebunden)

Font Awesome Free 6.7.2 liegt unter `static/fontawesome/` (nur `solid` und `brands`), Inter 4.1 unter `static/font/`. Beides wird lokal ausgeliefert, damit keine Anfragen an Drittanbieter gehen.

Die Icons der einzelnen Karten (z.B. `fa-solid fa-mountain`) werden im `icon`-Feld der jeweiligen Karte in der JSON-Datei definiert. Verfuegbare Icons: [fontawesome.com/icons](https://fontawesome.com/icons?o=r&ic=free&s=solid) (nur Free + Solid funktioniert)

---

## Neuen Quiz-Typ hinzufuegen

1. Neue JSON-Datei in `static/` erstellen (z.B. `cards-ziele.json`)
2. Struktur von [`cards-werte.json`](./static/cards-werte.json) als Vorlage nehmen
3. In [`js/script.js:5-8`](./js/script.js#L5-L8) einen neuen Eintrag zu `TEST_DEFINITIONS` hinzufuegen:
   ```js
   { id: 'goals', path: './static/cards-ziele.json' }
   ```
4. Aufruf ueber URL-Parameter: `?quiz=goals`

## Lizenz

GNU General Public License v3.0
