module.exports = function (api) {
  api.cache(true);
  
  const plugins = [];
  
  // Only strip console.log in production builds
  if (process.env.NODE_ENV === 'production' || process.env.BABEL_ENV === 'production') {
    plugins.push('transform-remove-console');
  }
  
  // ⚠️ react-native-reanimated/plugin MUST be listed last
  plugins.push('react-native-reanimated/plugin');
  
  return {
    presets: ['babel-preset-expo'],
    plugins,
  };
};
