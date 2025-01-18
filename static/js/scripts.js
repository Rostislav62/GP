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


// Функция для инициализации TinyMCE
/**
 * Инициализация TinyMCE с поддержкой медиафайлов.
 */
// Инициализация TinyMCE с правильным идентификатором
function initializeTinyMCE() {
    tinymce.init({
        selector: '#id_content', // Исправлен идентификатор на #content
        plugins: 'image media link paste code',
        toolbar: 'undo redo | bold italic | link image media | code',
        height: 300,
        automatic_uploads: true,
        file_picker_types: 'image media',
        images_upload_url: '/upload/',
        paste_data_images: true,
        file_picker_callback: function (callback, value, meta) {
            if (meta.filetype === 'image' || meta.filetype === 'media') {
                const input = document.createElement('input');
                input.setAttribute('type', 'file');
                input.setAttribute('accept', meta.filetype === 'image' ? 'image/*' : 'video/*');

                input.onchange = function () {
                    const file = this.files[0];
                    const formData = new FormData();
                    formData.append('file', file);


                    fetch('/upload/', {
                        method: 'POST',
                        body: formData,
                    })
                        .then(response => response.json())
                        .then(data => {
                            if (data && data.location) {
                                callback(data.location, { alt: file.name });
                            }
                        })
                        .catch(error => {
                            console.error('Ошибка загрузки файла:', error);
                        });
                };

                input.click();
            }
        },
    });
}







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
        // Загружаем форму редактора объявления и инициализируем TinyMCE после её загрузки
        loadAdForm(() => {
            initializeTinyMCE(); // Инициализируем TinyMCE только после успешной загрузки формы
            setupAdFormHandlers(); //Настраивает обработчики событий для формы нового объявления.
        });
    } else if (link === "home") {
        loadArticles(); // Загружаем список статей.
    } else if (link === "about") {
        loadContent('/about/'); // Загружаем страницу "О нас".
    } else if (link === "contacts") {
        loadContent('/contacts/'); // Загружаем страницу "Контакты".
    } else if (item.classList.contains("edit-article")) { // Если элемент - кнопка "Редактировать"
        handleEditArticle(item); // Вызываем функцию обработки кнопки "Редактировать".
    } else if (link === "find") {
        loadContent('/search/', () => {
            setupSearchFormHandler(); // Настраиваем обработчик для формы поиска
            console.log("Форма поиска загружена.");
            });
    } else if (link === "responses") { // Если пользователь кликнул на "Мои отклики"
        loadContent('/my-responses/'); // Загружаем страницу откликов в центральную часть
        return; // Прерываем выполнение, так как обработали событие
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


// *******************************************************************************************
//                          Логика для часового пояса и времени
// *******************************************************************************************
/**  * Обновляет текущее время пользователя и его часовой пояс.  */
function updateUserTime() {
    const userTimeElement = document.getElementById("user-time");
    const userTimezoneElement = document.getElementById("user-timezone");
    if (!userTimeElement || !userTimezoneElement) return;

    const userTime = new Date();
    const formattedTime = userTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // Только часы и минуты
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Не удалось определить";

    userTimeElement.textContent = formattedTime; // Отображаем время в формате HH:MM
    userTimezoneElement.textContent = userTimezone; // Отображаем часовой пояс
}

/**  * Обновляет текущее время и часовой пояс сервера.  */
function updateServerTime() {
    const serverTimeElement = document.getElementById("server-time");
    const serverTimezoneElement = document.getElementById("server-timezone");
    if (!serverTimeElement || !serverTimezoneElement) return;

    fetch("/api/server-time/")
        .then((response) => {
            if (!response.ok) throw new Error(`Ошибка загрузки времени сервера: ${response.statusText}`);
            return response.json();
        })
        .then((data) => {
            const serverTime = new Date(data.server_time);
            const formattedTime = serverTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // Только часы и минуты
            serverTimeElement.textContent = formattedTime;
            serverTimezoneElement.textContent = data.server_timezone || "Неизвестный часовой пояс";
        })
        .catch((error) => console.error("Ошибка обновления времени сервера:", error));
}

/**  * Устанавливает регулярное обновление времени и часовых поясов.  */
function setupTimeUpdates() {
    updateUserTime();
    updateServerTime();

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

function loadAdForm(callback) {
    fetch('/ads/create/')
        .then(response => response.text())
        .then(html => {
            const mainBox = document.querySelector('.main-box');
            mainBox.innerHTML = html;

            // Проверяем, доступен ли объект TinyMCE
            if (typeof tinymce === "undefined") {
                console.error("TinyMCE не загружен. Убедитесь, что скрипт подключён.");
            } else if (callback) {
                callback(); // Вызываем коллбэк
            }
        })
        .catch(error => console.error('Ошибка загрузки формы редактора:', error));
}



/**
 * Настраивает обработчики событий для формы нового объявления.
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
// Функция для обработки предпросмотра
function handleAdPreview() {
    const adFormContainer = document.querySelector('.ad-form-container'); // Контейнер формы
    const adForm = document.getElementById('ad-form'); // Форма объявления

    if (!adFormContainer || !adForm) {
        console.error('Контейнер формы или форма не найдены!');
        return;
    }

    // Проверяем обязательные поля формы
    const title = document.getElementById('title')?.value.trim();
    const category = document.getElementById('category')?.value.trim();

    // Проверяем доступность TinyMCE
    const tinyMCEInstance = tinymce.get('id_content');
    if (!tinyMCEInstance) {
        console.error("TinyMCE не инициализирован для элемента 'id_content'.");
        console.log("Все зарегистрированные редакторы:", tinymce.editors);
        showNotification('Редактор текста не готов. Попробуйте позже.', 'error');
        return;
    }

    // Получаем данные из TinyMCE
    const content = tinyMCEInstance.getContent()?.trim();

    if (!title || !category || !content) {
        // Если обязательные поля не заполнены, показываем уведомление
        showNotification('Пожалуйста, заполните все обязательные поля!');
        return;
    }

    const formData = new FormData(adForm); // Собираем данные формы
    formData.append('content', content); // Явно добавляем содержимое TinyMCE

    // Отладочный вывод всех данных формы
    for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`); // Логируем ключи и значения
    }

    fetch('/ads/preview/', { // Отправляем запрос для получения страницы предпросмотра
        method: 'POST',
        body: formData
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Ошибка HTTP: ${response.status}`);
            }
            return response.text();
        })
        .then(html => {
            const mainBox = document.querySelector('.main-box'); // Центральная часть страницы
            mainBox.innerHTML = html; // Загружаем HTML-контент предпросмотра
            setupReturnToEditorHandler(); // Настраиваем обработчик для кнопки "Вернуться в редактор"
        })
        .catch(error => {
            console.error('Ошибка предпросмотра:', error); // Логируем ошибку, если запрос не удался
            showNotification('Не удалось загрузить предпросмотр. Попробуйте позже.', 'error');
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




// *******************************************************************************************
//                  Логика обработки формы поиска статей
// *******************************************************************************************

/**
 * Настраивает обработчик отправки формы поиска.
 */
function setupSearchFormHandler() {
    const searchForm = document.querySelector("#search-form"); // Находим форму поиска

    if (searchForm) {
        searchForm.addEventListener("submit", (event) => {
            event.preventDefault(); // Предотвращаем стандартное поведение формы

            const url = searchForm.action; // Получаем URL для отправки формы
            const formData = new FormData(searchForm); // Собираем данные формы

            fetch(url, {
                method: "GET", // Используем метод GET для отправки данных
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
                    mainBox.innerHTML = html; // Обновляем содержимое центральной части
                    console.log("Результаты поиска загружены.");
                })
                .catch((error) => {
                    console.error("Ошибка при загрузке результатов поиска:", error);
                });
        });
    } else {
        console.warn("Форма поиска не найдена.");
    }
}

// ****************************Конец логики обработки формы поиска статей********************


// Функция для отображения уведомлений
function showNotification(message, type = "info") {
    // Проверяем наличие контейнера для уведомлений
    let notificationBox = document.getElementById("notification-box");

    if (!notificationBox) {
        // Если контейнер отсутствует, создаём его
        notificationBox = document.createElement("div");
        notificationBox.id = "notification-box";
        document.body.appendChild(notificationBox);
    }

    // Создаём элемент уведомления
    const notification = document.createElement("div");
    notification.className = `notification ${type}`; // Устанавливаем тип уведомления (info, success, error)
    notification.textContent = message; // Добавляем текст сообщения

    // Добавляем уведомление в контейнер
    notificationBox.appendChild(notification);

    // Автоматически скрываем уведомление через 3 секунды
    setTimeout(() => {
        notification.remove(); // Удаляем уведомление из DOM
    }, 3000);
}


/**
 * Подтверждение удаления статьи.
 * @param {HTMLElement} button - Кнопка "Удалить".
 */
function confirmDelete(button) {
    const articleId = button.getAttribute("data-article-id");
    const url = button.getAttribute("data-url");

    if (confirm("Вы уверены, что хотите удалить эту статью? Это действие нельзя отменить!")) {
        fetch(url, {
            method: "POST",
            headers: {
                "X-CSRFToken": getCSRFToken(),
                "X-Requested-With": "XMLHttpRequest",
            },
        })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                alert("Статья удалена!");
                loadContent('/posts/articles/'); // После удаления загружаем список статей
            } else {
                alert(data.error || "Ошибка при удалении статьи!");
            }
        })
        .catch(error => console.error("Ошибка удаления:", error));
    }
}

/**
 * Получает CSRF-токен из cookie.
 * Django использует CSRF-токен для защиты от атак.
 */
function getCSRFToken() {
    let cookieValue = null;
    const cookies = document.cookie.split(";");

    // Перебираем все куки и ищем csrftoken
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.startsWith("csrftoken=")) {
            cookieValue = cookie.substring("csrftoken=".length, cookie.length);
            break;
        }
    }
    return cookieValue;
}

/**
 * Обновляет статус комментария без перезагрузки страницы.
 * @param {number} commentId - ID комментария.
 * @param {string} newStatus - Новый статус комментария ("approved" или "rejected").
 */
function updateCommentStatus(commentId, newStatus) {
    const statusElement = document.querySelector(`#comment-status-${commentId}`);
    if (statusElement) {
        statusElement.textContent = newStatus === "approved" ? "Одобрен" : "Отклонен"; // Меняем текст статуса
    }

    const buttonsContainer = document.querySelector(`#comment-actions-${commentId}`);
    if (buttonsContainer) {
        buttonsContainer.innerHTML = ""; // Удаляем кнопки "Принять" и "Отклонить"
    }
}

/**
 * Отправляет AJAX-запрос для принятия отклика.
 * @param {number} commentId - ID отклика, который нужно принять.
 */
function approveComment(commentId) {
    fetch(`/comments/approve/${commentId}/`, {
        method: "POST",
        headers: {
            "X-Requested-With": "XMLHttpRequest",
            "X-CSRFToken": getCSRFToken(),
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            updateCommentStatus(commentId, "approved"); // ✅ Меняем статус на "Одобрен"
        }
    })
    .catch(error => console.error("Ошибка при одобрении отклика:", error));
}

/**
 * Отправляет AJAX-запрос для отклонения отклика.
 * @param {number} commentId - ID отклика, который нужно отклонить.
 */
function rejectComment(commentId) {
    fetch(`/comments/reject/${commentId}/`, {
        method: "POST",
        headers: {
            "X-Requested-With": "XMLHttpRequest",
            "X-CSRFToken": getCSRFToken(),
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            updateCommentStatus(commentId, "rejected"); // ✅ Меняем статус на "Отклонен"
        }
    })
    .catch(error => console.error("Ошибка при отклонении отклика:", error));
}

/**
 * Отправляет AJAX-запрос для удаления отклика.
 * @param {number} commentId - ID отклика, который нужно удалить.
 */
function deleteComment(commentId) {
    fetch(`/comments/delete/${commentId}/`, {
        method: "POST",
        headers: {
            "X-Requested-With": "XMLHttpRequest",
            "X-CSRFToken": getCSRFToken(),
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const commentRow = document.querySelector(`#comment-row-${commentId}`);
            if (commentRow) {
                commentRow.remove(); // Удаляем строку комментария из таблицы
            }
        } else {
            console.error("Ошибка при удалении комментария:", data.error);
        }
    })
    .catch(error => console.error("Ошибка удаления отклика:", error));
}

/**
 * Позволяет пользователю редактировать свой комментарий.
 * @param {number} commentId - ID комментария.
 */
function editComment(commentId) {
    console.log(`editComment вызван для commentId: ${commentId}`); // Проверяем, вызывается ли функция
    const commentContent = document.querySelector(`#comment-content-${commentId}`); // Находим контент комментария
    const actionsContainer = document.querySelector(`#comment-actions-${commentId}`); // Контейнер с кнопками

    if (!commentContent || !actionsContainer) return; // Проверяем, что элементы существуют

    // Создаем поле ввода с текущим текстом комментария
    const textArea = document.createElement("textarea");
    textArea.value = commentContent.textContent;
    textArea.id = `edit-comment-input-${commentId}`;
    textArea.rows = 3;
    textArea.style.width = "100%";

    // Заменяем текст комментария на поле ввода
    commentContent.innerHTML = "";
    commentContent.appendChild(textArea);

    // Добавляем кнопки "Сохранить" и "Отмена"
    actionsContainer.innerHTML = `
        <button onclick="saveComment(${commentId})">💾 Сохранить</button>
        <button onclick="cancelEdit(${commentId})">❌ Отмена</button>
    `;
}

/**
 * Отправляет изменения комментария на сервер через AJAX.
 * @param {number} commentId - ID комментария.
 */
function saveComment(commentId) {
    const newText = document.querySelector(`#edit-comment-input-${commentId}`).value; // Получаем новый текст

    fetch(`/comments/edit/${commentId}/`, {
        method: "POST",
        headers: {
            "X-Requested-With": "XMLHttpRequest",
            "X-CSRFToken": getCSRFToken(),
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ content: newText }) // Отправляем JSON с новым текстом
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const commentContent = document.querySelector(`#comment-content-${commentId}`);
            commentContent.textContent = data.new_content; // Обновляем текст комментария на странице
            document.querySelector(`#comment-actions-${commentId}`).innerHTML = `
                <button onclick="editComment(${commentId})">✏️ Редактировать</button>
                <button onclick="deleteComment(${commentId})">🗑 Удалить</button>
            `;
        } else {
            console.error("Ошибка при редактировании:", data.error);
        }
    });
}


/**
 * Отменяет редактирование комментария.
 * @param {number} commentId - ID комментария.
 */
function cancelEdit(commentId) {
    location.reload(); // Просто обновляем страницу, чтобы вернуть старое состояние
}


/** **********************************************************************************

/**
 * Настраивает обработчик отправки формы фильтрации откликов через AJAX.
 */

function setupResponseFilterHandler() {
    console.log("Подключение setupResponseFilterHandler()..."); // Логируем вызов обработчика

    const filterForm = document.querySelector("#response-filter-form"); // Находим форму фильтрации
    if (!filterForm) return; // Если формы нет, ничего не делаем

    // Удаляем старый обработчик перед добавлением нового
    filterForm.removeEventListener("submit", handleFilterSubmit);
    filterForm.addEventListener("submit", handleFilterSubmit);
}

/**
 * Обработчик отправки формы фильтрации (AJAX).
 */
function handleFilterSubmit(event) {
    console.log("Подключение handleFilterSubmit"); // Логируем вызов
    event.preventDefault(); // Предотвращаем стандартную перезагрузку страницы

    const formData = new FormData(event.target); // Собираем данные формы
    const queryString = new URLSearchParams(formData).toString(); // Кодируем параметры для URL
    const url = `/my-responses/?${queryString}`; // Формируем URL с параметрами

    console.log(`Фильтр отправляется: ${url}`); // Логируем URL запроса

    loadContent(url, () => {
        setupResponseFilterHandler(); // Заново подключаем обработчик после загрузки
    });
}



/**
 * Подключает обработчики кнопок "Редактировать" и "Удалить" после загрузки `my_responses.html`.
 */
function setupCommentActionHandlers() {
    document.querySelectorAll("[onclick^='editComment']").forEach(button => {
        const commentId = button.getAttribute("onclick").match(/\d+/)[0]; // Извлекаем ID комментария
        button.onclick = () => editComment(commentId); // Назначаем правильный обработчик
    });

    document.querySelectorAll("[onclick^='deleteComment']").forEach(button => {
        const commentId = button.getAttribute("onclick").match(/\d+/)[0]; // Извлекаем ID комментария
        button.onclick = () => deleteComment(commentId); // Назначаем правильный обработчик
    });
}

/**
 * Отлавливает момент загрузки `my_responses.html` и подключает обработчики кнопок.
 */
function setupMyResponsesObserver() {
    const mainBox = document.querySelector(".main-box");

    // Используем MutationObserver, чтобы отслеживать изменения в `.main-box`
    const observer = new MutationObserver(() => {
        if (document.querySelector("#response-filter-form")) {
            setupResponseFilterHandler(); // Подключаем обработчик фильтрации
            setupCommentActionHandlers(); // Подключаем обработчики кнопок "Редактировать" и "Удалить"
        }
    });

    observer.observe(mainBox, { childList: true, subtree: true });
}

// Подключаем обработчик `setupMyResponsesObserver()`, чтобы он следил за изменениями в `.main-box`
document.addEventListener("DOMContentLoaded", () => {
    setupMyResponsesObserver();
});



/**
 * Показывает форму для выбора причины отклонения и скрывает старую кнопку "Отклонить".
 * @param {number} commentId - ID комментария.
 */
function showRejectReasonForm(commentId) {
    const reasonForm = document.querySelector(`#reject-reason-${commentId}`); // Форма выбора причины
    const rejectButton = document.querySelector(`#reject-button-${commentId}`); // Кнопка "Отклонить"

    if (reasonForm && rejectButton) {
        reasonForm.style.display = "block"; // Показываем форму выбора причины
        rejectButton.style.visibility = "hidden"; // Вместо `display: none`, чтобы не менять структуру
    }
}




/**
 * Отправляет AJAX-запрос для отклонения комментария с указанием причины.
 * @param {number} commentId - ID комментария.
 */
function rejectComment(commentId) {
    const selectElement = document.querySelector(`#reason-select-${commentId}`);
    const customReasonInput = document.querySelector(`#custom-reason-${commentId}`);

    let reason = selectElement.value;
    if (reason === "Другое") {
        reason = customReasonInput.value.trim(); // Используем введенный пользователем текст
    }

    if (!reason) {
        alert("Выберите или укажите причину отклонения!");
        return;
    }

    fetch(`/comments/reject/${commentId}/`, {
        method: "POST",
        headers: {
            "X-Requested-With": "XMLHttpRequest",
            "X-CSRFToken": getCSRFToken(),
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ reason: reason })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            updateCommentStatus(commentId, "rejected"); // Обновляем статус
        } else {
            console.error("Ошибка при отклонении комментария:", data.error);
        }
    })
    .catch(error => console.error("Ошибка отклонения комментария:", error));
}


/**
 * Настраивает обработчики кликов по категориям.
 * Работает как при загрузке страницы, так и после динамической загрузки `categories.html`.
 */
function setupCategoryClickHandler() {
    console.log("setupCategoryClickHandler вызван");

    // Используем делегирование событий для корректной работы после загрузки `categories.html`
    document.body.addEventListener("click", function(event) {
        const category = event.target.closest(".category-link"); // Ищем ближайший элемент с классом `category-link`
        if (!category) return; // Если кликнули не по категории, выходим

        event.preventDefault(); // Предотвращаем стандартное поведение ссылки

        const categorySlug = category.getAttribute("data-slug"); // Получаем slug категории
        console.log(`Клик по категории: ${categorySlug}`); // Логируем клик

        if (!categorySlug) {
            console.error("Ошибка: у категории отсутствует `data-slug`.");
            return;
        }

        const url = `/categories/${categorySlug}/articles/`; // Формируем URL запроса
        console.log(`Формируем запрос по URL: ${url}`); // Логируем URL

        // Загружаем статьи по категории через AJAX
        fetch(url, {
            method: "GET",
            headers: { "X-Requested-With": "XMLHttpRequest" }
        })
        .then(response => {
            console.log(`Ответ от сервера получен. Статус: ${response.status}`);
            return response.text();
        })
        .then(html => {
            document.querySelector(".main-box").innerHTML = html; // Обновляем `.main-box` новыми статьями
            console.log("Статьи загружены в `.main-box`");
        })
        .catch(error => console.error("Ошибка загрузки категорий:", error));
    });
}

// Подключаем обработчик при загрузке страницы
document.addEventListener("DOMContentLoaded", () => {
    console.log("Подключение `setupCategoryClickHandler()`...");
    setupCategoryClickHandler();
});


/**
 * Обрабатывает клик по категории.
 * Загружает статьи в `.main-box` без перезагрузки страницы.
 * @param {Event} event - Событие клика.
 */
function categoryClickHandler(event) {
    event.preventDefault(); // Предотвращаем стандартный переход по ссылке

    const categorySlug = this.getAttribute("data-slug"); // Получаем `slug` выбранной категории
    console.log(`Клик по категории: ${categorySlug}`); // Логируем сам факт клика

    if (!categorySlug) {
        console.error("Ошибка: у категории отсутствует `data-slug`.");
        return;
    }

    const url = `/categories/${categorySlug}/articles/`; // Формируем URL для AJAX-запроса
    console.log(`Формируем запрос по URL: ${url}`); // Логируем URL, по которому отправится запрос

    // Отправляем GET-запрос через AJAX с заголовком `X-Requested-With`
    fetch(url, {
        method: "GET",
        headers: { "X-Requested-With": "XMLHttpRequest" }
    })
    .then(response => {
        console.log(`Ответ от сервера получен. Статус: ${response.status}`);
        return response.text();
    })
    .then(html => {
        document.querySelector(".main-box").innerHTML = html; // Обновляем `.main-box` новыми статьями
        setupCategoryClickHandler(); // Повторно подключаем обработчики кликов после обновления страницы
        console.log("Статьи загружены в `.main-box`");
    })
    .catch(error => console.error("Ошибка загрузки категорий:", error)); // Логируем ошибку, если не удалось загрузить статьи
}

// Подключаем обработчик при загрузке страницы
document.addEventListener("DOMContentLoaded", () => {
    console.log("Подключение `setupCategoryClickHandler()`...");
    setupCategoryClickHandler();
});
