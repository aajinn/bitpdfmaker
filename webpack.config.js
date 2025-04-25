const path = require('path');

module.exports = {
        entry: './src/script.js', // Replace with your JS file path
        output: {
                filename: 'bundle.js', // Output file
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
        mode: 'production', // Set mode to production for optimized output
};
