/*
/GuildPost/static/js/scripts.js
*/

//Вставим диагностический код в scripts.js для проверки z-index всех элементов на странице:
//
//Файл: <!-- /GuildPost/static/js/scripts.js -->
//Добавь временный код в начало файла:

document.addEventListener("DOMContentLoaded", () => {
    console.log("Начинаем проверку элементов на странице...");

    // Проверяем все элементы с потенциальными стилями z-index
    const elements = document.querySelectorAll('*'); // Получаем все элементы на странице
    elements.forEach(el => {
        const zIndex = window.getComputedStyle(el).zIndex; // Получаем z-index элемента
        if (zIndex && zIndex !== 'auto') {
            console.log(`Элемент: ${el.tagName}.${el.className}, z-index: ${zIndex}`);
        }
    });

    console.log("Проверка завершена.");
});





// *******************************************************************************************
//                           Настройка обработчиков при загрузке страницы
// *******************************************************************************************

/**
 * Событие DOMContentLoaded.
 * Вызывается при загрузке страницы и инициализирует все обработчики событий.
 */
document.addEventListener("DOMContentLoaded", () => {
    loadCategories(); // Загружаем категории новостей
    loadArticles(); // Загружаем список статей в центральный бокс
    setupRegisterLink(); // Настраиваем ссылку "Регистрация"
    setupForgotPasswordLink(); // Настраиваем ссылку "Забыл пароль?"
    setupLoadArticleHandlers(); // Настраиваем обработчики для статей
    setupRegisterErrorHandlers(); // Настраиваем обработчики для страницы ошибок регистрации
    setupToggleViewModeHandler(); // Настраиваем кнопку "Список/Плитка"
    setupToggleViewThemeHandler(); // Настраиваем кнопку переключения темы
    setupGlobalClickHandler(); //Универсальная обработка кликов по элементам страницы комментариев
});

// ********************** Конец настройки обработчиков при загрузке страницы **********************




// *******************************************************************************************
//                 Логика загрузки и взаимодействия со статьями
// *******************************************************************************************

/**
 * Настраивает обработчики для элементов с классом `.load-article`.
 */
function setupLoadArticleHandlers() {
    const articleElements = document.querySelectorAll(".load-article");
    console.log(`Выполнен document.querySelectorAll(".load-article")  ${articleElements}`);

    articleElements.forEach((element) => {
        element.addEventListener("click", function () {
            console.log(`Был нажат  ${element}`);
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
    console.log(`Входной параметр ${url}  `, url);
    console.log(`Входной параметр ${callback}  `, callback);
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
//                          Логика обработки кликов по элементам меню.
// *******************************************************************************************
/**
 * Обрабатывает клик по элементам меню.
 * @param {HTMLElement} item - Кликнутый элемент.
 */
function handleMenuClick(item) {
    const link = item.dataset.link; // Получаем значение атрибута data-link

    if (link === "grid" || link === "list") {
        setViewMode(link); // Устанавливаем режим отображения (сетка или список).
    } else if (link === "news") {
        loadAdForm(); // Загружаем форму редактора объявления.
    } else if (link === "home") {
        loadArticles(); // Загружаем список статей.
    } else if (link === "about") {
        loadContent('/about/'); // Загружаем страницу "О нас".
    } else if (link === "contacts") {
        loadContent('/contacts/'); // Загружаем страницу "Контакты".
    } else if (item.classList.contains("edit-article")) { // Если элемент - кнопка "Редактировать"
        handleEditArticle(item); // Вызываем функцию обработки кнопки "Редактировать".
    } else {
        console.warn("Неподдерживаемое действие:", link); // Логируем неподдерживаемые действия.
    }
}

// ****************** Конец логики обработки кликов по элементам меню. ***********************



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
//             Универсальная обработка кликов по элементам страницы комментариев
// *******************************************************************************************

/**
 * Универсальная функция для обработки кликов по элементам.
 * @param {Event} event - Событие клика.
 * @param {Function} callback - Функция, вызываемая для каждого обработанного элемента.
 */
function handleElementClick(event, callback) {
    const target = event.target; // Элемент, на который кликнули

    if (target.id === "home-link" || target.id === "home-link-bottom" ) { //|| target.id === "cancel-ad"
        console.log("Клик по #home-link или #home-link-bottom запускает loadArticles()");
        loadArticles(); // Загружаем статьи
    }

    if (target.id === "back-link" || target.id === "back-link-bottom") {
        const url = target.getAttribute("data-url"); // Извлекаем URL из data-url

        // Проверяем, есть ли корректный URL
        if (url) {
            // Загружаем страницу поста в центральную часть
            loadContent(url, () => {
                console.log(`Пост загружен с URL: ${url}`);
            });
        } else {
            console.error("URL для кнопки 'Назад' отсутствует!");
        }
    }


    // Выполняем переданную функцию обратного вызова, если есть
    if (callback) callback(target);
}


/**
 * Настраивает глобальный обработчик для всех кликов на странице комментариев.
 */
function setupGlobalClickHandler() {
    // Назначаем глобальный обработчик событий для кликов
    document.addEventListener("click", (event) => {
        // Универсальный вызов handleElementClick с использованием условий
        handleElementClick(event, (target) => {
            if (target.matches("#add-comment-form button[type='submit']")) {
                // Логика для добавления комментария
                const commentForm = target.closest("#add-comment-form"); // Находим форму комментария
                if (commentForm) {
                    handleCommentFormSubmit(commentForm); // Обрабатываем отправку формы комментария
                }
            } else if (target.matches(".menu-item")) {
                // Логика для пунктов меню
                handleMenuClick(target); // Обрабатываем клик по пункту меню
            }
        });
    });
}



// ******************** Конец универсальной обработки кликов по элементам на странице комментариев********************



/**
 * Настраивает обработчик для загрузки страницы всех комментариев.
 */
function setupLoadAllCommentsHandler() {
/**
 * Настраивает обработчики кликов для загрузки страницы всех комментариев.
 */
    // Находим все три элемента
    const latestCommentHeader = document.querySelector("#latest-comment"); // Заголовок последнего комментария
    const latestCommentText = document.querySelector("p.clickable"); // Текст последнего комментария
    const commentButton = document.querySelector(".btn-comment"); // Кнопка комментариев

    // Собираем найденные элементы в массив для обработки
    const elements = [latestCommentHeader, latestCommentText, commentButton];

    // Обрабатываем каждый элемент
    elements.forEach((element) => {
        if (!element) return; // Пропускаем, если элемент не найден

        // Назначаем обработчик клика
        element.addEventListener("click", () => {
            const url = element.getAttribute("data-url"); // Извлекаем URL из атрибута data-url

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
    });

    console.log("Обработчики кликов для комментариев настроены.");
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
    }
}





// *******************************************************************************************
//                          Логика загрузки категорий
// *******************************************************************************************

/**
 * Загружает категории новостей через AJAX-запрос и обновляет содержимое бокса.
 */
function loadCategories() {
//    console.log("Функция loadCategories вызвана"); // Проверяем вызов функции
    fetch("/categories/")
        .then(response => {
//            console.log("Ответ от сервера получен", response); // Проверяем ответ от сервера
            if (!response.ok) {
                throw new Error(`Ошибка загрузки категорий: ${response.statusText}`);
            }
            return response.text();
        })
        .then(data => {
//            console.log("Категории успешно загружены:", data); // Проверяем полученные данные
            const categoriesBox = document.getElementById("categories-box");
            if (categoriesBox) {
                categoriesBox.innerHTML = data;
            } else {
                console.error("Элемент #categories-box не найден!");
            }
        })
        .catch(error => {
            console.error("Ошибка загрузки категорий:", error);
        });
}


/**
 * Универсальная функция для настройки отправки формы через XMLHttpRequest.
 * @param {HTMLFormElement} form - HTML-элемент формы.
 * @param {string} url - URL для отправки формы.
 * @param {Function} [onSuccess] - Функция, вызываемая при успешной отправке.
 */
function setupFormSubmission(form, url, onSuccess) {
    if (form) {
        form.addEventListener("submit", (event) => {
            event.preventDefault(); // Отключаем стандартное поведение формы
            const formData = new FormData(form);
            const xhr = new XMLHttpRequest();

            xhr.open("POST", url, true);
            xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");

            xhr.onload = function () {
                if (xhr.status === 200) {
                    document.querySelector(".main-box").innerHTML = xhr.responseText;
                    if (onSuccess) onSuccess(); // Если есть функция обратного вызова, вызываем её
                } else {
                    displayErrors(form.querySelector(".error-container"), [
                        `Ошибка: ${xhr.status} - ${xhr.statusText}`,
                    ]);
                }
            };

            xhr.onerror = function () {
                displayErrors(form.querySelector(".error-container"), [
                    "Произошла ошибка сети. Попробуйте снова.",
                ]);
            };

            xhr.send(formData);
        });
    }
}


/**
 * Настройка формы смены пароля change_password.html.
 * Вызывает форму сообщения, что пароль был успешно изменён restored_password.html.
 */
function setupPasswordChangeForm() {
    const passwordForm = document.querySelector("#password-change-form");
    if (passwordForm) {
        setupFormSubmission(passwordForm, "/password-change/", setupRestoredPasswordMessage);
    }
}


/**
 * Настройка отображения сообщения о восстановлении пароля restored_password.html.
 * Загружает страницу с подтверждением успешного восстановления пароля.
 */
function setupRestoredPasswordMessage() {
    loadContent("/password-restored/", setupBackToSignInLink);
}




// *******************************************************************************************
//                          Логика для Светлой и Темной темы
// *******************************************************************************************

/**
 * Определяет и применяет тему в зависимости от времени суток.
 * Светлая тема активна с 6:00 до 18:00, тёмная в остальное время.
 */
function applyAutoTheme() {
    const currentHour = new Date().getHours(); // Получаем текущий час
    const isDayTime = currentHour >= 6 && currentHour < 18; // Проверяем, дневное ли время
    const autoTheme = isDayTime ? "light" : "dark"; // Выбираем тему в зависимости от времени

//    applyTheme(autoTheme); // Применяем тему
    localStorage.setItem("theme", autoTheme); // Сохраняем выбор темы
}

/**
 * Настраивает автоматическую смену темы и обновление кнопки переключения темы.
 */
function setupAutoThemeSwitch() {
    applyAutoTheme(); // Устанавливаем тему при загрузке страницы

    // Настраиваем интервал для проверки времени и обновления темы
    setInterval(() => {
        const savedTheme = localStorage.getItem("theme"); // Текущая сохранённая тема
        const currentHour = new Date().getHours();
        const isDayTime = currentHour >= 6 && currentHour < 18;
        const newAutoTheme = isDayTime ? "light" : "dark";

        // Если текущая тема отличается от желаемой по времени суток, обновляем
        if (savedTheme !== newAutoTheme) {
            applyTheme(newAutoTheme);
            localStorage.setItem("theme", newAutoTheme); // Сохраняем новый выбор
            console.log(`Автоматически переключено на тему: ${newAutoTheme}`);
        }
    }, 60000); // Проверяем каждые 60 секунд
}

// Настраиваем автоматическую смену темы при загрузке страницы
document.addEventListener("DOMContentLoaded", setupAutoThemeSwitch);

/**
 * Обновляет текущее время пользователя и его часовой пояс.
 */
function updateUserTime() {
    const userTimeElement = document.getElementById("user-time");
    const userTimezoneElement = document.getElementById("user-timezone");
    if (!userTimeElement || !userTimezoneElement) return;

    const userTime = new Date(); // Текущее время пользователя
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Не удалось определить"; // Часовой пояс пользователя

    userTimeElement.textContent = userTime.toLocaleString(); // Форматируем и выводим время
    userTimezoneElement.textContent = userTimezone; // Отображаем часовой пояс
}

/**
 * Обновляет текущее время и часовой пояс сервера.
 */
function updateServerTime() {
    const serverTimeElement = document.getElementById("server-time");
    const serverTimezoneElement = document.getElementById("server-timezone");
    if (!serverTimeElement || !serverTimezoneElement) return;

    fetch("/api/server-time/") // API для получения времени и часового пояса сервера
        .then((response) => {
            if (!response.ok) throw new Error(`Ошибка загрузки времени сервера: ${response.statusText}`);
            return response.json(); // Ожидаем формат: { "server_time": "2025-01-01T12:00:00Z", "server_timezone": "UTC" }
        })
        .then((data) => {
            const serverTime = new Date(data.server_time); // Преобразуем в объект Date
            serverTimeElement.textContent = serverTime.toLocaleString(); // Форматируем и выводим время
            serverTimezoneElement.textContent = data.server_timezone || "Неизвестный часовой пояс"; // Отображаем часовой пояс сервера
        })
        .catch((error) => console.error("Ошибка обновления времени сервера:", error));
}

/**
 * Устанавливает регулярное обновление времени и часовых поясов для пользователя и сервера.
 */
function setupTimeUpdates() {
    updateUserTime(); // Обновляем время и часовой пояс пользователя
    updateServerTime(); // Обновляем время и часовой пояс сервера

    // Настраиваем интервал для регулярного обновления
    setInterval(() => {
        updateUserTime();
        updateServerTime();
    }, 60000); // Обновляем каждую минуту
}

// Настраиваем обновление времени и часовых поясов при загрузке страницы
document.addEventListener("DOMContentLoaded", setupTimeUpdates);







// *******************************************************************************************
//                          Логика для кнопки "Новость" создание нового поста
// *******************************************************************************************

/**
 * Загружает форму создания объявления в центральную часть страницы.
 */
function loadAdForm() {
    const mainBox = document.querySelector('.main-box'); // Контейнер центральной части
    fetch('/ads/create/') // Отправляем запрос для получения формы создания объявления
        .then(response => response.text())
        .then(html => {
            mainBox.innerHTML = html; // Устанавливаем HTML-контент формы
            setupAdFormHandlers(); // Настраиваем обработчики событий для формы создания нового поста
        })
        .catch(error => console.error('Ошибка загрузки формы редактора новостей:', error)); // Логируем ошибку, если запрос не удался
}

/**
 * Настраивает обработчики событий для формы объявления.
 */
function setupAdFormHandlers() {
    const form = document.getElementById('ad-form'); // Форма объявления
    const previewButton = document.getElementById('preview-ad'); // Кнопка "Предпросмотр"
    const cancelButton = document.getElementById('cancel-ad'); // Кнопка "Отмена"

    // Настраиваем обработчик для отправки формы
    if (form) {
        form.addEventListener('submit', handleAdSubmit); // Обработчик отправки формы
    } else {
        console.error('Форма объявления не найдена!'); // Логируем ошибку, если форма не найдена
    }

    // Настраиваем обработчик для кнопки "Предпросмотр"
    if (previewButton) {
        previewButton.addEventListener('click', handleAdPreview); // Обработчик кнопки "Предпросмотр"
    } else {
        console.error('Кнопка "Предпросмотр" не найдена!'); // Логируем ошибку, если кнопка не найдена
    }

    // Настраиваем обработчик для кнопки "Отмена"
    if (cancelButton) {
        cancelButton.addEventListener('click', handleCancelButtonClick); // Обработчик кнопки "Отмена"
    } else {
        console.error('Кнопка "Отмена" не найдена!'); // Логируем ошибку, если кнопка не найдена
    }
}


/**
 * Обрабатывает отправку формы для сохранения объявления.
 * @param {Event} event - Событие отправки формы.
 */
function handleAdSubmit(event) {
    event.preventDefault(); // Останавливаем стандартное поведение формы
    const formData = new FormData(event.target); // Собираем данные из формы

    fetch(event.target.dataset.url, { // Отправляем запрос на сервер для сохранения объявления
        method: 'POST',
        body: formData
    })
        .then(response => response.json()) // Получаем ответ сервера в формате JSON
        .then(data => alert(data.message || 'Успешно сохранено')) // Показываем сообщение об успехе
        .catch(error => console.error('Ошибка сохранения:', error)); // Логируем ошибку, если запрос не удался
}

/**
 * Обрабатывает нажатие кнопки "Предпросмотр".
 * Проверяет обязательные поля формы и отображает страницу Предпросмотр.
 */
function handleAdPreview() {
    const adFormContainer = document.querySelector('.ad-form-container'); // Контейнер формы
    const adForm = document.getElementById('ad-form'); // Форма объявления
    // Определяем URL медиафайла из элемента формы или сервера
    const mediaInput = document.getElementById('media_file');
    const mediaUrl = mediaInput ? mediaInput.dataset.mediaUrl : null; // Получаем URL, если он есть

    if (mediaUrl) {
        formData.append("media_url", mediaUrl); // Добавляем URL файла в данные формы
    }

    if (!adFormContainer || !adForm) {
        console.error('Контейнер формы или форма не найдены!');
        return;
    }

    // Проверяем обязательные поля формы
    const title = document.getElementById('title')?.value.trim();
    const category = document.getElementById('category')?.value.trim();
    const content = document.getElementById('content')?.value.trim();

    if (!title || !category || !content) {
        // Если обязательные поля не заполнены, показываем уведомление
        showNotification('Пожалуйста, заполните все обязательные поля!');
        return;
    }

    adFormContainer.classList.add('hidden'); // Делаем контейнер формы невидимым
    const formData = new FormData(adForm); // Собираем данные формы
    formData.append("media_url", mediaUrl);  // Передаём URL файла

    // Отладочный вывод всех данных формы
    for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`); // Логируем ключи и значения
    }
    fetch('/ads/preview/', { // Отправляем запрос для получения страницы предпросмотра
        method: 'POST',
        body: formData
    })
        .then(response => response.text())
        .then(html => {
            const mainBox = document.querySelector('.main-box'); // Центральная часть страницы
            mainBox.innerHTML = html; // Загружаем HTML-контент предпросмотра
            setupReturnToEditorHandler(); // Настраиваем обработчик для кнопки "Вернуться в редактор"
        })
        .catch(error => {
            console.error('Ошибка предпросмотра:', error); // Логируем ошибку, если запрос не удался
            showNotification('Не удалось загрузить предпросмотр. Попробуйте позже.');
        });
}

// *******************************************************************************************
//                          Логика для кнопки "Вернуться в редактор"
// *******************************************************************************************

/**
 * Настраивает обработчик для кнопки "Вернуться в редактор" после загрузки страницы предпросмотра.
 */
function setupReturnToEditorHandler() {
    const returnButton = document.getElementById('return-editor'); // Кнопка "Вернуться в редактор"
    const mediaFileName = document.querySelector('.ad-preview').dataset.tempFileName; // Имя временного файла

    if (returnButton) {
        returnButton.addEventListener('click', () => {
            handleReturnToEditor(mediaFileName); // Передаём имя файла для удаления
        });
    } else {
        console.warn('Кнопка "Вернуться в редактор" отсутствует.');
    }
}

/**
 * Обрабатывает нажатие кнопки "Вернуться в редактор".
 * Скрывает предпросмотр, отображает редактор и удаляет временный файл.
 * @param {string} tempFileName - Имя временного файла для удаления.
 */
function handleReturnToEditor(tempFileName) {
    const adFormContainer = document.querySelector('.ad-form-container'); // Контейнер формы
    const adPreviewContainer = document.querySelector('.ad-preview'); // Контейнер предпросмотра

    if (!adFormContainer || !adPreviewContainer) {
        console.error('Контейнеры ad-form-container или ad-preview не найдены!');
        return;
    }

    // Удаляем временный файл через AJAX-запрос
    if (tempFileName) {
        const formData = new FormData();
        formData.append('file_name', tempFileName);

        fetch('/ads/delete_media/', {
            method: 'POST',
            body: formData,
        })
            .then(response => response.json())
            .then(data => {
                if (data.message) {
                    console.log('Файл успешно удалён:', data.message);
                } else {
                    console.error('Ошибка удаления файла:', data.error);
                }
            })
            .catch(error => console.error('Ошибка удаления файла:', error));
    }

    // Переключаем видимость
    adPreviewContainer.classList.add('hidden'); // Скрываем контейнер предпросмотра
    adFormContainer.classList.remove('hidden'); // Отображаем контейнер формы
}


// *******************************************************************************************
//       Логика для обработки нажатие кнопки "Отмена" с использованием SweetAlert2
// *******************************************************************************************

/**
 * Обрабатывает нажатие кнопки "Отмена".
 * При открытии модального окна временно скрывает доступность остальных элементов страницы.
 */
/**
 * Обрабатывает нажатие кнопки "Отмена".
 * Открывает модальное окно с выбором "Сохранить" или "Не сохранять".
 */
function handleCancelButtonClick() {
    console.log("Кнопка 'Отмена' была нажата"); // Логируем нажатие кнопки "Отмена" для проверки работы

    // Исправляем стили родительских элементов, чтобы модальное окно отображалось корректно
    fixParentStylesForModal(); // Вызываем функцию для исправления стилей потенциально проблемных элементов

    // Открываем модальное окно с помощью SweetAlert2
    Swal.fire({
        title: 'Вы уверены?', // Заголовок модального окна
        text: 'Хотите сохранить изменения перед выходом?', // Описание под заголовком
        icon: 'question', // Иконка вопроса в модальном окне
        showCancelButton: true, // Включаем отображение кнопки "Отмена"
        confirmButtonText: 'Сохранить', // Устанавливаем текст для кнопки подтверждения
        cancelButtonText: 'Не сохранять', // Устанавливаем текст для кнопки отмены
        reverseButtons: true, // Меняем местами кнопки "Сохранить" и "Не сохранять"
    }).then((result) => { // Обрабатываем результат взаимодействия пользователя с модальным окном
        console.log("Результат SweetAlert2:", result); // Логируем результат для отладки

        // Если пользователь нажал "Сохранить"
        if (result.isConfirmed) {
            console.log('Данные сохранены!'); // Логируем выбор "Сохранить"
            // Здесь будет логика для сохранения данных
        }
        // Если пользователь нажал "Не сохранять"
        else if (result.dismiss === Swal.DismissReason.cancel) {
            console.log('Изменения отменены.'); // Логируем выбор "Не сохранять"
            loadArticles(); // Загружаем список статей в центральную часть
        }
    });
}



/**
 * Принудительно исправляет стили родительских элементов, которые могут мешать отображению SweetAlert2.
 */
function fixParentStylesForModal() {
    console.log("Начинаем исправление стилей родительских элементов...");

    // Находим все элементы с `z-index` или потенциально блокирующими стилями
    const problematicElements = document.querySelectorAll('*');

    problematicElements.forEach(el => {
        const computedStyle = getComputedStyle(el);

        // Если элемент имеет высокий z-index, понижаем его
        if (computedStyle.zIndex !== 'auto' && parseInt(computedStyle.zIndex, 10) > 1000) {
            console.log(`Понижаем z-index элемента: ${el.tagName}.${el.className}, текущий z-index: ${computedStyle.zIndex}`);
            el.style.zIndex = '999';
        }

        // Убираем потенциально блокирующие position
        if (['fixed', 'absolute', 'relative'].includes(computedStyle.position)) {
            console.log(`Изменяем position элемента: ${el.tagName}.${el.className}, текущий position: ${computedStyle.position}`);
            el.style.position = 'static';
        }

        // Убираем overflow, который может блокировать SweetAlert2
        if (['hidden', 'scroll', 'auto'].includes(computedStyle.overflow)) {
            console.log(`Изменяем overflow элемента: ${el.tagName}.${el.className}, текущий overflow: ${computedStyle.overflow}`);
            el.style.overflow = 'visible';
        }
    });

    console.log("Исправление стилей завершено.");
}


// *******************************************************************************************
//                   Логика для кнопки "Редактировать"
// *******************************************************************************************

/**
 * Обрабатывает нажатие кнопки "Редактировать".
 * Загружает форму редактирования статьи в центральную часть.
 * @param {HTMLElement} button - Кликнутый элемент с кнопкой "Редактировать".
 */
function handleEditArticle(button) {
    const url = button.getAttribute('data-url'); // Получаем URL из data-url кнопки

    fetch(url) // Отправляем GET-запрос на сервер
        .then(response => {
            if (!response.ok) {
                throw new Error(`Ошибка загрузки формы: ${response.status}`); // Логируем ошибку, если запрос не удался
            }
            return response.text(); // Получаем HTML-контент формы
        })
        .then(html => {
            const mainBox = document.querySelector('.main-box'); // Центральная часть страницы
            mainBox.innerHTML = html; // Устанавливаем HTML формы в центральную часть
            setupAdFormHandlers(); // Настраиваем обработчики для формы
        })
        .catch(error => console.error('Ошибка загрузки формы редактирования:', error)); // Логируем ошибки
}