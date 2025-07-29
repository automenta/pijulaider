module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current',
        },
      },
    ],
    '@babel/preset-react',
  ],
  plugins: [
    '@babel/plugin-transform-runtime',
    '@babel/plugin-syntax-top-level-await',
    '@babel/plugin-transform-modules-commonjs',
    '@babel/plugin-transform-class-properties',
    '@babel/plugin-transform-private-methods',
  ],
};
