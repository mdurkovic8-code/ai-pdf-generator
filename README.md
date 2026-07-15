# Generator PDF skript

Tento priecinok obsahuje webovu verziu generatora PDF skript.

## Ako spustit lokalne

1. Otvor subor `index.html` v prehliadaci.
2. Vloz text skript.
3. Klikni na export a v Edge alebo Chrome vyber `Ulozit ako PDF`.
4. Tlacidlom `Doplnit zalozky` vyber ulozene PDF. Generator stiahne novu verziu so zalozkami podla nadpisov dokumentu.

Povodne PDF zostane nezmenene. Pridanie zaloziek prebieha priamo v prehliadaci a subor sa neposiela na server.

## Ako zverejnit na webe

Nahraj na hosting cely obsah tohto priecinka:

- `index.html`
- `assets/ai-learning-cover.png`
- `assets/vendor/pdf-lib.min.js`
- `assets/vendor/pdf-lib-LICENSE.md`

Najjednoduchsie moznosti:

- Netlify Drop: pretiahni cely priecinok do Netlify.
- GitHub Pages: nahraj priecinok do repozitara a zapni Pages.
- Klasicky webhosting: nahraj subory cez spravcu suborov alebo FTP.

Generator funguje priamo v prehliadaci. Vlozeny text sa neposiela na server.
