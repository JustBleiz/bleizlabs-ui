// Global SCSS module type declaration. Required because `@bleizlabs/ui` is
// installed via `file:` link (symlink to source) and tsc traverses lib's
// .tsx files which import .module.scss.

declare module '*.module.scss' {
  const styles: { readonly [key: string]: string };
  export default styles;
}

declare module '*.module.css' {
  const styles: { readonly [key: string]: string };
  export default styles;
}
