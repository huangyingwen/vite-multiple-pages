module.exports = {
  '*.{ts,tsx,vue}': 'eslint --cache --fix',
  '*.{css,scss,less,vue,html}': 'stylelint --fix',
  '*.{ts,tsx,css,scss,less,md,vue,json}': async files => {
    const filesToLint = files.filter(a => !a.includes('auto-imports.d.ts') && !a.includes('components.d.ts'));

    if (!filesToLint.length) return 'echo';

    return `prettier --write ${filesToLint.join(' ')}`;
  },
};
