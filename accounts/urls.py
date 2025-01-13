"""
/GuildPost/accounts/settings.py
"""
from django.urls import path
from . import views
from django.conf import settings
from django.conf.urls.static import static
from .views import profile_view

urlpatterns = [
    # path('', views.home, name='home'),  # Главная страница
    path('login/', views.login_view, name='login'),  # Путь для авторизации
    path('logout/', views.logout_view, name='logout'),  # Путь для логаута
    path('register/', views.register_view, name='register'),  # Регистрация
    path('activate/', views.activate_account, name='activate'),  # Активация
    path('recovery-password/', views.recovery_password, name='recovery_password'),
    path('password-recovery-request/', views.password_recovery_request, name='password_recovery_request'),
    path('password-recovery-code/', views.password_recovery_code, name='password_recovery_code'),
    path('password-change/', views.password_change, name='password_change'),
    path('password-restored/', views.password_restored, name='password_restored'),
    path('login_error/', views.login_error, name='login_error'),
    path('clear-login-error/', views.clear_login_error, name='clear_login_error'),
    path('test-error/', views.test_error_view, name='test_error'),
    path('profile/', profile_view, name='profile'),  # Маршрут для профиля пользователя
]

# Добавляем маршруты для обслуживания медиафайлов в режиме отладки
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)