""" /GuildPost/posts/views.py """

from .forms import ArticleForm
from .models import Article, Category, Comment, User
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages  # Для уведомлений
from django.views.decorators.csrf import csrf_exempt
import os
from django.conf import settings


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

    # Получаем последний комментарий к статье который был принят
    latest_comment = article.comments.filter(status="approved").order_by('-updated_at', '-created_at').first()
    # Сначала ищем по дате редактирования, затем по дате создания

    # Передаём данные в шаблон
    return render(
        request,
        "posts/article_detail.html",
        {
            "article": article,  # Статья
            "comments": article.comments.all(),  # Все комментарии (если нужно)
            "latest_comment": latest_comment,  # Последний комментарий
        }
    )


def all_comments(request, pk):
    """Отображает все комментарии к статье, но фильтрует их в зависимости от пользователя."""

    article = get_object_or_404(Article, pk=pk)

    if request.user == article.author:
        # Автор видит все комментарии (ожидающие, одобренные и отклоненные)
        comments = article.comments.all().order_by("-created_at")
    else:
        # Обычные пользователи видят только одобренные комментарии
        comments = article.comments.filter(status="approved").order_by("-created_at")

    return render(request, "posts/comments.html", {"article": article, "comments": comments})





def add_comment(request, pk):
    """Добавляет новый отклик (комментарий) к статье. Сначала он остается на проверке."""
    if request.method == "POST":
        article = get_object_or_404(Article, pk=pk)
        content = request.POST.get("comment")

        if content:
            comment = Comment.objects.create(article=article, author=request.user, content=content, status="pending")
            # Отправляем email автору отклика о проверке
            comment.author.email_user("Ваш отклик отправлен на проверку", f"Ваш отклик на статью '{article.title}' ждет подтверждения.")

        return redirect("article_detail", pk=pk)

    return JsonResponse({"error": "Метод запроса должен быть POST."}, status=400)


@login_required
def my_responses(request):
    """Страница со всеми откликами на статьи текущего пользователя."""

    try:
        # Получаем все статьи текущего пользователя
        articles = Article.objects.filter(author=request.user).prefetch_related("comments")

        # Получаем выбранную статью из параметров запроса
        selected_article = request.GET.get("article")
        status_filter = request.GET.get("status")

        # Получаем все комментарии, относящиеся к статьям пользователя
        comments = Comment.objects.filter(article__author=request.user)

        # Применяем фильтры, если указаны
        if selected_article:
            comments = comments.filter(article_id=selected_article)

        if status_filter:
            comments = comments.filter(status=status_filter)

        # Отправляем данные в шаблон
        return render(request, "posts/my_responses.html", {
            "articles": articles,
            "comments": comments,
        })

    except Exception as e:
        # Логируем ошибку и отправляем ответ с кодом 500
        print(f"Ошибка в my_responses: {e}")
        return JsonResponse({"error": "Ошибка сервера"}, status=500)


@csrf_exempt  # Отключаем CSRF-защиту, так как AJAX-запросы передают CSRF-токен вручную
@login_required  # Требуется аутентификация пользователя
def approve_comment(request, comment_id):
    """
    Принимает отклик (комментарий) и делает его видимым в статье.
    """
    if request.method == "POST":  # Проверяем, что запрос именно POST
        try:
            # Получаем комментарий по ID, но только если пользователь является автором статьи
            comment = get_object_or_404(Comment, pk=comment_id, article__author=request.user)
            comment.approve()  # Вызываем метод модели для изменения статуса
            return JsonResponse({"success": True})  # Возвращаем JSON-ответ
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)  # В случае ошибки возвращаем 500 и её описание
    return JsonResponse({"error": "Метод запроса должен быть POST."}, status=400)  # Если не POST, возвращаем ошибку 400


@csrf_exempt
@login_required
def reject_comment(request, comment_id):
    """
    Отклоняет отклик (комментарий) и записывает причину отклонения.
    """
    if request.method == "POST":
        try:
            comment = get_object_or_404(Comment, pk=comment_id, article__author=request.user)

            # Читаем данные из запроса
            import json
            data = json.loads(request.body)
            reason = data.get("reason", "").strip()

            if not reason:
                return JsonResponse({"error": "Причина отклонения обязательна"}, status=400)

            comment.reject()  # Отклоняем комментарий
            comment.rejection_reason = reason  # Записываем причину
            comment.save()

            # Отправляем письмо с указанием причины
            subject = "Ваш комментарий отклонен"
            message = f"Ваш комментарий к статье '{comment.article.title}' был отклонен по следующей причине:\n\n{reason}"
            comment.author.email_user(subject, message)

            return JsonResponse({"success": True})  # Возвращаем успешный ответ
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Метод запроса должен быть POST."}, status=400)



@csrf_exempt
@login_required
def delete_comment(request, comment_id):
    """
    Позволяет автору отклика удалить его, если он еще не рассмотрен.
    """
    if request.method == "POST":  # Проверяем, что запрос именно POST
        try:
            # Проверяем, что пользователь — автор комментария и комментарий ещё не был рассмотрен
            comment = get_object_or_404(Comment, pk=comment_id, author=request.user, status="pending")
            comment.delete()  # Удаляем комментарий из базы данных
            return JsonResponse({"success": True})  # Возвращаем успешный ответ
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)  # В случае ошибки возвращаем 500 и описание
    return JsonResponse({"error": "Метод запроса должен быть POST."}, status=400)  # Если не POST, возвращаем ошибку 400




# Обработчик для создания объявления
@login_required
def create_ad(request):
    """
    Обработчик для создания объявления.
    Обрабатывает данные из формы и сохраняет объект в базу данных.
    """
    if request.method == "POST":
        # Используем форму для обработки данных
        form = ArticleForm(request.POST, request.FILES)  # Получаем данные из формы, включая файлы

        # Проверяем валидность формы
        if form.is_valid():
            article = form.save(commit=False)  # Создаём объект, но не сохраняем в базу данных сразу
            article.author = request.user  # Устанавливаем автора как текущего пользователя
            article.save()  # Сохраняем объект в базу данных

            # Устанавливаем сообщение об успешном создании
            messages.success(request, f"Объявление '{article.title}' успешно сохранено!")
            return redirect("home")  # Перенаправляем на главную страницу

        # Если форма не валидна, возвращаем ошибки
        return JsonResponse({"error": "Данные формы некорректны", "details": form.errors}, status=400)

    # GET-запрос: возвращаем форму
    form = ArticleForm()  # Создаём пустую форму
    categories = Category.objects.all()  # Получаем список категорий для выбора
    return render(request, "posts/ad_form.html", {"form": form, "categories": categories})  # Возвращаем HTML-форму




# Обработчик для редактирования объявления
@login_required
def edit_ad(request, pk):
    """
    Обработчик для редактирования объявления.
    Загружает форму редактирования с данными текущей статьи.
    """
    article = get_object_or_404(Article, pk=pk)  # Получаем статью по ID

    # Если запрос GET, рендерим форму редактирования с заполненными данными
    if request.method == "GET":
        categories = Category.objects.all()  # Получаем все категории для выбора
        return render(request, "posts/ad_form.html", {
            "article": article,
            "categories": categories,
        })

    # Если запрос POST, сохраняем изменения
    if request.method == "POST":
        article.title = request.POST.get("title")
        article.content = request.POST.get("content")
        category_id = request.POST.get("category")
        article.category = get_object_or_404(Category, pk=category_id)
        media_file = request.FILES.get("media_file")

        if media_file:
            article.media_file = media_file  # Обновляем медиафайл, если загружен новый

        article.save()  # Сохраняем изменения
        messages.success(request, f"Объявление '{article.title}' успешно обновлено!")
        return redirect("article_detail", pk=article.pk)  # Перенаправляем на страницу статьи


@login_required
def preview_ad(request):
    if request.method == "POST":
        title = request.POST.get("title")
        content = request.POST.get("content")
        category_id = request.POST.get("category")

        # Проверка обязательных данных
        if not title or not content or not category_id:
            return JsonResponse({"error": "Все поля обязательны"}, status=400)

        category = get_object_or_404(Category, pk=category_id)

        # Передаём данные в шаблон предпросмотра
        return render(request, "posts/ad_preview.html", {
            "title": title,
            "content": content,
            "category": category,
        })

    return JsonResponse({"error": "Метод не поддерживается"}, status=400)

@login_required  # Только авторизованные пользователи могут удалять статьи
@csrf_exempt  # Разрешаем удаление через AJAX (CSRF-токен передаётся в JS)
def delete_article(request, pk):
    """
    Удаляет статью, если пользователь является её автором.
    """
    article = get_object_or_404(Article, pk=pk)

    # Проверяем, является ли пользователь автором статьи
    if request.user != article.author:
        return JsonResponse({"error": "Вы не автор этой статьи"}, status=403)

    # Удаляем статью
    article.delete()
    return JsonResponse({"message": "Статья успешно удалена"}, status=200)


def search_articles_view(request):
    """
    Представление для обработки поиска статей по критериям.
    """
    # Получаем параметры из запроса
    author_id = request.GET.get('author')
    title = request.GET.get('title')
    date_from = request.GET.get('date_from')
    date_to = request.GET.get('date_to')
    content = request.GET.get('content')

    # Фильтруем статьи
    articles = Article.objects.all()

    if author_id:
        articles = articles.filter(author_id=author_id)  # Фильтр по автору

    if title:
        articles = articles.filter(title__icontains=title)  # Фильтр по названию

    if date_from:
        articles = articles.filter(created_at__gte=date_from)  # Фильтр по начальной дате

    if date_to:
        articles = articles.filter(created_at__lte=date_to)  # Фильтр по конечной дате

    if content:
        articles = articles.filter(content__icontains=content)  # Фильтр по содержимому

    # Возвращаем отфильтрованные статьи в шаблон article_list.html
    return render(request, 'posts/article_list.html', {'articles': articles})


def search_form_view(request):
    """
    Представление для отображения формы поиска.
    """
    authors = User.objects.all()  # Получаем всех авторов
    return render(request, 'posts/search_form.html', {'authors': authors})


def upload_file(request):
    if request.method == 'POST' and request.FILES.get('file'):
        file = request.FILES['file']
        file_path = os.path.join(settings.MEDIA_ROOT, file.name)

        with open(file_path, 'wb+') as destination:
            for chunk in file.chunks():
                destination.write(chunk)

        return JsonResponse({'location': f'{settings.MEDIA_URL}{file.name}'})

    return JsonResponse({'error': 'Загрузка не удалась'}, status=400)


@csrf_exempt  # Отключаем CSRF-защиту, так как AJAX-запросы передают CSRF-токен вручную
@login_required  # Требуется аутентификация пользователя
def edit_comment(request, comment_id):
    """
    Позволяет автору редактировать свой комментарий, если он еще не был рассмотрен.
    """
    if request.method == "POST":
        try:
            # Получаем комментарий только если пользователь является его автором и статус "pending"
            comment = get_object_or_404(Comment, pk=comment_id, author=request.user, status="pending")

            # Читаем новый текст из JSON-запроса
            import json
            data = json.loads(request.body)
            new_content = data.get("content", "").strip()

            if new_content:
                comment.content = new_content  # Обновляем текст комментария
                comment.save()  # Сохраняем изменения
                return JsonResponse({"success": True, "new_content": new_content})  # Возвращаем обновленный текст
            else:
                return JsonResponse({"error": "Текст комментария не может быть пустым"}, status=400)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Метод запроса должен быть POST."}, status=400)


def articles_by_category_view(request, slug):
    """
    Фильтрует статьи по выбранной категории и передает их в шаблон.
    Логирует запросы для отладки.
    """
    print(f"Получен запрос для категории: {slug}")  # Логируем входящий запрос

    category = get_object_or_404(Category, slug=slug)
    articles = Article.objects.filter(category=category).select_related('author').order_by('-created_at')

    print(f"Найдено статей: {articles.count()}")  # Логируем количество найденных статей

    if request.headers.get("X-Requested-With") == "XMLHttpRequest":
        print("Обнаружен AJAX-запрос, рендерим `article_list.html`")
        return render(request, "posts/article_list.html", {"articles": articles, "selected_category": category})

    print("Обычный запрос, рендерим `home.html`")
    return render(request, "home.html", {"articles": articles, "selected_category": category})
