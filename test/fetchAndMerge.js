/* eslint-disable require-jsdoc */

'use strict';

QUnit.module("Тестируем функцию fetchAndMerge", function() {
    QUnit.test("Возвращает объект при полученных данных", async function(assert) {
        const urls = [
            'https://vk.example.com/vkid',
            'https://mailru.example.com/mailid',
        ];
        const expected = {
            "age": [25, 22],
            "id": [1, 2],
            "name": ["Олег", "Мария"],
            "surname": ["Петров", "Иванова"],
            "status": ["Дуров, верни стену!"],
        };
        
        window.fetch = (url) => {
            const data = {
                'https://vk.example.com/vkid': { "id": 1, "name": "Олег", "surname": "Петров", "age": 25, "status": "Дуров, верни стену!" },
                'https://mailru.example.com/mailid': { "id": 2, "name": "Мария", "surname": "Иванова", "age": 22 },
            };

            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve(data[url]),
            });
        };

        const result = await fetchAndMerge(urls);
        assert.deepEqual(result, expected, "Должно правильно объединять данные с разных URL");
    });

    QUnit.test("Работает правильно при ошибках fetch", async function(assert) {
        const urls = [
            'https://vk.example.com/mailru',
            'https://vk.example.com/byte'
        ];

        window.fetch = () => Promise.reject(new Error("Network error"));

        const result = await fetchAndMerge(urls);
        assert.deepEqual(result, {}, "Должно возвращать пустой объект при ошибке fetch");
    });

    QUnit.test("Игнорирует дублирующиеся значения", async function(assert) {
        const urls = ['https://vk.example.com/data1', 'https://vk.example.com/data2'];
        const expected = {
            "id": [1],
            "role": ["user", "admin"]
        };
        
        window.fetch = (url) => {
            const data = {
                'https://vk.example.com/data1': { "id": 1, "role": "user" },
                'https://vk.example.com/data2': { "id": 1, "role": "admin" }
            };
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve(data[url])
            });
        };
        
        const result = await fetchAndMerge(urls);
        assert.deepEqual(result, expected, "Должно возвращать массив и исключать дубликаты");
    });

    QUnit.test("Корректно обрабатывает непересекающиеся ключи", async function(assert) {
        const urls = ['https://some.info.com/a', 'https://some.info.com/b'];
        const expected = {
            "a": [1],
            "b": [2]
        };
        
        window.fetch = (url) => {
            const data = {
                'https://some.info.com/a': { "a": 1 },
                'https://some.info.com/b': { "b": 2 }
            };
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve(data[url])
            });
        };
        
        const result = await fetchAndMerge(urls);
        assert.deepEqual(result, expected, "Должно объединять объекты с разными ключами");
    });
});
