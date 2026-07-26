# Generátor PDF skrípt

Webová aplikácia premieňa vložený Markdown text na jednotne formátované učebné PDF dokumenty v slovenčine.

## Použitie

1. Otvor generátor v prehliadači.
2. Vlož text skrípt.
3. Klikni na **Vytvoriť PDF so záložkami**.
4. Generátor stiahne hotové PDF s kopírovateľným textom, zachovaným odsadením kódu a navigačnými záložkami podľa nadpisov.

Hlavný export odošle pripravený obsah do služby Cloudflare iba na vytvorenie PDF. Aplikácia dokumenty neukladá a odpoveď servera má vypnuté ukladanie do vyrovnávacej pamäte.

## Záložné možnosti

- **Pôvodný export** otvorí tlačový dialóg prehliadača.
- **Doplniť záložky** pridá záložky do už uloženého PDF priamo v prehliadači. Vybraný súbor sa pri tomto postupe neposiela na server.

## Prevádzka

- Webová aplikácia je zverejnená cez GitHub Pages.
- `config.js` obsahuje adresu PDF služby.
- Priečinok `worker` obsahuje Cloudflare Worker s Browser Rendering.

Lokálna kontrola a nasadenie služby:

```powershell
cd worker
npm.cmd install
npm.cmd run check
npm.cmd run deploy
```

Cloudflare Worker povoľuje požiadavky z GitHub Pages a z lokálneho testovacieho servera na porte `8011`.
