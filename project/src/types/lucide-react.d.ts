// Added a custom type declaration for 'lucide-react' to resolve missing type issues.
declare module 'lucide-react' {
  import * as React from 'react';
  export type IconProps = React.SVGProps<SVGSVGElement>;
  export const Play: React.FC<IconProps>;
  export const Info: React.FC<IconProps>;
  export const SearchIcon: React.FC<IconProps>;
  export const SlidersHorizontal: React.FC<IconProps>;
  export const ChevronDownIcon: React.FC<IconProps>;
  export const StarIcon: React.FC<IconProps>;
}