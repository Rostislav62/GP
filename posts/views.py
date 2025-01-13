"""
/GuildPost/posts/views.py
"""
from .models import Article, Category, Comment
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages  # Для уведомлений
from django.views.decorators.csrf import csrf_exempt
import os
from django.conf import settings
from django.core.files.storage import FileSystemStorage
from shutil import move


def categories_view(request):
    """
    Представление для отображения категорий.
    """
    categories = Category.objects.all()
    return render(request, "categories.html", {"categories": categories})


def article_list_view(request):
    """
    Представление для отображения списка статей.
    """
    articles = Article.objects.select_related('author', 'category').prefetch_related('comments').order_by('-created_at')
    for article in articles:
        if article.media_file:
            if article.media_file.url.endswith(('.jpg', '.png')):
                article.media_type = 'image'
            elif article.media_file.url.endswith(('.mp4', '.mov')):
                article.media_type = 'video'
            else:
                article.media_type = None
        else:
            article.media_type = None
    return render(request, 'posts/article_list.html', {'articles': articles})


def article_detail_view(request, pk):
    """
    Представление для отображения детальной информации о статье.
    """
    # Получаем статью с предварительной загрузкой связанных данных
    article = get_object_or_404(
        Article.objects.select_related("author", "category"), pk=pk
    )

    # Увеличиваем счётчик просмотров статьи
    article.increment_views()

    # Определяем тип медиафайла, если он есть
    media_type = None
    if article.media_file:
        if article.media_file.url.endswith(('.jpg', '.png')):
            media_type = 'image'
        elif article.media_file.url.endswith(('.mp4', '.mov')):
            media_type = 'video'

    # Получаем последний комментарий к статье
    latest_comment = article.comments.order_by(
        '-updated_at', '-created_at'
    ).first()  # Сначала ищем по дате редактирования, затем по дате создания

    # Передаём данные в шаблон
    return render(
        request,
        "posts/article_detail.html",
        {
            "article": article,  # Статья
            "comments": article.comments.all(),  # Все комментарии (если нужно)
            "latest_comment": latest_comment,  # Последний комментарий
            "media_type": media_type,  # Тип медиафайла (если есть)
        }
    )


def all_comments(request, pk):
    """     Представление для отображения всех комментариев к статье.     """
    # Получаем статью
    article = get_object_or_404(Article, pk=pk)

    # Получаем все комментарии, связанные со статьёй
    comments = article.comments.all()

    # Передаём данные в шаблон
    return render(
        request,
        "posts/comments.html",
        {
            "article": article,  # Статья, к которой относятся комментарии
            "comments": comments,  # Список всех комментариев
        }
    )



def add_comment(request, pk):
    if request.method == "POST":
        article = get_object_or_404(Article, pk=pk)
        content = request.POST.get("comment")

        if content:
            Comment.objects.create(article=article, author=request.user, content=content)

        # Проверяем, это AJAX-запрос?
        if request.headers.get("x-requested-with") == "XMLHttpRequest":
            comments = article.comments.all()
            media_type = None
            if article.media_file:
                if article.media_file.url.endswith(('.jpg', '.png')):
                    media_type = 'image'
                elif article.media_file.url.endswith(('.mp4', '.mov')):
                    media_type = 'video'

            return render(request, "posts/article_detail.html", {
                "article": article,
                "comments": comments,
                "media_type": media_type,
            })

        # В случае обычного запроса перенаправляем
        return redirect("article_detail", pk=pk)
    return JsonResponse({"error": "Метод запроса должен быть POST."}, status=400)


# Обработчик для создания объявления
@login_required
def create_ad(request):
    """
    Обработчик для создания объявления.
    Обрабатывает данные из формы и сохраняет объект в базу данных.
    """
    if request.method == "POST":
        # Получаем данные из формы
        title = request.POST.get("title")  # Заголовок объявления
        content = request.POST.get("content")  # Содержание объявления
        category_id = request.POST.get("category")  # ID категории
        media_file = request.FILES.get("media_file")  # Медиафайл, переданный напрямую

        # Проверяем обязательные поля
        if not title or not content or not category_id:
            return JsonResponse({"error": "Все поля обязательны"}, status=400)

        # Проверяем существование категории
        category = get_object_or_404(Category, pk=category_id)

        # Проверяем размер файла, если он загружается напрямую
        if media_file and media_file.size > 5 * 1024 * 1024:  # 5 МБ
            return JsonResponse({"error": "Файл слишком большой (максимум 5 МБ)"}, status=400)

        # Создаём объявление
        media_file_path = request.POST.get("media_url")  # Получаем путь файла из POST
        media_file = request.FILES.get("media_file")  # Получаем файл из FILES
        
        # Преобразуем полный путь в относительный, если используется media_url
        if media_file_path and media_file_path.startswith(settings.MEDIA_URL):
            media_file_path = media_file_path[len(settings.MEDIA_URL):]

        # Создаём объявление
        article = Article.objects.create(
            title=title,
            content=content,
            category=category,
            author=request.user,
            media_file=media_file if media_file else media_file_path,  # Сохраняем файл или путь
        )

        # Устанавливаем сообщение об успешном создании
        messages.success(request, f"Объявление '{article.title}' успешно сохранено!")
        return redirect("home")  # Перенаправляем на главную страницу

    # GET-запрос: возвращаем форму
    categories = Category.objects.all()  # Получаем список категорий для выбора
    return render(request, "posts/ad_form.html", {"categories": categories})  # Возвращаем HTML-форму




# Обработчик для редактирования объявления
@login_required
def edit_ad(request, pk):
    # Получаем статью по ID и проверяем автора
    article = get_object_or_404(Article, pk=pk, author=request.user)

    if request.method == "POST":  # Проверка на POST-запрос
        # Обновляем поля статьи
        article.title = request.POST.get("title")
        article.content = request.POST.get("content")
        category_id = request.POST.get("category")
        article.category = get_object_or_404(Category, pk=category_id)
        if "media_file" in request.FILES:
            article.media_file = request.FILES["media_file"]
        article.save()  # Сохраняем изменения
        return JsonResponse({"message": "Объявление обновлено успешно!"})  # Ответ в формате JSON

    # Для GET-запроса возвращаем форму с данными статьи
    categories = Category.objects.all()
    return render(request, "posts/ad_form.html", {"article": article, "categories": categories})


# Обработчик для предпросмотра объявления
@login_required
def preview_ad(request):
    if request.method == "POST":
        print("POST данные:", request.POST)  # Логируем данные POST-запроса
        print("FILES данные:", request.FILES)  # Логируем файлы
        title = request.POST.get("title")
        content = request.POST.get("content")
        category_id = request.POST.get("category")
        media_file = request.FILES.get("media_file")  # Получаем файл из запроса

        # Проверка обязательных данных
        if not title or not content or not category_id:
            return JsonResponse({"error": "Все поля обязательны"}, status=400)

        category = get_object_or_404(Category, pk=category_id)

        # Сохраняем медиафайл во временную папку, если он передан
        media_type = None
        media_url = None
        if media_file:
            fs = FileSystemStorage(location=os.path.join(settings.MEDIA_ROOT, 'articles/media'))
            filename = fs.save(media_file.name, media_file)  # Сохраняем файл в нужной директории
            media_url = f"{settings.MEDIA_URL}articles/media/{filename}"  # Формируем правильный URL

            # Определяем тип файла
            if filename.lower().endswith(('.jpg', '.png')):
                media_type = 'image'
            elif filename.lower().endswith(('.mp4', '.mov')):
                media_type = 'video'

        # Передаём данные в шаблон предпросмотра
        return render(request, "posts/ad_preview.html", {
            "title": title,
            "content": content,
            "category": category,
            "media_url": media_url,
            "media_type": media_type,
        })

    return JsonResponse({"error": "Метод не поддерживается"}, status=400)


@csrf_exempt
@login_required
def upload_temp_media(request):
    """
    Эндпоинт для загрузки временных медиафайлов.
    """
    if request.method == "POST" and request.FILES.get("file"):
        file = request.FILES["file"]
        fs = FileSystemStorage(location=settings.TEMP_MEDIA_ROOT)  # Указан путь для временных файлов
        filename = fs.save(file.name, file)
        file_url = os.path.join(settings.MEDIA_URL, 'articles/media/tmp/', filename)
        return JsonResponse({"file_url": file_url, "file_name": filename}, status=200)
    return JsonResponse({"error": "Ошибка загрузки файла"}, status=400)


@csrf_exempt
@login_required
def delete_temp_media(request):
    """
    Эндпоинт для удаления временных медиафайлов.
    """
    if request.method == "POST":
        file_name = request.POST.get("file_name")
        if not file_name:
            return JsonResponse({"error": "Имя файла не указано"}, status=400)

        file_path = os.path.join(settings.TEMP_MEDIA_ROOT, file_name)
        if os.path.exists(file_path):
            os.remove(file_path)
            return JsonResponse({"message": "Файл успешно удалён"}, status=200)
        return JsonResponse({"error": "Файл не найден"}, status=404)

    return JsonResponse({"error": "Неверный метод запроса"}, status=400)
