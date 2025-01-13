"""
/GuildPost/accounts/signals.py
"""

from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .utils import send_activation_email, send_success_activation_email, send_recovery_email, send_password_recovery_success_email
from .models import ActivationCode, RecoveryCode
import logging

logger = logging.getLogger(__name__)


@receiver(post_save, sender=User)
def send_activation_on_user_creation(sender, instance, created, **kwargs):
    """
    Сигнал для отправки e-mail с активацией после создания нового пользователя.
    """
    if created:  # Проверяем, что пользователь создан, а не обновлён
        print(f"Сигнал созданного пользователя: {instance.email}")  # Печать для проверки
        logger.info(f"Сигнал созданного пользователя: {instance.email}")  # Логирование

        # Генерируем код активации для пользователя
        activation_code = ActivationCode.objects.create(user=instance)

        # Используем функцию send_activation_email из utils.py для отправки письма
        send_activation_email(instance, activation_code.code)

        print(f"E-mail активации отправлен на {instance.email}")  # Для отладки


@receiver(post_save, sender=User)
def send_successful_activation_email_signal(sender, instance, **kwargs):
    """
    Сигнал для отправки письма об успешной активации аккаунта.

    Срабатывает, если поле is_active изменено на True.
    """
    if instance.is_active and kwargs.get('created', False) is False:
        print(f"Сигнал активации: {instance.email}")  # Печать для проверки
        logger.info(f"Сигнал активации: {instance.email}")  # Логирование

        send_success_activation_email(instance)  # Вызываем функцию отправки письма


@receiver(post_save, sender=RecoveryCode)
def send_recovery_code_email(sender, instance, created, **kwargs):
    """
    Обработчик сигнала для отправки письма с кодом восстановления.

    Аргументы:
        sender: Модель, которая вызвала сигнал.
        instance: Экземпляр модели RecoveryCode.
        created: True, если объект был создан.
        kwargs: Дополнительные параметры.
    """
    if created:
        # Отправляем письмо с кодом восстановления
        send_recovery_email(instance.user, instance.code)


@receiver(post_save, sender=User)
def send_recovery_success_email(sender, instance, **kwargs):
    """
    Отправляет письмо об успешном восстановлении пароля.
    """
    if instance.password:  # Проверяем, был ли обновлён пароль
        send_password_recovery_success_email(instance)