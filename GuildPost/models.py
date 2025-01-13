# /GuildPost/GuildPost/models.py
from django.db import models

class MenuItem(models.Model):
    """
    Модель для пунктов меню.
    """
    name = models.CharField(max_length=255, verbose_name="Название")  # Название пункта меню
    link = models.CharField(max_length=255, verbose_name="Ссылка", blank=True)  # Ссылка или действие
    icon = models.CharField(max_length=50, verbose_name="Иконка", blank=True)  # Иконка для пункта меню
    order = models.PositiveIntegerField(default=0, verbose_name="Порядок отображения")  # Порядок отображения

    class Meta:
        ordering = ["order"]  # Сортировка по полю "order"
        verbose_name = "Пункт меню"
        verbose_name_plural = "Пункты меню"

    def __str__(self):
        return self.name


class WelcomeBox(models.Model):
    """
    Модель для приветственного блока.
    """
    title = models.CharField(max_length=255, verbose_name="Заголовок")  # Заголовок блока
    description = models.TextField(verbose_name="Описание", blank=True)  # Описание или дополнительный текст

    class Meta:
        verbose_name = "Приветственный блок"
        verbose_name_plural = "Приветственные блоки"

    def __str__(self):
        return self.title  # Отображение заголовка в админке
