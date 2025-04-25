const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
        entry: './src/bundle.js', // Replace with your JS file path
        output: {
                filename: './src/bundle.js', // Output file
                path: path.resolve(__dirname, 'dist'), // Output directory
        },
        module: {
                rules: [
                        {
                                test: /\.js$/,
                                exclude: /node_modules/,
                                use: {
                                        loader: 'babel-loader', // Use Babel to transpile JS
                                },
                        },
                ],
        },
        plugins: [
                new CopyWebpackPlugin({
                        patterns: [
                                { from: './*.html', to: '[name][ext]' },
                                { from: './public', to: '' }
                        ],
                }),
        ],
        mode: 'production', // Set mode to production for optimized output
};
