import { Button } from "@/components/ui/button";

// Temporary page to preview theme tokens in light and dark mode.
// TODO(REV-21): replace with the real start page; TODO(REV-18): move texts to next-intl.
export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-12">
      <section className="flex flex-col gap-4">
        <h1 className="text-4xl font-semibold tracking-tight">
          revvv<span className="text-brand-strong">.it</span>
        </h1>
        <p className="max-w-prose text-lg text-muted-foreground">
          Podgląd motywu: tła, tekst i akcenty w trybie jasnym i ciemnym.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button size="lg">Akcja główna</Button>
          <Button size="lg" variant="outline">
            Akcja drugorzędna
          </Button>
        </div>
      </section>

      <section className="flex flex-col gap-2 rounded-xl border bg-card p-6 text-card-foreground">
        <h2 className="text-xl font-semibold">Karta</h2>
        <p className="text-muted-foreground">
          Tekst wyciszony na karcie i{" "}
          <a href="#" className="font-medium text-brand-strong underline underline-offset-4">
            link w kolorze akcentu
          </a>
          .
        </p>
      </section>
    </main>
  );
}
