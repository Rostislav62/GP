"""
/GuildPost/GuildPost/urls.py
"""
from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView

from accounts import views
from django.conf import settings
from django.conf.urls.static import static
# from posts.views import categories_view
from .views import home, get_server_time

if settings.DEBUG:
    import debug_toolbar

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', home, name='home'),  # Главная страница
    path('api/auth/', include('dj_rest_auth.urls')),  # API для входа/выхода
    path('api/auth/registration/', include('dj_rest_auth.registration.urls')),  # API для регистрации
    path('', include('accounts.urls')),  # Маршруты приложения accounts
    path('', include('posts.urls')),  # Подключаем urls из приложения posts
    path('posts/', include('posts.urls')),  # Подключение маршрутов приложения posts с префиксом 'posts/'
    path('upload-avatar/', views.upload_avatar, name='upload_avatar'),  # Маршрут для загрузки аватара
    path('__debug__/', include(debug_toolbar.urls)),  # Путь для Debug Toolbar
    path('silk/', include('silk.urls')),  # Путь для Silk
    path("api/server-time/", get_server_time, name="server_time"),

]

# Добавляем маршруты для обслуживания медиафайлов в режиме отладки
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

