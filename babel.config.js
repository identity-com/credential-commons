module.exports = {
  env: {
    cjs: {
      presets: [
        ['@babel/preset-env', {
          targets: {
            node: '6.10',
          },
          modules: 'commonjs',
        }],
      ],
    },
    browser: {
      presets: [
        [
          '@babel/preset-env',
          {
            targets: {
              browsers: ['last 2 versions'],
            },
            shippedProposals: true,
          },
        ],
      ],
      plugins: ['@babel/plugin-transform-runtime'],
    },
    test: {
      plugins: ['@babel/plugin-transform-modules-commonjs'],
    },
  },
};
