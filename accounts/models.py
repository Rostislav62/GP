"""
/GuildPost/accounts/models.py
"""
from datetime import timedelta

from django.contrib.auth.models import User
from django.db import models
import uuid
from django.utils.timezone import now

from GuildPost import settings


class ActivationCode(models.Model):
    """
    Модель для хранения кодов активации.
    code: Хранит уникальный код активации.
    user: Связан с зарегистрированным пользователем.
    created_at: Указывает время создания кода.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="activation_code")
    code = models.UUIDField(default=uuid.uuid4, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Activation code for {self.user.username}"


class Profile(models.Model):
    """
    Профиль пользователя, содержащий дополнительные данные.
    """
    GENDER_CHOICES = [
        ('male', 'Мужской'),
        ('female', 'Женский'),
        ('other', 'Другой'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    full_name = models.CharField(max_length=255, blank=True, null=True)
    birth_date = models.DateField(blank=True, null=True)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, blank=True, null=True)
    avatar = models.ImageField(upload_to="avatars/", blank=True, null=True)
    subscribe = models.BooleanField(default=False)
    privacy_policy_accepted = models.BooleanField(default=False)

    def __str__(self):
        return f"Профиль пользователя {self.user.username}"

    def validate_avatar_format(self):
        """
        Проверяет формат загруженного аватара.
        """
        if self.avatar:
            valid_extensions = ['jpg', 'jpeg', 'png', 'gif']
            ext = self.avatar.name.split('.')[-1].lower()
            if ext not in valid_extensions:
                raise ValueError("Unsupported file format for avatar.")


class RecoveryCode(models.Model):
    """     Код восстановления пароля.    """
    user = models.ForeignKey(User, on_delete=models.CASCADE)  # Связь с моделью пользователя
    code = models.CharField(max_length=64, unique=True)  # Уникальный код восстановления
    created_at = models.DateTimeField(auto_now_add=True)  # Время создания кода
    expires_at = models.DateTimeField()  # Время истечения кода

    def delete_expired_codes(self):
        """         Удаляет устаревшие коды восстановления.        """
        RecoveryCode.objects.filter(expires_at__lt=now()).delete()  # Фильтруем коды с истёкшим сроком действия и удаляем их

    @staticmethod
    def get_attempts_left(user):
        """         Возвращает оставшееся количество попыток для пользователя. """

        # Фильтруем коды, созданные для пользователя за последние 30 минут
        recent_codes = RecoveryCode.objects.filter(
            user=user,  # Коды связаны с данным пользователем
            created_at__gte=now() - timedelta(minutes=30)  # Коды созданы за последние 30 минут
        )
        # Возвращаем максимальное значение записанное в settings.RECOVERY_CODE_MAX_ATTEMPTS  минус количество созданных кодов, но не меньше 0
        return max(settings.RECOVERY_CODE_MAX_ATTEMPTS - recent_codes.count(), 0)

    def is_valid(self):
        """         Проверяет, действителен ли код восстановления.         """
        return self.expires_at > now()

