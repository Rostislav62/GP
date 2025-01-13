"""
/GuildPost/accounts/apps.py
"""

from django.apps import AppConfig


class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'accounts'

    def ready(self):
        import accounts.signals  # Импортируем сигналы для регистрации. Не удалять, требуется для работы сигналов.

