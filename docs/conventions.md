# Konwencje kodu — revvv-web

> **Status: przyjęte 2026-11-19.** Egzekwowanie przez ESLint/Prettier w REV-25.
> Źródła: sprawdzone praktyki z poprzedniego komercyjnego projektu właściciela (React + TanStack Query
> + RHF/Zod + i18n) — przeniesione tylko te, które się bronią — oraz standardy Next.js App Router i shadcn/ui.
>
> Claude zwraca uwagę, gdy kod (także pisany przez właściciela) odbiega od tych zasad.

## 0. Kluczowe decyzje

| # | Temat | Decyzja |
|---|---|---|
| D1 | Nazwy plików komponentów | **kebab-case**, płasko: `theme-switch.tsx` (spójne z shadcn i plikami Next.js). Nie folder PascalCase na komponent. |
| D2 | Deklaracja komponentu | `export function ThemeSwitch()` — jak shadcn i dokumentacja Next.js; funkcje są hoistowane (pomocnicze komponenty mogą być niżej w pliku) i mają czytelne nazwy w stack trace / React DevTools. |
| D3 | Prettier | **Jak w poprzednim projekcie:** `singleQuote: true`, `semi: true`, `trailingComma: "es5"`, `printWidth: 80`, `tabWidth: 2`, `arrowParens: "always"`, `jsxSingleQuote: false`, `singleAttributePerLine: true`. Formatowanie przy zapisie w edytorze. Konfiguracja w REV-25. |
| D4 | `data-testid` | **Na każdym elemencie interaktywnym** i w kluczowych miejscach struktury (patrz §10). Wymuszane własną regułą ESLint (REV-25). |
| D5 | `noUncheckedIndexedAccess` | **Włączone.** `arr[0]` ma typ `T \| undefined`, więc TypeScript zmusza do sprawdzenia, czy element istnieje — mniej błędów „cannot read property of undefined”. |

## 1. Struktura katalogów

```
src/
  app/                  tylko routing: page.tsx, layout.tsx, loading.tsx, error.tsx — cienkie pliki
  features/<domena>/    UI i logika domeny: komponenty, hooki, utils, api (maks. 3 poziomy zagnieżdżenia)
  components/ui/        komponenty shadcn (generowane — nie przerabiamy, patrz §3)
  components/           współdzielone komponenty aplikacji
  hooks/                współdzielone hooki
  lib/                  współdzielone narzędzia i konfiguracja (np. theme.ts, utils.ts, query-client.ts)
  api/generated/        klient z Orvala (REV-19) — nie edytujemy ręcznie
  styles/theme.css      tokeny motywu (jedyne miejsce na kolory)
  types/                współdzielone typy domenowe
messages/               tłumaczenia next-intl (REV-18)
```

- Kod współdzielony → foldery typów (`components`, `hooks`, `lib`, `types`). Kod domeny → `features/<domena>`.
- Pliki w `app/` składają widok z komponentów z `features/` — bez logiki biznesowej.
- Rzecz używana w jednej domenie zostaje w niej; do folderu współdzielonego przenosimy ją przy drugim użyciu.

## 2. Nazewnictwo plików

- Komponenty: wg D1. Hooki: `use-x.ts`, eksport `useX`.
- Sufiksy ról (łatwe wyszukiwanie): `*.utils.ts`, `*.types.ts`, `*.mapper.ts`, `*.queries.ts`,
  `*.mutations.ts`, `*.schema.ts`, `*.test.ts(x)`, `*.stories.tsx`.
- Stałe: `SCREAMING_SNAKE_CASE`. Booleany: `isX`, `hasX`, `shouldX`. Handlery: `handleX` (propsy: `onX`).

## 3. Komponenty

- Deklaracja przez `function` (D2). **Eksporty nazwane** wszędzie; `export default` tylko tam,
  gdzie wymaga go Next.js (`page`, `layout`, `error`…).
- Propsy: `interface XProps` nad komponentem (bez prefiksu `I`). `type` dla unii i typów pochodnych.
- Bez `React.FC`. `ref` to w React 19 zwykły prop — bez `forwardRef`.
- **Domyślnie komponent serwerowy.** `"use client"` tylko tam, gdzie jest stan, efekty lub zdarzenia,
  i jak najniżej w drzewie (mały kliencki „liść”, np. `ThemeSwitch`, w serwerowym layoucie).
- **Złożone komponenty jako osobne eksporty** (`DialogContent`, `DialogFooter` — styl shadcn), nie
  `Modal.Content`. Notacja z kropką nie działa przez granicę serwer/klient w App Routerze.
- Komponent > ~150 linii → wydzielamy części. Jeden główny komponent na plik; małe pomocnicze mogą zostać obok.
- **`components/ui/`** (shadcn) traktujemy jak bibliotekę: nie przerabiamy stylu, żeby móc pobierać
  aktualizacje. Własne warianty i kompozycje budujemy w swoich komponentach.

## 4. Style

- Tailwind + tokeny motywu (`bg-primary`, `text-muted-foreground`, `text-brand-strong`).
  **Żadnych kolorów na sztywno**, żadnych SCSS. Inline `style` tylko dla wartości dynamicznych.
- Łączenie klas: `cn()` z `@/lib/utils` (clsx + tailwind-merge — późniejsza klasa wygrywa konflikt).
- Warianty: `cva`. We własnych komponentach klasy grupujemy w tablice według celu:
  ```ts
  const cardVariants = cva(
    [
      'flex flex-col gap-2 rounded-xl border p-6', // layout
      'bg-card text-card-foreground', // colors
    ],
    { variants: { … } }
  );
  ```
- Mobile first: klasy bazowe dla telefonu, `sm:`/`md:`/`lg:` dla większych ekranów.

## 5. Dane (TanStack Query + Orval)

> Szczegóły doprecyzujemy w REV-19 (Orval) i REV-20 (obsługa błędów).

- Fetchery, typy i podstawowe hooki generuje Orval — nie piszemy ręcznie wywołań HTTP.
- Dla domeny, która potrzebuje logiki (unieważnianie, `select`, mapowanie), cienka warstwa
  `features/<domena>/api/<domena>.queries.ts` z **fabryką kluczy** i `queryOptions`:
  ```ts
  export const offerQueries = {
    all: () => ['offers'] as const,
    detail: (id: string) => queryOptions({ queryKey: [...offerQueries.all(), 'detail', id], queryFn: … }),
  };
  // użycie: useQuery(offerQueries.detail(id))
  ```
  Zagnieżdżanie kluczy pod `all()` sprawia, że `invalidateQueries({ queryKey: offerQueries.all() })` czyści całą domenę.
- Mutacje: hooki `useXxx` w `<domena>.mutations.ts`, `queryClient` z `useQueryClient()` —
  **nigdy** globalny singleton (na serwerze Next.js klient musi być tworzony per żądanie).
- Mapowanie odpowiedzi API → model UI w `*.mapper.ts`.
- Domyślne ustawienia klienta: `staleTime` ~30 s, bez ponawiania przy 401/403.
- Błędy: centralnie (`MutationCache`/`meta` lub `onError` w hooku mutacji), nie `try/catch` z toastem
  w każdym handlerze. Kody z Problem Details → komunikaty (zasady w `CLAUDE.md`).
- Stan filtrów i tabel: w parametrach URL, nie w globalnych kontekstach.

## 6. Formularze

- React Hook Form + Zod + komponenty `Form` z shadcn (dają `aria-invalid` i `aria-describedby`).
- Schemat jako fabryka przyjmująca funkcję tłumaczeń: `createOfferSchema(t)`; typ formularza: `z.infer<…>`.
- Wartości domyślne z `getDefaultValues(entity?)`.
- Synchronizacja z danymi z API przez opcję `values` w `useForm` (albo `key` z id encji),
  nie `useEffect` + `reset` z wyłączonym lintem.
- Błąd walidacji pod polem; błąd ogólny → toast.

## 7. Teksty (next-intl, REV-18)

- Żadnych tekstów w JSX. Wyjątek tymczasowy oznaczamy `TODO(REV-x)`.
- Klucze zagnieżdżone po domenie: `offer.details.title`. Wspólne zbiory: `common.*` (wspólne słowa),
  `validation.*`, `notification.*` (toasty).
- Typowane klucze (deklaracja typu wiadomości) — sprawdzamy celowo błędnym kluczem, że typowanie działa.
- Nowy klucz od razu we wszystkich plikach językowych.

## 8. TypeScript

- `strict`, zero `any`, `unknown` w `catch` + zawężanie typu.
- Zamiast `enum`: obiekt `as const` + typ pochodny:
  ```ts
  export const ROLE = { admin: 'admin', owner: 'owner' } as const;
  export type Role = (typeof ROLE)[keyof typeof ROLE];
  ```
- `import type` dla importów samych typów (wymuszone lintem w REV-25).
- Typy domenowe współdzielone w `src/types/`, lokalne obok kodu w `*.types.ts`.

## 9. Importy

- Między folderami alias `@/…`; ścieżki względne tylko w obrębie tego samego folderu.
- Kolejność (wymuszona lintem): paczki zewnętrzne → pusta linia → importy wewnętrzne; alfabetycznie.
- Bez plików `index.ts` (barrel) — importujemy bezpośrednio z pliku.

## 10. Testy

- Obok kodu: `x.test.ts(x)`. `describe` na moduł, `it('…')` opisuje zachowanie, po angielsku.
- **`data-testid` (D4):** na każdym elemencie interaktywnym (przyciski, linki, pola, przełączniki)
  i na kluczowych kontenerach. Format kebab-case z prefiksem funkcji: `theme-switch`,
  `offer-card-favorite-button`. W listach id z wartością domenową, **nie z indeksu**:
  `offer-card-${offer.id}`. Komponenty przekazują `data-testid` dalej przez propsy.
- Lokatory w testach: `getByTestId` jako podstawowy. Testid nie sprawdza dostępności, więc nazwy
  dostępne (`aria-label`, etykiety pól) dalej są obowiązkowe, a dostępność weryfikujemy osobno (axe w E2E).
- Własny `render` z providerami; **nowy `QueryClient` na każdy test**.
- API mockujemy przez **MSW** (najlepiej mocki z Orvala), nie przez mockowanie `useQuery`.
- Testujemy zachowanie (interakcje, warunkowe renderowanie) i czyste funkcje.

## 11. Komentarze

- Komentarz wyjaśnia **dlaczego**, nie co. JSDoc dla nieoczywistych funkcji narzędziowych.
- `TODO(REV-x): …` zawsze z numerem ticketu.

## 12. Czego świadomie nie przenosimy z poprzedniego projektu

| Praktyka | Dlaczego nie |
|---|---|
| SCSS modules, propsy layoutu z Radix Themes | mamy Tailwind + tokeny i shadcn |
| ręczny klient HTTP i mapa endpointów | Orval generuje klienta z OpenAPI |
| globalny singleton `queryClient` | niebezpieczny przy renderowaniu na serwerze |
| globalnie zagnieżdżone konteksty funkcji | zasięg do poddrzewa albo stan w URL |
| mockowanie `useQuery` w testach, wspólny klient w testach | kruche testy, przeciekający cache — MSW i świeży klient |
| `try/catch` + toast w każdym handlerze | powielony kod — obsługa centralna |
| komponenty po 400–600 linii, 7 poziomów folderów | trudne w utrzymaniu — limity z §1 i §3 |
