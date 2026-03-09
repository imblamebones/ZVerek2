// script.js

function createRobot(name, config) {
    // Grade 4: Приватные статы через замыкания (closures)
    let health = config.maxHealth;
    let energy = config.maxEnergy;
    let food = config.maxFood;
    let water = config.maxWater;
    let isDead = false;

    // Вспомогательная функция ограничения значений от 0 до 100
    const clamp = (val, max) => Math.max(0, Math.min(max, val));

    const checkDeath = () => {
        if (health <= 0 || food <= 0 || water <= 0) {
            health = 0;
            isDead = true;
        }
    };

    return {
        getName: () => name,
        getStats: () => ({ health, energy, food, water, isDead }),

        eat: () => {
            // Grade 5: Защита от действий после смерти
            if (isDead) return { success: false, message: `${name} сломан. Действие невозможно.` };

            // Grade 5: Условные эффекты (если мало энергии, еда дает меньше профита)
            if (energy < 20) {
                food = clamp(food + config.foodGained / 2, config.maxFood);
                return { success: true, message: `${name} ест без сил. Получено мало сытости.` };
            }

            food = clamp(food + config.foodGained, config.maxFood);
            energy = clamp(energy - config.energyCost / 2, config.maxEnergy);
            return { success: true, message: `${name} зарядился питательным топливом.` };
        },

        drink: () => {
            if (isDead) return { success: false, message: `${name} сломан. Пить не может.` };

            water = clamp(water + config.hydrationGained, config.maxWater);
            return { success: true, message: `${name} попил жидкости. Системы охлаждены.` };
        },

        rest: () => {
            if (isDead) return { success: false, message: `${name} сломан. Отдых не поможет.` };

            energy = clamp(energy + config.energyGained, config.maxEnergy);
            food = clamp(food - config.healthDecay, config.maxFood);
            checkDeath();
            if (isDead) return { success: false, message: `${name} ушел в спящий режим навсегда (кончилась еда).` };

            return { success: true, message: `${name} перезагрузился и восстановил энергию.` };
        },

        tick: () => {
            if (isDead) return { success: false };

            // Если еды, воды или энергии нет, начинает падать здоровье
            if (food <= 0 || energy <= 0 || water <= 0) {
                health = clamp(health - 2, config.maxHealth);
            } else {
                food = clamp(food - config.idleFoodDecay, config.maxFood);
                energy = clamp(energy - config.idleEnergyDecay, config.maxEnergy);
                water = clamp(water - config.idleWaterDecay, config.maxWater);
            }

            checkDeath();
            if (isDead) return { success: false, message: `${name} отключился из-за истощения ресурсов.` };

            return { success: true };
        }
    };
}

// Конфигурация персонажа (Grade 5: настройка через конфиг)
const botConfig = {
    maxHealth: 100,
    maxEnergy: 100,
    maxFood: 100,
    maxWater: 100,
    foodGained: 25,
    hydrationGained: 20,
    energyGained: 30,
    energyCost: 15,
    healthDecay: 10,
    idleFoodDecay: 2,
    idleEnergyDecay: 1,
    idleWaterDecay: 2,
    tickIntervalMs: 2000
};

// Инициализация робота
const antropiy = createRobot('Олег', botConfig);

// Привязка UI элементов (DOM)
const UI = {
    healthFill: document.getElementById('healthFill'),
    energyFill: document.getElementById('energyFill'),
    foodFill: document.getElementById('foodFill'),
    waterFill: document.getElementById('waterFill'),
    healthVal: document.getElementById('healthVal'),
    energyVal: document.getElementById('energyVal'),
    foodVal: document.getElementById('foodVal'),
    waterVal: document.getElementById('waterVal'),
    statusConsole: document.getElementById('statusConsole'),
    characterImage: document.getElementById('characterImage'),
    btnEat: document.getElementById('btnEat'),
    btnDrink: document.getElementById('btnDrink'),
    btnRest: document.getElementById('btnRest')
};

// Функция обновления интерфейса
function updateDashboard(resultMessage = null) {
    const stats = antropiy.getStats();

    // Обновляем полоски (UI)
    UI.healthFill.style.width = `${stats.health}%`;
    UI.energyFill.style.width = `${stats.energy}%`;
    UI.foodFill.style.width = `${stats.food}%`;
    UI.waterFill.style.width = `${stats.water}%`;

    // Обновляем числа
    UI.healthVal.textContent = Math.round(stats.health);
    UI.energyVal.textContent = Math.round(stats.energy);
    UI.foodVal.textContent = Math.round(stats.food);
    UI.waterVal.textContent = Math.round(stats.water);

    // Вывод логов в консоль
    if (resultMessage !== null) {
        UI.statusConsole.textContent = resultMessage;
    }

    // Проверка смерти
    if (stats.isDead) {
        UI.characterImage.classList.add('dead');
        UI.btnEat.disabled = true;
        UI.btnDrink.disabled = true;
        UI.btnRest.disabled = true;

        UI.statusConsole.style.color = '#e74c3c';
        UI.statusConsole.style.fontWeight = 'bold';
    }
}

// События кнопок (Grade 4)
UI.btnEat.addEventListener('click', () => {
    const res = antropiy.eat();
    updateDashboard(res.message);
});

UI.btnDrink.addEventListener('click', () => {
    const res = antropiy.drink();
    updateDashboard(res.message);
});

UI.btnRest.addEventListener('click', () => {
    const res = antropiy.rest();
    updateDashboard(res.message);
});

// Стартовое обновление UI
updateDashboard('Система инициализирована. Олег готов к работе.');

// Игровой цикл: убывание ресурсов со временем
setInterval(() => {
    const res = antropiy.tick();
    if (res && res.message) {
        updateDashboard(res.message);
    } else if (res && res.success) {
        updateDashboard(null); // Обновляем только числа у статов, не трогая консоль
    }
}, botConfig.tickIntervalMs);
