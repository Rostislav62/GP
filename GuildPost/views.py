# /GuildPost/posts/views.py
from GuildPost.models import MenuItem, WelcomeBox
from django.shortcuts import render
from django.http import JsonResponse
from datetime import datetime
import pytz  # Для работы с часовыми поясами


def home(request):
    """     Представление для главной страницы. Загружает пункты меню и данные приветственного блока.     """
    menu_items = MenuItem.objects.all()  # Получаем пункты меню из базы данных
    welcome_box = WelcomeBox.objects.first()  # Получаем первый объект приветственного блока
    return render(request, "home.html",
                  {"menu_items": menu_items, "welcome_box": welcome_box})  # Передаём данные в шаблон




def get_server_time(request):
    """API для получения текущего времени и часового пояса сервера."""
    try:
        server_timezone = pytz.timezone("UTC")  # Укажите актуальный часовой пояс сервера
        server_time = datetime.now(server_timezone)
        return JsonResponse({
            "server_time": server_time.isoformat(),
            "server_timezone": server_timezone.zone  # Корректное название часового пояса
        })
    except Exception as e:
        return JsonResponse({
            "error": "Не удалось получить время сервера",
            "details": str(e)
        }, status=500)
