import type { SVGProps } from 'react';

export type LucideProps = SVGProps<SVGSVGElement> & {
  size?: number | string;
};

const baseProps = (props: LucideProps) => {
  const { size = 24, ...rest } = props;
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    ...rest,
  };
};

export const Plus = (props: LucideProps) => (
  <svg {...baseProps(props)}>
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </svg>
);

export const Trash2 = (props: LucideProps) => (
  <svg {...baseProps(props)}>
    <path d="M3 6h18" />
    <path d="M8 6V4h8v2" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M5 6l1 14h12l1-14" />
  </svg>
);

export const Pencil = (props: LucideProps) => (
  <svg {...baseProps(props)}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
);

export const Check = (props: LucideProps) => (
  <svg {...baseProps(props)}>
    <path d="m5 12 4 4 10-10" />
  </svg>
);

export const X = (props: LucideProps) => (
  <svg {...baseProps(props)}>
    <path d="M18 6 6 18" />
    <path d="M6 6l12 12" />
  </svg>
);
