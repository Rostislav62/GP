"""
/GuildPost/accounts/utils.py
"""
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.core.mail import EmailMessage  # Импортируем класс EmailMessage для отправки HTML-писем

def send_activation_email(user, activation_code):
    """
    Отправляет HTML-письмо с активацией аккаунта.

    Аргументы:
        user: Объект пользователя, которому отправляется письмо.
        activation_code: Код активации, который будет использован для подтверждения аккаунта.

    Исключения:
        ValueError: Если значение WELCOME_EMAIL_VARIANT некорректно.
        RuntimeError: Если возникает ошибка при отправке письма.
    """
    # Преобразуем WELCOME_EMAIL_VARIANT из настроек в целое число
    try:
        email_variant = int(settings.WELCOME_EMAIL_VARIANT)
    except (AttributeError, ValueError):
        raise ValueError("Настройка WELCOME_EMAIL_VARIANT должна быть целым числом (1, 2 или 3).")

    # Контекст, передаваемый в шаблоны писем
    context = {
        'user': user,  # Пользователь, которому отправляется письмо
        'activation_code': activation_code,  # Код активации
        # 'activation_url': f"http://127.0.0.1:8000/activate/?code={activation_code}"  # URL для активации

        # Формируем глобальный URL, используя домен из настроек
        'activation_url': f"{settings.SITE_URL}/activate/?code={activation_code}"  # Убедитесь, что SITE_URL настроен в settings.py

    }

    # Определяем тему письма и используемый шаблон
    if email_variant == 1:
        subject = "Активируйте ваш аккаунт"
        template_name = 'emails/activation_basic.html'
    elif email_variant == 2:
        subject = "Детали вашего профиля и активация аккаунта"
        template_name = 'emails/activation_detailed.html'
    elif email_variant == 3:
        subject = "Активация аккаунта и смена пароля"
        template_name = 'emails/activation_password_reset.html'
    else:
        raise ValueError("Неверное значение WELCOME_EMAIL_VARIANT. Допустимые значения: 1, 2 или 3.")

    # Генерируем содержимое письма с использованием шаблона
    try:
        message = render_to_string(template_name, context)
    except Exception as e:
        raise RuntimeError(f"Ошибка при рендеринге шаблона {template_name}: {e}")

    # Отправка письма с помощью EmailMessage
    try:
        email = EmailMessage(
            subject=subject,  # Тема письма
            body=message,  # Содержимое письма в формате HTML
            from_email=settings.EMAIL_HOST_USER,  # Адрес отправителя (указан в настройках)
            to=[user.email],  # Список получателей (в данном случае только 1 e-mail)
        )
        email.content_subtype = "html"  # Указываем, что содержимое письма — HTML
        email.send(fail_silently=False)  # Отправляем письмо
    except Exception as e:
        raise RuntimeError(f"Ошибка при отправке письма на адрес {user.email}: {e}")


def send_success_activation_email(user):
    """
    Отправляет письмо об успешной активации аккаунта.

    Аргументы:
        user: Объект пользователя, который активировал аккаунт.
    """
    subject = "Ваш аккаунт активирован"  # Тема письма
    context = {
        'user': user,  # Пользователь, который активировал аккаунт
    }
    # Генерация сообщения на основе шаблона
    message = render_to_string('emails/success_activation.html', context)
    # Отправка письма
    send_mail(
        subject,
        message,
        settings.EMAIL_HOST_USER,
        [user.email],
        fail_silently=False,
    )


def send_recovery_email(user, recovery_code):
    """
    Отправляет письмо с кодом восстановления пароля.

    Аргументы:
        user: Объект пользователя, которому отправляется письмо.
        recovery_code: Код восстановления пароля.
    """
    # Формируем контекст для письма
    context = {
        'user': user,  # Пользователь, которому отправляется письмо
        'recovery_code': recovery_code,  # Код восстановления пароля
    }

    # Генерация содержимого письма
    subject = "Password Recovery Code"  # Тема письма
    message = render_to_string('emails/password_recovery.html', context)  # Шаблон письма

    # Отправка письма
    send_mail(
        subject,  # Тема
        message,  # Содержимое
        settings.EMAIL_HOST_USER,  # Отправитель
        [user.email],  # Получатель
        fail_silently=False,  # Логировать ошибки
    )


def send_password_recovery_success_email(user):
    """
    Отправляет письмо об успешном восстановлении пароля.

    Аргументы:
        user: Объект пользователя, которому отправляется письмо.
    """
    subject = "Password Recovery Successful"  # Тема письма
    context = {
        'user': user,  # Передаём объект пользователя
    }
    message = render_to_string('emails/password_recovery_success.html', context)  # Рендерим шаблон
    send_mail(
        subject,  # Тема письма
        message,  # Содержимое письма
        settings.EMAIL_HOST_USER,  # Отправитель
        [user.email],  # Получатель
        fail_silently=False,  # Поднять исключение при ошибке
    )
