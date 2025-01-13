"""
/GuildPost/posts/admin.py
"""
from django.contrib import admin
from .models import Category, Article, Comment
from django.contrib import admin
from GuildPost.models import MenuItem, WelcomeBox


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    """
    Админ-панель для категорий.
    """
    list_display = ("name", "slug", "created_at", "updated_at")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    """ Настройка отображения модели Article в админке.   """
    list_display = (  # Список полей, отображаемых в списке статей
        "title",  # Заголовок статьи
        "content",  # Содержимое статьи
        "category",  # Категория
        "author",  # Автор статьи
        "created_at",  # Дата создания
        "updated_at",  # Дата последнего обновления
        "views_count",  # Количество просмотров
        "likes_count",  # Количество лайков
        "media_file",  # Медиафайл
    )
    list_filter = ("category", "author", "created_at")  # Фильтры по категориям, автору и дате создания
    search_fields = ("title", "content")  # Поля для поиска
    readonly_fields = ("created_at", "updated_at")  # Поля, которые нельзя редактировать


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ("article", "author", "created_at")
    list_filter = ("article", "author", "created_at")
    search_fields = ("content",)


@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display = ('name', 'link', 'icon', 'order')  # Поля, отображаемые в списке
    list_editable = ('link', 'icon', 'order')  # Поля, которые можно редактировать в списке
    ordering = ('order',)  # Сортировка по полю "order"


@admin.register(WelcomeBox)
class WelcomeBoxAdmin(admin.ModelAdmin):
    """
    Регистрация модели WelcomeBox в админке.
    """
    list_display = ('title',)  # Отображаем заголовок в списке объектов
    search_fields = ('title',)  # Добавляем поиск по заголовку
