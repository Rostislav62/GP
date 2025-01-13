//     /GuildPost/webpack.config.js

// Импортируем встроенные модули Node.js и плагины Webpack.
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin'); // Плагин для минификации кода.

module.exports = {
    // Входная точка — основной файл, который импортирует все остальные.
    entry: './static/js/global.js',

    // Выходной файл — собранный JavaScript.
    output: {
        path: path.resolve(__dirname, 'static/js/web'), // Папка для выходного файла.
        filename: 'bundle.js', // Название выходного файла.
    },

    // Режим сборки. "production" для минимизации, "development" для удобной отладки.
    mode: 'production',

    // Настройки обработки файлов.
    module: {
        rules: [
            {
                test: /\.js$/, // Применяется ко всем файлам .js.
                exclude: /node_modules/, // Исключаем папку node_modules.
                use: {
                    loader: 'babel-loader', // Используем загрузчик Babel.
                    options: {
                        presets: ['@babel/preset-env'], // Преобразование современного JavaScript в ES5.
                    },
                },
            },
        ],
    },

    // Оптимизация сборки.
    optimization: {
        minimize: true, // Включаем минификацию.
        minimizer: [new TerserPlugin()], // Используем плагин Terser для минификации.
    },
};
