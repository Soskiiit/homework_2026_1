'use strict';

/**
 * Загружает данные с указанных URL и объединяет их в один объект
 * Если ключи совпадают, значения объединяются в массивы
 * 
 * @param {string[]} urls - Массив URL'ов для загрузки
 * @returns {Promise<Object>} - Промис с объединенным объектом данных
 */
async function fetchAndMerge(urls) {
    try {
    // Гуляем по URL'ам
    const fetchPromises = urls.map(url => fetch(url).then(response => {
        if (!response.ok) {
            throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
        }
        return response.json();
    }));

    // Дожидаемся ответов
    const results = await Promise.all(fetchPromises);

    // Перекладываем JSON'чики
    const mergedData = results.reduce((res, data) => {
        for (const [key, value] of Object.entries(data)) {
            if (!res[key]) {
                res[key] = new Set();
            }
            res[key].add(value);
        }
        return res;
    }, {});

    // Превращаем множества в массивы
    return Object.entries(mergedData).reduce((res, [key, values]) => {
        res[key] = Array.from(values);
        return res;
    }, {});
    } catch (error) {
        return {};
    }
}
