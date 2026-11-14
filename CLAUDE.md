# revvv-web

Frontend platformy **revvv.it** — agregatora ofert wypożyczalni aut sportowych i premium (od 200 KM).
Grupa docelowa jest szeroka, w dużej mierze młodzi ludzie, którzy chcą wynająć mocne auto na weekend
albo dać przejażdżkę w prezencie. Ton: luźny i energiczny. **Mobile first.**

Backend jest w osobnym repo `revvv-api` (zwykle obok, w `../revvv-api`).
Pełny kontekst projektu i wszystkie decyzje: `../revvv-api/docs/project-brief.md`.

## Styl pracy
Właściciel projektu zna dobrze Reacta, ale Next.js (App Router, Server Components, cache) słabiej.
W tym repo możesz implementować samodzielnie i przyspieszać pracę, ale przy rzeczach specyficznych
dla Next.js krótko wyjaśniaj, co i dlaczego (np. komponent serwerowy czy kliencki, strategia cache).
Właściciel chce dalej rozwijać się we frontendzie (w mniejszym stopniu niż w backendzie): gdy używasz
nieoczywistego hooka, wzorca albo dobrej praktyki (np. własne hooki, kompozycja komponentów, memoizacja,
stan serwera vs. klienta), dodaj 1–2 zdania „dlaczego tak”. Przy ciekawszych fragmentach zaproponuj,
żeby napisał je sam.
Rozmawiamy po polsku.

## Środowisko pracy
- Właściciel pracuje na **Windowsie w PowerShellu** — polecenia do uruchomienia podawaj w składni PowerShella.
- `docker compose` przez Docker Desktop (WSL2); konfiguracja może wymagać sprawdzenia przy pierwszym użyciu.
- Końce linii **LF** (`.gitattributes`). Skrypty w `package.json` muszą działać w PowerShellu i w CI (Linux).

## Stack
Next.js (App Router) + TypeScript (strict), Tailwind CSS, shadcn/ui, TanStack Query,
React Hook Form + Zod, Orval (klient z OpenAPI), next-intl, Sonner, MapLibre, Storybook,
Vitest + Testing Library + MSW, Playwright, pnpm.

## Konwencje
- **Kod, commity, PR-y, komentarze:** po angielsku. **Tickety w Jirze:** po polsku.
- **Gałęzie:** `REV-<numer>-krotki-opis`. **Commity:** Conventional Commits z numerem ticketu,
  np. `feat(search): add power filter [REV-42]`.
- **Teksty:** żadnych tekstów na sztywno w komponentach. Wszystko przez next-intl
  (na start tylko PL, struktura gotowa na EN).
- **Błędy:** API zwraca Problem Details z polem `code`. Front tłumaczy kody na komunikaty:
  - ogólne błędy → toast (Sonner),
  - błędy walidacji → pod konkretnym polem formularza,
  - awaria widoku → error boundary,
  - nieobsłużone błędy → Sentry.
- **Kolory:** tylko przez tokeny motywu (zmienne CSS shadcn/ui), nigdy wpisane na sztywno.
  Każdy widok musi działać w trybie jasnym i ciemnym.
- **Klient API:** generowany przez Orval z OpenAPI backendu. Nie edytuj wygenerowanych plików
  ręcznie — po zmianie API wygeneruj klienta ponownie.
- **SEO:** strony publiczne (oferty, profile wypożyczalni, wyniki dla miast) renderowane po
  stronie serwera. Panel wypożyczalni może działać jako część kliencka.
- **Dostępność:** semantyczny HTML, obsługa klawiatury, kontrast co najmniej 4,5:1.
- **Nowe komponenty UI** dostają story w Storybooku.

## Bezpieczeństwo
- Żadnych sekretów w kodzie. Zmienne `NEXT_PUBLIC_*` są publiczne — nigdy nie trzymaj tam kluczy.
- Treści od użytkowników z formatowaniem → sanityzacja (DOMPurify) przed wyświetleniem.
- Uprawnienia egzekwuje backend. Front tylko ukrywa elementy, nie zabezpiecza.

## Zależności (łańcuch dostaw)
- Nowe wersje paczek dopiero **3 dni po publikacji** (pnpm `minimumReleaseAge`). Nie omijaj tego
  ustawienia. Wyjątek: poprawki bezpieczeństwa.
- Zanim dodasz nową zależność, zapytaj i uzasadnij: czy jest potrzebna, czy jest aktywnie
  utrzymywana, ile ciągnie za sobą zależności. Preferuj rozwiązanie bez nowej paczki, jeśli jest proste.
- Instaluj konkretne wersje, nie `latest`. Akcje GitHub przypinaj do SHA.

## Praca z ticketami (Jira, projekt REV)
- Jira: przestrzeń `revvv.it`, klucz `REV`, połączona z GitHubem (GitHub for Atlassian, organizacja `revvvit`).
- Gdy dostajesz numer ticketu (np. `REV-42`), pobierz go przez Atlassian MCP, przeczytaj kryteria
  akceptacji, zaproponuj plan i dopytaj o niejasności przed kodowaniem.
- Do tworzenia ticketów używaj skilla `jira-ticket`.
- Statusy: To Do → In Progress → Code Review → QA → Ready for Release → Done (szczegóły: project-brief, sekcja 8).
  Proponuj przejścia: start pracy → In Progress, otwarty PR → Code Review, merge → QA (testy na INT),
  przetestowane na INT → Ready for Release, wdrożone na PRD → Done.
- Nieudane QA: ticket wraca do In Progress, poprawka nowym PR-em z tym samym numerem ticketu.

## Definition of Done
- [ ] Kryteria akceptacji ticketu spełnione
- [ ] Działa na mobile i desktopie, w trybie jasnym i ciemnym
- [ ] Brak tekstów na sztywno (next-intl)
- [ ] Testy dla logiki i złożonych komponentów, story w Storybooku dla nowych komponentów UI
- [ ] Lint, typecheck i testy przechodzą
- [ ] Sprawdzona dostępność (klawiatura, kontrast)

## Polecenia
<!-- Uzupełnić po wygenerowaniu szkieletu. Np.: -->
<!-- pnpm dev | pnpm test | pnpm lint | pnpm storybook | pnpm api:generate | pnpm e2e -->

## Dokumentacja
- `../revvv-api/docs/project-brief.md` — kontekst i decyzje całego projektu
- `docs/adr/` — decyzje architektoniczne dotyczące frontendu
- `../revvv-api/docs/learning/dziennik.md` — wspólny dziennik nauki; po otwarciu PR-a przypomnij o wpisie
- `../revvv-api/docs/jak-pracujemy.md` — ściąga procesu
