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
        const mergedData = {};

        results.forEach(data => {
            for (const [key, value] of Object.entries(data)) {
                if (!mergedData[key]) {
                    mergedData[key] = new Set();
                }
                mergedData[key].add(value);
            }
        });

        // Превращаем множества в массивы
        const answer = {};
        for (const [key, values] of Object.entries(mergedData)) {
            answer[key] = Array.from(values);
        }

        return answer;
    } catch (error) {
        return {};
    }
}
