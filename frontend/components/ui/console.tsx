import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

/* Page heading: uppercase label, large cream title, faint lede. */
export function PageHeader({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <header>
      <p className="text-label leading-none font-medium tracking-[0.13em] text-faint uppercase">
        {eyebrow}
      </p>
      <h1 className="text-page-title mt-5 max-w-[20ch] text-cream">{title}</h1>
      {children ? (
        <p className="text-fine mt-5 max-w-[52ch] leading-relaxed text-faint">{children}</p>
      ) : null}
    </header>
  );
}

/* Page body column, with the shell's padding. */
export function Page({ children }: { children: ReactNode }) {
  return (
    <div className="px-gutter py-(--page-pad)">
      <div className="max-w-[64rem]">{children}</div>
    </div>
  );
}

/*
  One step of a console page: a label column and a content column separated
  by a hairline — no card, no border box.
*/
export function Panel({
  title,
  index,
  children,
  className,
}: {
  title?: string;
  index?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        'grid gap-6 border-t border-hair-soft py-(--row-pad) lg:grid-cols-[minmax(0,11rem)_minmax(0,1fr)] lg:gap-12',
        className,
      )}
    >
      <div className="flex items-baseline gap-3 lg:block lg:pt-[0.35em]">
        {index && (
          <span className="text-label leading-none tabular-nums text-dim lg:block">{index}</span>
        )}
        {title && (
          <h2 className="text-label leading-none font-medium tracking-[0.13em] text-faint uppercase lg:mt-3">
            {title}
          </h2>
        )}
      </div>
      <div className="min-w-0 max-w-[36rem]">{children}</div>
    </section>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-label mb-3 block leading-none font-medium tracking-[0.13em] text-dim uppercase">
        {label}
      </span>
      {children}
      {hint && <span className="mt-2 block text-[0.75rem] leading-snug text-dim">{hint}</span>}
    </label>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        'w-full rounded-full border border-hair bg-transparent px-5 py-3 font-mono text-[0.9375rem] text-chalk',
        'placeholder:text-dim transition-colors duration-300 hover:border-hair-strong/40 focus:border-cream focus:outline-none',
        props.className,
      )}
    />
  );
}

const buttonVariants = {
  primary: 'bg-cream text-ground font-medium hover:opacity-90 disabled:opacity-40',
  outline: 'border border-hair text-chalk hover:border-cream disabled:opacity-40 disabled:hover:border-hair',
  danger: 'border border-amber/40 text-amber hover:border-amber disabled:opacity-40 disabled:hover:border-amber/40',
};

export function Button({
  variant = 'primary',
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof buttonVariants }) {
  return (
    <button
      {...props}
      className={cn(
        'text-fine cursor-pointer rounded-full px-5 py-2.5 leading-none whitespace-nowrap transition-all duration-300 disabled:cursor-not-allowed',
        buttonVariants[variant],
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Banner({
  tone = 'info',
  children,
}: {
  tone?: 'info' | 'pass' | 'fail' | 'warn';
  children: ReactNode;
}) {
  const styles = {
    info: { dot: 'bg-faint', text: 'text-muted' },
    pass: { dot: 'bg-signal', text: 'text-chalk' },
    fail: { dot: 'bg-amber', text: 'text-amber' },
    warn: { dot: 'bg-amber', text: 'text-amber' },
  }[tone];
  return (
    <div className="flex gap-3 border-t border-hair-soft py-5 font-mono text-[0.8125rem] leading-relaxed break-words">
      <span aria-hidden="true" className={cn('mt-[0.55em] size-[5px] shrink-0 rounded-full', styles.dot)} />
      <span className={cn('min-w-0', styles.text)}>{children}</span>
    </div>
  );
}

/* Shown in place of a page body when there is no wallet to act with. */
export function GateNotice({ children }: { children: ReactNode }) {
  return (
    <section className="mt-(--page-pad) border-t border-hair-soft pt-(--row-pad)">
      <p className="text-label leading-none font-medium tracking-[0.13em] text-faint uppercase">
        Wallet not connected
      </p>
      <p className="text-metric mt-5 max-w-[28ch] text-cream">{children}</p>
    </section>
  );
}

/* A proof or verification outcome, set at metric size. */
export function Result({
  pass,
  label,
  children,
}: {
  pass: boolean;
  label: string;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-hair-soft py-(--row-pad)">
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className={cn('size-[0.5rem] rounded-full', pass ? 'bg-signal' : 'bg-amber')} />
        <p className={cn('text-metric', pass ? 'text-cream' : 'text-amber')}>{label}</p>
      </div>
      <div className="text-fine mt-4 max-w-[52ch] leading-relaxed text-faint">{children}</div>
    </section>
  );
}

/* A closing list of facts under a hairline, like the shell's secondary rows. */
export function Aside({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-(--page-pad) border-t border-hair-soft pt-(--row-pad)">
      <h3 className="text-label leading-none font-medium tracking-[0.13em] text-faint uppercase">{title}</h3>
      <div className="mt-6">{children}</div>
    </section>
  );
}

export function FactList({ items, ordered = false }: { items: ReactNode[]; ordered?: boolean }) {
  const List = ordered ? 'ol' : 'ul';
  return (
    <List>
      {items.map((item, i) => (
        <li
          key={i}
          className="flex gap-4 border-b border-hair-soft py-3.5 text-[0.9375rem] leading-relaxed text-muted last:border-b-0"
        >
          <span aria-hidden="true" className="w-6 shrink-0 font-mono text-[0.8125rem] leading-[1.7] text-dim tabular-nums">
            {ordered ? String(i + 1).padStart(2, '0') : '—'}
          </span>
          <span className="min-w-0">{item}</span>
        </li>
      ))}
    </List>
  );
}
