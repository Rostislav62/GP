/*
/GuildPost/static/js/scripts.js
*/

// *******************************************************************************************
//                           Настройка обработчиков при загрузке страницы
// *******************************************************************************************

/**
 * Событие DOMContentLoaded.
 * Вызывается при загрузке страницы и инициализирует все обработчики событий.
 */
document.addEventListener("DOMContentLoaded", () => {
    loadArticles(); // Загружаем список статей в центральный бокс
    setupRegisterLink(); // Настраиваем ссылку "Регистрация"
    setupForgotPasswordLink(); // Настраиваем ссылку "Забыл пароль?"
    setupLoadArticleHandlers(); // Настраиваем обработчики для статей
    setupRegisterErrorHandlers(); // Настраиваем обработчики для страницы ошибок регистрации
    setupToggleViewModeHandler(); // Настраиваем кнопку "Список/Плитка"
    setupToggleViewThemeHandler(); // Настраиваем кнопку переключения темы
    setupHomeButtonHandler(); // Настраиваем кнопку "Главная"
    setupGlobalClickHandler(); //Универсальная обработка кликов по элементам страницы
//    setupLoadAllCommentsHandler(); // Настраиваем загрузку всех комментариев
//    setupCommentFormHandler(); // Настраиваем форму добавления комментария
});

// ********************** Конец настройки обработчиков при загрузке страницы **********************

// *******************************************************************************************
//                           Логика переключения режима "Список/Плитка"
// *******************************************************************************************

/**
 * Настраивает обработчик для кнопки переключения режима "Список/Плитка".
 */
function setupToggleViewModeHandler() {
    // Находим кнопку переключения режима
    const toggleButton = document.querySelector(".toggle-view-mode");

    if (!toggleButton) {
        console.error("Кнопка переключателя режима Список/Плитка не найдена!");
        return;
    }

    // Устанавливаем режим из localStorage при загрузке страницы
    const savedMode = localStorage.getItem("mode") || "list"; // По умолчанию режим "list"
    toggleMode(savedMode); // Применяем сохранённый режим

    updateToggleButton(toggleButton, savedMode); // Обновляем внешний вид кнопки

    // Назначаем обработчик клика на кнопку
    toggleButton.addEventListener("click", () => {
        const currentMode = toggleButton.getAttribute("data-mode"); // Текущий режим
        const newMode = currentMode === "list" ? "grid" : "list"; // Новый режим

        updateToggleButton(toggleButton, newMode); // Обновляем атрибуты и текст кнопки
        localStorage.setItem("mode", newMode); // Сохраняем новый режим в localStorage
        toggleMode(newMode); // Применяем новый режим
    });
}

/**
 * Обновляет атрибуты, текст и иконку кнопки переключения режима.
 * @param {HTMLElement} button - Кнопка переключателя.
 * @param {string} mode - Новый режим ("list" или "grid").
 */
function updateToggleButton(button, mode) {
    if (mode === "grid") {
        button.setAttribute("data-mode", "grid");
        button.innerHTML = '<i class="fas fa-th"></i> <span>Плитка</span>';
    } else {
        button.setAttribute("data-mode", "list");
        button.innerHTML = '<i class="fas fa-bars"></i> <span>Список</span>';
    }
}

/**
 * Применяет новый режим отображения к основному контейнеру.
 * @param {string} mode - Новый режим ("list" или "grid").
 */
function toggleMode(mode) {
    const mainElement = document.querySelector('.main');

    if (!mainElement) {
        console.error("Элемент .main не найден!");
        return;
    }

    if (mode === "list") {
        mainElement.classList.remove('list');
        mainElement.classList.add('grid');
    } else if (mode === "grid") {
        mainElement.classList.remove('grid');
        mainElement.classList.add('list');
    }
}

// **************** Конец логики переключения режима "Список/Плитка" *********************

// *******************************************************************************************
//                          Логика переключения светлой/тёмной темы
// *******************************************************************************************

/**
 * Настраивает обработчик для кнопки переключения темы "Светлая/Тёмная".
 */
function setupToggleViewThemeHandler() {
    const toggleButton = document.querySelector(".theme-toggle");

    if (!toggleButton) {
        console.error("Кнопка переключения темы не найдена!");
        return;
    }

    const savedTheme = localStorage.getItem("theme") || "light"; // Тема по умолчанию
    applyTheme(savedTheme); // Применяем сохранённую тему
    updateThemeButton(toggleButton, savedTheme); // Обновляем внешний вид кнопки

    toggleButton.addEventListener("click", () => {
        const currentTheme = toggleButton.getAttribute("data-theme");
        const newTheme = currentTheme === "dark" ? "light" : "dark";

        applyTheme(newTheme); // Применяем новую тему
        updateThemeButton(toggleButton, newTheme); // Обновляем кнопку
        localStorage.setItem("theme", newTheme); // Сохраняем тему в localStorage
    });
}

/**
 * Применяет тему к элементу <body>.
 * @param {string} theme - Новая тема ("light" или "dark").
 */
function applyTheme(theme) {
    document.body.setAttribute("data-theme", theme);
}

/**
 * Обновляет атрибуты, текст и иконку кнопки переключения темы.
 * @param {HTMLElement} button - Кнопка переключения темы.
 * @param {string} theme - Текущая тема ("light" или "dark").
 */
function updateThemeButton(button, theme) {
    if (theme === "light") {
        button.setAttribute("data-theme", "light");
        button.innerHTML = '<i class="fas fa-moon"></i> <span>Тёмная тема</span>';
    } else {
        button.setAttribute("data-theme", "dark");
        button.innerHTML = '<i class="fas fa-sun"></i> <span>Светлая тема</span>';
    }
}

// ****************** Конец логики переключения светлой/тёмной темы ***********************

// *******************************************************************************************
//                 Логика загрузки и взаимодействия со статьями
// *******************************************************************************************

/**
 * Настраивает обработчики для элементов с классом `.load-article`.
 */
function setupLoadArticleHandlers() {
    const articleElements = document.querySelectorAll(".load-article");

    articleElements.forEach((element) => {
        element.addEventListener("click", function () {
            const articleId = this.getAttribute("data-article-id");
            const url = this.getAttribute("data-url") || `/posts/articles/${articleId}/`;

            if (url) {
                loadContent(url, () => {
                    console.log(`Контент загружен с URL: ${url}`);
                });
            }
        });
    });
}

/**
 * Универсальная функция для загрузки контента в центральный бокс.
 * @param {string} url - URL для загрузки контента.
 * @param {Function} [callback] - Функция, вызываемая после загрузки контента.
 */
function loadContent(url, callback) {
    const mainBox = document.querySelector(".main-box");

    fetch(url)
        .then((response) => {
            if (!response.ok) throw new Error(`Ошибка загрузки контента: ${response.statusText}`);
            return response.text();
        })
        .then((html) => {
            mainBox.innerHTML = html;
            onContentLoaded(html); // Вызываем функцию для проверки и выполнения логики после загрузки
            if (callback) callback();
        })
        .catch((error) => {
            console.error("Ошибка загрузки:", error);
            mainBox.innerHTML = `<div class="error">Не удалось загрузить содержимое. Попробуйте позже.</div>`;
        });


}

// ******************** Конец логики загрузки и взаимодействия со статьями ********************


// *******************************************************************************************
//                  Логика регистрации, восстановления пароля и обработки ошибок
// *******************************************************************************************

/**
 * Настройка ссылки "Регистрация".
 * При клике загружает форму регистрации в центральный бокс.
 */
function setupRegisterLink() {
    const registrationLink = document.getElementById("registration-link");

    if (registrationLink) {
        registrationLink.addEventListener("click", (event) => {
            event.preventDefault(); // Предотвращаем стандартное поведение
            loadContent("/register/", setupRegistrationForm); // Загружаем форму регистрации
        });
    }
}

/**
 * Настройка ссылки "Забыл пароль?".
 * При клике загружает форму восстановления пароля в центральный бокс.
 */
function setupForgotPasswordLink() {
    const forgotPasswordLink = document.querySelector("#forgot-password-link");

    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener("click", (event) => {
            event.preventDefault(); // Предотвращаем стандартное поведение
            loadContent("/recovery-password/", () => {
                setupRecoveryRequestForm(); // Настраиваем форму запроса восстановления
                setupBackToSignInLink(); // Настраиваем ссылку возврата
            });
        });
    }
}

/**
 * Настраивает форму запроса восстановления пароля.
 */
function setupRecoveryRequestForm() {
    const recoveryForm = document.querySelector("#recovery-request-form");

    if (recoveryForm) {
        setupFormSubmission(recoveryForm, "/password-recovery-request/", setupCodeRecoveryForm);
    }
}

/**
 * Настраивает форму ввода кода восстановления.
 */
function setupCodeRecoveryForm() {
    const codeForm = document.querySelector("#recovery-code-form");

    if (codeForm) {
        setupFormSubmission(codeForm, "/password-recovery-code/", setupPasswordChangeForm);
    }
}

/**
 * Настраивает ссылку возврата на страницу входа.
 */
function setupBackToSignInLink() {
    const backToSignInLink = document.querySelector("#back-to-signin");
    const mainBox = document.querySelector(".main-box");
    const usernameField = document.querySelector("#login-username");

    if (backToSignInLink) {
        backToSignInLink.addEventListener("click", (event) => {
            event.preventDefault(); // Предотвращаем стандартное поведение

            if (mainBox) {
                mainBox.innerHTML = ""; // Очищаем центральный бокс
            }

            if (usernameField) {
                usernameField.focus(); // Устанавливаем фокус на поле логина
            }
        });
    }
}

/**
 * Настройка формы регистрации.
 */
function setupRegistrationForm() {
    const form = document.querySelector("#register-form");

    if (form) {
        setupFormSubmission(form, "/register/", setupActivationForm);
    }
}

/**
 * Настраивает форму активации аккаунта.
 */
function setupActivationForm() {
    const form = document.querySelector("#activation-form");

    if (form) {
        setupFormSubmission(form, "/activate/");
    }
}

/**
 * Проверяет, загружена ли форма `register_error.html` и настраивает кнопку возврата.
 */
function setupRegisterErrorHandlers() {
    const errorPage = document.querySelector("#register-error-page");

    if (errorPage) {
        setupRegisterReturnButton();
    }
}

// ******************** Конец логики регистрации, восстановления пароля и обработки ошибок ********************

// *******************************************************************************************
//                Логика работы с меню и отображением статей в центральной части
// *******************************************************************************************

/**
 * Настройка обработчиков для элементов меню.
 */
function setupMenuHandlers() {
    const menuItems = document.querySelectorAll(".menu-item");

    if (!menuItems || menuItems.length === 0) {
        console.error("Элементы меню не найдены!");
        return;
    }

    menuItems.forEach((item) => {
        item.addEventListener("click", () => handleMenuClick(item));
    });
}

/**
 * Обрабатывает клик по пункту меню.
 * @param {HTMLElement} item - Пункт меню, по которому кликнули.
 */
function handleMenuClick(item) {
    const link = item.dataset.link;

    if (link === "grid" || link === "list") {
        setViewMode(link);
    } else {
        console.warn("Неподдерживаемое действие:", link);
    }
}

/**
 * Устанавливает режим отображения статей.
 * @param {string} mode - Режим ("grid" или "list").
 */
function setViewMode(mode) {
    const articlesContainer = document.querySelector(".articles-container");

    if (!articlesContainer) {
        console.error("Контейнер статей не найден!");
        return;
    }

    if (mode === "grid") {
        articlesContainer.classList.add("grid-view");
        articlesContainer.classList.remove("list-view");
        localStorage.setItem("viewMode", "grid");
    } else if (mode === "list") {
        articlesContainer.classList.add("list-view");
        articlesContainer.classList.remove("grid-view");
        localStorage.setItem("viewMode", "list");
    }

    updateActiveMenuItem(mode);
}

/**
 * Обновляет активное состояние пунктов меню.
 * @param {string} mode - Режим ("grid" или "list").
 */
function updateActiveMenuItem(mode) {
    const menuItems = document.querySelectorAll(".menu-item");

    menuItems.forEach((item) => {
        if (item.dataset.link === mode) {
            item.classList.add("active");
        } else {
            item.classList.remove("active");
        }
    });
}

/**
 * Восстанавливает режим отображения статей из localStorage.
 */
function restoreViewMode() {
    const savedMode = localStorage.getItem("viewMode") || "grid";
    setViewMode(savedMode);
}

/**
 * Настраивает обработчик для кнопки "Главная".
 * Загружает список статей в центральную часть при нажатии.
 */
function setupHomeButtonHandler() {
    const homeButton = document.querySelector('.menu-item[data-link="home"]');

    if (!homeButton) {
        console.error('Кнопка "Главная" не найдена!');
        return;
    }

    homeButton.addEventListener('click', (event) => {
        event.preventDefault(); // Предотвращаем стандартное поведение
        loadArticles(); // Загружаем статьи
    });
}

/**
 * Загружает список статей в центральный бокс.
 */
function loadArticles() {
    loadContent('/posts/articles/', function () {
        setupLoadArticleHandlers(); // Повторно настраиваем обработчики для статей
    });
}

// *********************** Конец логики работы с меню и отображением статей ***********************

// *******************************************************************************************
//                          Логика добавления комментариев к статьям
// *******************************************************************************************

/**
 * Обрабатывает отправку формы комментария.
 * @param {HTMLFormElement} form - Форма комментария.
 */
function handleCommentFormSubmit(form) {
    const url = form.getAttribute("data-url"); // Получаем URL из атрибута data-url
    const formData = new FormData(form); // Собираем данные формы

    console.log("Отправка комментария через AJAX...");

    fetch(url, {
        method: "POST",
        body: formData,
        headers: {
            "X-Requested-With": "XMLHttpRequest", // Указываем, что это AJAX-запрос
        },
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Ошибка: ${response.statusText}`);
            }
            return response.text();
        })
        .then((html) => {
            const mainBox = document.querySelector(".main-box");
            mainBox.innerHTML = html; // Обновляем содержимое центрального блока
            console.log("Комментарий добавлен и страница обновлена.");
        })
        .catch((error) => {
            console.error("Ошибка при добавлении комментария:", error);
        });
}


// ******************* Конец логики добавления комментариев к статьям ********************


// *******************************************************************************************
//             Универсальная обработка кликов по элементам страницы
// *******************************************************************************************

/**
 * Универсальная функция для обработки кликов по элементам.
 * @param {Event} event - Событие клика.
 * @param {string} element - CSS-селектор элемента, который нужно обработать.
 * @param {string} comment - Сообщение для логирования.
 * @param {Function} callback - Функция, вызываемая при совпадении элемента.
 */
function handleElementClick(event, element, comment, callback) {
    const target = event.target; // Элемент, по которому кликнули
    console.log("Клик по элементу:", target);


    // Проверяем, соответствует ли элемент селектору
    if (target.matches(element)) {
        event.preventDefault(); // Предотвращаем стандартное поведение
        console.log(`Клик по ${comment}`); // Логируем сообщение
        if (callback) callback(target); // Вызываем функцию-обработчик, если передана
    }
}

/**
 * Универсальная функция для глобальной обработки кликов.
 * Обрабатывает клики на кнопки, ссылки и другие элементы.
 */
function setupGlobalClickHandler() {
    document.addEventListener("click", (event) => {
        // Обработка клика по статье
        handleElementClick(event, ".load-article", "статье", (target) => {
            const articleId = target.getAttribute("data-article-id"); // Получаем ID статьи
            const url = target.getAttribute("data-url") || `/posts/articles/${articleId}/`; // Получаем URL статьи

            if (url) {
                loadContent(url, () => {
                    console.log(`Статья загружена с URL: ${url}`);
                });
            }
        });

        // Обработка клика по кнопке "Добавить комментарий"
        handleElementClick(event, "#add-comment-form button[type='submit']", "кнопке 'Добавить комментарий'", (target) => {
            const commentForm = target.closest("#add-comment-form"); // Находим форму
            if (commentForm) {
                handleCommentFormSubmit(commentForm); // Обрабатываем отправку формы
            }
        });

        // Обработка клика по пункту меню
        handleElementClick(event, ".menu-item", "пункту меню", (target) => {
            handleMenuClick(target); // Вызываем обработчик для меню
        });
    });
}


// ******************** Конец универсальной обработки кликов по элементам ********************


/**
 * Настраивает обработчик для загрузки страницы всех комментариев.
 */
function setupLoadAllCommentsHandler() {
    // Находим блок последнего комментария по ID
    const latestCommentBlock = document.querySelector("#latest-comment");
    console.log(`Последний коммент был найден: ${latestCommentBlock}`);

    // Проверяем, найден ли элемент последнего комментария
    if (!latestCommentBlock) {
        console.error("Блок последнего комментария не найден!");
        return;
    }

    // Назначаем обработчик события клика на блок последнего комментария
    latestCommentBlock.addEventListener("click", () => {
        const url = latestCommentBlock.getAttribute("data-url"); // Извлекаем URL из атрибута data-url

        // Проверяем, есть ли корректный URL
        if (!url) {
            console.error("URL для загрузки всех комментариев отсутствует!");
            return;
        }

        // Используем универсальную функцию loadContent для загрузки страницы всех комментариев
        loadContent(url, () => {
            console.log(`Страница всех комментариев загружена с URL: ${url}`);
        });
    });
}



/**
 * Функция, выполняющая логику после загрузки контента в центральную часть.
 * @param {string} html - HTML-контент, загруженный в центральный блок.
 */
function onContentLoaded(html) {
    // Проверяем, загружен ли article_detail.html по наличию уникального элемента
    const latestCommentBlock = document.querySelector("#latest-comment");

    // Если элемент найден, вызываем настройку обработчика комментариев
    if (latestCommentBlock) {
        setupLoadAllCommentsHandler(); // Настраиваем обработчик для клика по блоку последнего комментария
        console.log("Обработчик для последнего комментария настроен.");
    } else {
        console.log("Элемент #latest-comment не найден. Это не article_detail.html.");
    }
}
