"use client";

import { useEffect, useState } from "react";

import { ChevronRightIcon } from "../build/icons";

type Props = {
  prompts: readonly string[];
  count?: number;
  onSelect: (prompt: string) => void;
  className?: string;
};

function shuffle<T>(items: readonly T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function ShuffledPromptPills({
  prompts,
  count = 4,
  onSelect,
  className = "mt-4 grid gap-2 sm:flex sm:flex-wrap",
}: Props) {
  const [visible, setVisible] = useState<readonly string[]>(() =>
    prompts.slice(0, count),
  );

  useEffect(() => {
    setVisible(shuffle(prompts).slice(0, count));
  }, [prompts, count]);

  return (
    <div className={className}>
      {visible.map((prompt) => (
        <button
          key={prompt}
          onClick={() => onSelect(prompt)}
          className="border-subtle text-secondary hover:text-primary inline-flex w-full items-center justify-between gap-3 rounded-full border px-4 py-3 text-left text-[13px] font-medium transition-colors hover:border-[var(--btn-ghost-hover-border)] hover:bg-[var(--btn-ghost-hover-bg)] sm:w-auto sm:justify-start sm:py-2"
        >
          {prompt}
          <ChevronRightIcon size={11} />
        </button>
      ))}
    </div>
  );
}
