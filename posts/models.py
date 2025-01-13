"""
/GuildPost/posts/models.py
"""
from django.db import models
from django.contrib.auth.models import User


class Category(models.Model):
    """
    Модель для категорий статей.
    """
    name = models.CharField(max_length=100, unique=True, verbose_name="Название категории")
    description = models.TextField(blank=True, null=True, verbose_name="Описание категории")
    slug = models.SlugField(max_length=100, unique=True, verbose_name="URL-идентификатор")
    icon = models.ImageField(upload_to="category_icons/", blank=True, null=True, verbose_name="Иконка категории")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Дата обновления")

    class Meta:
        ordering = ['name']  # Сортировка категорий по алфавиту
        verbose_name = "Категория"
        verbose_name_plural = "Категории"

    def __str__(self):
        return self.name


class Article(models.Model):
    """
    Модель для хранения статей.
    """
    title = models.CharField(max_length=255, verbose_name="Заголовок")  # Заголовок статьи
    content = models.TextField(verbose_name="Содержимое")  # Полный текст статьи
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name="articles", verbose_name="Категория")  # Категория статьи
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="articles", verbose_name="Автор")  # Автор статьи
    media_file = models.FileField(upload_to="articles/media/", blank=True, null=True, verbose_name="Медиафайл")  # Изображение или видео
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")  # Дата создания
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Дата обновления")  # Дата последнего обновления
    views_count = models.PositiveIntegerField(default=0, verbose_name="Количество просмотров")  # Количество просмотров
    likes_count = models.PositiveIntegerField(default=0, verbose_name="Количество лайков")  # Количество лайков

    class Meta:
        ordering = ["-created_at"]  # Новые статьи выше
        verbose_name = "Статья"
        verbose_name_plural = "Статьи"

    def __str__(self):
        return self.title

    def increment_views(self):
        """
        Увеличивает количество просмотров.
        """
        self.views_count += 1
        self.save()

    def increment_likes(self):
        """
        Увеличивает количество лайков.
        """
        self.likes_count += 1
        self.save()

    def get_media_type(self):
        """
        Определяет тип медиафайла (изображение или видео).
        """
        if self.media_file:
            if self.media_file.name.endswith(('.jpg', '.png')):
                return "image"
            elif self.media_file.name.endswith(('.mp4', '.mov')):
                return "video"
        return None



class Comment(models.Model):
    """     Модель для хранения комментариев к статьям.     """
    article = models.ForeignKey(Article, on_delete=models.CASCADE, related_name="comments",
                                verbose_name="Статья")  # Привязка к статье
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="comments",
                               verbose_name="Автор")  # Автор комментария
    content = models.TextField(verbose_name="Текст комментария")  # Текст комментария
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")  # Дата создания
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Дата обновления")  # Дата обновления

    class Meta:
        ordering = ["-created_at"]  # Новые комментарии выше
        verbose_name = "Комментарий"
        verbose_name_plural = "Комментарии"

    def __str__(self):
        return f"Комментарий от {self.author} для статьи {self.article}"
