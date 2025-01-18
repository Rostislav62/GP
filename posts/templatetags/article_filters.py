# /GuildPost/posts/templatetags/article_filters.py

from django import template
from bs4 import BeautifulSoup

register = template.Library()


@register.filter
def truncate_html_words(value, word_limit=20):
    """
    Обрезает HTML-контент, оставляя только первые `word_limit` слов.
    """
    soup = BeautifulSoup(value, "html.parser")  # Разбираем HTML-контент
    words = []

    for element in soup.find_all(text=True, recursive=True):  # Проходим по всем текстовым узлам
        words.extend(element.split())  # Разделяем текст на слова
        if len(words) >= word_limit:  # Если достигли лимита слов
            break

    truncated_text = " ".join(words[:word_limit])  # Берём только нужное количество слов

    return truncated_text  # Возвращаем текст без HTML-тегов


@register.filter
def extract_first_media(value):
    """
    Извлекает первое изображение (<img>), видео (<video>) или iframe (<iframe>) из HTML-контента.
    """
    soup = BeautifulSoup(value, "html.parser")  # Разбираем HTML-контент
    media = soup.find(["img", "video", "iframe"])  # Ищем первое медиа

    if media:
        return str(media)  # Возвращаем найденный HTML-тег как строку

    return ""  # Если медиа не найдено, возвращаем пустую строку
