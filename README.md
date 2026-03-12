# RS-Questionaire

Ein Quiz zur Ermittlung persoenlicher Werte und Beduerfnisse. Nutzer waehlen Karten aus, vergleichen sie im Turnier-Modus und erhalten ein persoenliches Ranking.

## Projektstruktur

```
RS-Questionaire/
├── index.html                        # Haupt-HTML (Modals, Screens, Footer)
├── js/script.js                      # Anwendungslogik (jQuery)
├── css/style.css                     # Styling mit CSS-Variablen
├── css/icons.css                     # Icon-Import (Font Awesome)
├── static/
│   ├── cards-werte.json              # Konfiguration Wertetest
│   ├── cards-beduerfnisse.json       # Konfiguration Beduerfnistest
│   ├── font/                         # Inter-Schriftart
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
| Info-Text Zeitaufwand              | [`index.html:32`](./index.html#L32)                  | `"Dieser Test benoetigt ein wenig Zeit..."`           |
| Datenschutz-Hinweis                | [`index.html:33`](./index.html#L33)                  | `"Waehrend des gesamten Tests verlassen..."`          |
| Button "Weiter" (Fallback)        | [`index.html:62`](./index.html#L62)                  | `Weiter`                                             |
| Button "PDF speichern" (Fallback) | [`index.html:63`](./index.html#L63)                  | `PDF speichern`                                      |
| Button "Neustarten" (Fallback)    | [`index.html:64`](./index.html#L64)                  | `Neustarten`                                         |
| Button "Ueber"                     | [`index.html:65`](./index.html#L65)                  | `Ueber`                                               |

### 3. Modal "Ueber dieses Quiz" (index.html)

| Was                                | Datei & Zeile                                        | Aktueller Text / Link                                |
|------------------------------------|------------------------------------------------------|------------------------------------------------------|
| Modal-Ueberschrift                  | [`index.html:75`](./index.html#L75)                  | `"Ueber dieses Quiz"`                                 |
| Team-Rolle 1                       | [`index.html:81`](./index.html#L81)                  | `"Idee"`                                             |
| Team-Name 1                        | [`index.html:82`](./index.html#L82)                  | `"Robert Schmikale"`                                 |
| Team-Rolle 2                       | [`index.html:88`](./index.html#L88)                  | `"Umsetzung"`                                        |
| Team-Name 2                        | [`index.html:89`](./index.html#L89)                  | `"Palmar Healer"`                                    |
| Credit-Link Font Awesome           | [`index.html:95`](./index.html#L95)                  | `https://fontawesome.com/icons`                      |
| Credit-Text Font Awesome           | [`index.html:97`](./index.html#L97)                  | `"Font Awesome fuer Icons"`                           |
| Credit-Link Tabler Icons           | [`index.html:99`](./index.html#L99)                  | `https://tabler.io/icons`                            |
| Credit-Text Tabler                 | [`index.html:107`](./index.html#L107)                | `"Tabler fuer Dark/Light Mode Icons"`                 |
| Credit-Link Inter Schrift          | [`index.html:109`](./index.html#L109)                | `https://rsms.me/inter/`                             |
| Credit-Text Inter                  | [`index.html:113`](./index.html#L113)                | `"Inter als Schriftart"`                             |
| Cookie-Hinweis                     | [`index.html:118`](./index.html#L118)                | `"Dieses Quiz benutzt keine Cookies."`               |
| Lizenz-Text                        | [`index.html:120`](./index.html#L120)                | `"...GNU General Public License v3.0"`               |
| Lizenz-Berechtigungen              | [`index.html:124-130`](./index.html#L124-L130)      | Kommerzielle Nutzung, Aenderungen, etc.              |
| Lizenz-Einschraenkungen            | [`index.html:134-137`](./index.html#L134-L137)      | Haftung, Gewaehrleistung                              |
| Lizenz-Bedingungen                 | [`index.html:141-146`](./index.html#L141-L146)      | Urheberrechtshinweis, Quellcode, etc.                |

### 4. CTA-Link auf Ergebnisseite (js/script.js)

Der Call-to-Action-Button auf der Ergebnisseite ist in JavaScript hartcodiert:

| Was                                | Datei & Zeile                                        | Aktueller Wert                                       |
|------------------------------------|------------------------------------------------------|------------------------------------------------------|
| CTA-Link (URL)                     | [`js/script.js:607`](./js/script.js#L607)           | `https://www.robertschmikale.de/booking-calendar/...`|
| CTA-Link-Text                      | [`js/script.js:607`](./js/script.js#L607)           | `"Mehr ueber meine Begleitung erfahren"`              |

### 5. Fallback-Texte in JavaScript (js/script.js)

Falls die JSON-Konfiguration bestimmte Felder nicht enthaelt, werden diese Fallbacks verwendet. In der Regel muessen sie **nicht** angepasst werden, da die JSON-Dateien die Werte ueberschreiben.

| Was                                | Datei & Zeile                                        |
|------------------------------------|------------------------------------------------------|
| Meilenstein-Meldungen (Standard)   | [`js/script.js:12-15`](./js/script.js#L12-L15)      |
| Auswahl-Statusmeldungen (Standard) | [`js/script.js:35-40`](./js/script.js#L35-L40)      |
| Screen-Titel Fallbacks             | [`js/script.js:238-253`](./js/script.js#L238-L253)  |
| Turnier-Titel Fallback             | [`js/script.js:428`](./js/script.js#L428)            |
| Ergebnis-Titel/Note Fallbacks      | [`js/script.js:510-511`](./js/script.js#L510-L511)  |

### 6. Farben und Design (css/style.css)

Alle Farben werden ueber CSS-Variablen in [`css/style.css:2-33`](./css/style.css#L2-L33) gesteuert:

| Variable                           | Beschreibung                     | Standardwert                                         |
|------------------------------------|----------------------------------|------------------------------------------------------|
| `--color-background`               | Hintergrundfarbe                 | `#fff3c6` (helles Gelb)                              |
| `--color-surface`                  | Oberflaechenfarbe                 | `#fde396`                                            |
| `--color-text`                     | Textfarbe                        | `#0f1111`                                            |
| `--color-accent`                   | Akzentfarbe (Buttons etc.)       | `#d88c17` (Gold/Orange)                              |
| `--color-accent-track`             | Fortschrittsbalken-Hintergrund   | `#fde396`                                            |
| `--color-versus-badge`             | VS-Badge im Turnier              | `#fbd357`                                            |
| `--selection-color-danger`         | Auswahl: zu wenige Karten        | `#c0392b` (Rot)                                      |
| `--selection-color-warning`        | Auswahl: Achtung                 | `#e67e22` (Orange)                                   |
| `--selection-color-success`        | Auswahl: bereit                  | `#27ae60` (Gruen)                                    |

### 7. Hintergrundbilder (css/style.css)

| Was                                | Datei & Zeile                                        | Pfad                                                 |
|------------------------------------|------------------------------------------------------|------------------------------------------------------|
| Hintergrundbild 1                  | [`css/style.css:934`](./css/style.css#L934)          | `static/img1.jpg`                                    |
| Hintergrundbild 2                  | [`css/style.css:941`](./css/style.css#L941)          | `static/img2.png`                                    |

### 8. Icon-Bibliothek (css/icons.css)

| Was                                | Datei & Zeile                                        | URL                                                  |
|------------------------------------|------------------------------------------------------|------------------------------------------------------|
| Font Awesome Import                | [`css/icons.css:1`](./css/icons.css#L1)              | `https://site-assets.fontawesome.com/releases/v6.1.0/css/all.css` |

Die Icons der einzelnen Karten (z.B. `fa-solid fa-mountain`) werden im `icon`-Feld der jeweiligen Karte in der JSON-Datei definiert. Verfuegbare Icons: [fontawesome.com/icons](https://fontawesome.com/icons)

---

## Neuen Quiz-Typ hinzufuegen

1. Neue JSON-Datei in `static/` erstellen (z.B. `cards-ziele.json`)
2. Struktur von [`cards-werte.json`](./static/cards-werte.json) als Vorlage nehmen
3. In [`js/script.js:7-10`](./js/script.js#L7-L10) einen neuen Eintrag zu `TEST_DEFINITIONS` hinzufuegen:
   ```js
   { id: 'goals', path: './static/cards-ziele.json' }
   ```
4. Aufruf ueber URL-Parameter: `?quiz=goals`

## Lizenz

GNU General Public License v3.0
