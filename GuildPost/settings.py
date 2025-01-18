"""
/GuildPost/GuildPost/settings.py
"""

from pathlib import Path
from dotenv import load_dotenv
import os

# Загрузка переменных из .env файла
load_dotenv()

# === Базовые настройки ===
# Базовая директория проекта
BASE_DIR = Path(__file__).resolve().parent.parent

# Секретный ключ приложения (из .env)
SECRET_KEY = os.getenv('SECRET_KEY', 'default_secret_key')

# Режим отладки
DEBUG = 'True'

# Список допустимых хостов
ALLOWED_HOSTS = []  # Для разработки

# === Настройки приложений ===
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',  # Django REST Framework
    'django.contrib.sites',  # Django Allauth
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'dj_rest_auth',
    'rest_framework.authtoken',
    'accounts',  # Приложение accounts
    'debug_toolbar',  # Debug Toolbar
    'silk',  # Silk для мониторинга
    'posts',  # приложение для функционала категорий и статей
    'GuildPost',  # Добавляем проект как приложение
    'tinymce',  # Подключение TinyMCE
]

if not DEBUG:
    INSTALLED_APPS += ['sslserver']  # Подключаем sslserver для продакшена

# === Middleware ===
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',  # Безопасность
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'allauth.account.middleware.AccountMiddleware',  # Middleware для Allauth
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'debug_toolbar.middleware.DebugToolbarMiddleware',  # Middleware Debug Toolbar
    'silk.middleware.SilkyMiddleware',  # Middleware Silk
]

# === URL и маршруты ===
ROOT_URLCONF = 'GuildPost.urls'

# === Шаблоны ===
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'GuildPost' / 'templates'],  # Папка с шаблонами
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# === WSGI ===
WSGI_APPLICATION = 'GuildPost.wsgi.application'

# === База данных ===
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',  # SQLite используется по умолчанию
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# === Валидация паролей ===
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

SITE_ID = 1

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


# === Локализация ===
LANGUAGE_CODE = 'en-us'  # Язык
TIME_ZONE = 'UTC'  # Часовой пояс
USE_I18N = True  # Интернационализация
USE_TZ = True  # Использование часового пояса

# === Статические и медиа файлы ===
STATIC_URL = '/static/'
STATICFILES_DIRS = [BASE_DIR / 'static']  # Дополнительные статические файлы
STATIC_ROOT = BASE_DIR / 'staticfiles'  # Сбор статики
MEDIA_URL = '/media/'  # Медиафайлы
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')# Корневая папка для Медиафайлов

TINYMCE_DEFAULT_CONFIG = {
    "height": 300,  # Высота редактора
    "width": "100%",  # Ширина редактора
    "plugins": "image media link code table paste",  # Подключаем плагины для работы с медиа
    "toolbar": "undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | "
               "bullist numlist outdent indent | link image media | code",  # Добавляем кнопки для медиа
    "menubar": "insert",  # Включаем меню для вставки
    "file_picker_types": "file image media",  # Разрешаем выбор файлов, изображений и видео
    "automatic_uploads": True,  # Автоматическая загрузка медиа
    "image_caption": True,  # Поддержка подписей для изображений
}


DEBUG_TOOLBAR_CONFIG = {
    "SHOW_TOOLBAR_CALLBACK": lambda request: False,  # Отключаем Debug Toolbar
}


# === Rest Framework ===
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.TokenAuthentication',
    ],
}

# === Email ===
# Настройки электронной почты
# Определяем, какой бэкенд использовать для отправки email
# Если USE_CONSOLE_EMAIL_BACKEND=True в .env, будет использован консольный бэкенд
# Иначе используется SMTP
EMAIL_BACKEND = os.getenv(
    'EMAIL_BACKEND_CONSOLE' if os.getenv('USE_CONSOLE_EMAIL_BACKEND') == 'True' else 'EMAIL_BACKEND_SMTP'
)

# Хост SMTP-сервера (например, smtp.yandex.ru)
EMAIL_HOST = os.getenv('EMAIL_HOST')

# Порт SMTP-сервера (например, 465 для SSL или 587 для TLS)
EMAIL_PORT = int(os.getenv('EMAIL_PORT', 25))

# Использовать ли TLS (True/False), указывается в .env
EMAIL_USE_TLS = os.getenv('EMAIL_USE_TLS', 'False') == 'True'

# Использовать ли SSL (True/False), указывается в .env
EMAIL_USE_SSL = os.getenv('EMAIL_USE_SSL', 'False') == 'True'

# Имя пользователя для SMTP-сервера
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER')

# Пароль для SMTP-сервера
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD')

# Настройка типа приветственного письма:
# 1 - стандартное письмо с активацией
# 2 - письмо с деталями профиля
# 3 - письмо с упоминанием смены пароля
WELCOME_EMAIL_VARIANT = int(os.getenv('WELCOME_EMAIL_VARIANT', 1))

# === Debug Toolbar ===
INTERNAL_IPS = [
    '127.0.0.1',
]

# === Silk ===
SILKY_PYTHON_PROFILER = True

# === Безопасность ===
# Настройки HTTPS и безопасности
# Для работы сервера безопасности нужно запустить комманду python manage.py runsslserver
SECURE_BROWSER_XSS_FILTER = True  # Включает XSS-фильтр браузера
SECURE_CONTENT_TYPE_NOSNIFF = True  # Предотвращает подделку MIME-типов

if DEBUG:
    SECURE_SSL_REDIRECT = False  # Отключаем редирект на HTTPS в режиме разработки
else:
    SECURE_SSL_REDIRECT = True  # Включаем редирект на HTTPS в продакшене

    # HTTP Strict Transport Security (HSTS)
    SECURE_HSTS_SECONDS = 31536000  # Устанавливаем HSTS на 1 год
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True  # Распространяем HSTS на поддомены
    SECURE_HSTS_PRELOAD = True  # Включаем поддержку preload для HSTS

#  === Настройки восстановления пароля ===
RECOVERY_CODE_MAX_ATTEMPTS = 3  # Максимальное количество попыток восстановления
RECOVERY_CODE_VALIDITY_SECONDS = 900  # Время действия кода восстановления (15 минут)

# === Логирование ===
ENABLE_LOGGING = False  # Включить/выключить логирование
LOGGING_DIR = os.path.join(BASE_DIR, 'logs')  # Директория для логов
os.makedirs(LOGGING_DIR, exist_ok=True)  # Создаём папку, если её нет

if ENABLE_LOGGING:
    LOGGING = {
        'version': 1,
        'disable_existing_loggers': False,
        'formatters': {
            'verbose': {
                'format': '{levelname} {asctime} {module} {message}',
                'style': '{',
            },
            'simple': {
                'format': '{levelname} {message}',
                'style': '{',
            },
        },
        'handlers': {
            'file': {
                'level': 'ERROR',
                'class': 'logging.FileHandler',
                'filename': os.path.join(LOGGING_DIR, 'errors.log'),
                'formatter': 'verbose',
            },
            'mail_admins': {
                'level': 'ERROR',
                'class': 'django.utils.log.AdminEmailHandler',
                'formatter': 'verbose',
            },
            'console': {
                'level': 'DEBUG',
                'class': 'logging.StreamHandler',
            },
        },
        'loggers': {
            'django': {
                'handlers': ['file', 'mail_admins', 'console'],
                'level': 'ERROR',
                'propagate': True,
            },
            'accounts': {
                'handlers': ['console'],
                'level': 'DEBUG',
                'propagate': True,
            },
        },
    }
else:
    LOGGING = {
        'version': 1,
        'disable_existing_loggers': True,
    }

import os
SITE_URL = os.getenv("SITE_URL", "http://127.0.0.1:8000")  # По умолчанию локальный адрес
