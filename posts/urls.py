"""
/GuildPost/posts/urls.py
"""
from django.urls import path
from .views import categories_view, add_comment,upload_temp_media, delete_temp_media
from . import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('categories/', categories_view, name='categories'),
    path("articles/", views.article_list_view, name="article_list"),  # Список статей
    path("articles/<int:pk>/", views.article_detail_view, name="article_detail"),  # Детальная страница статьи
    path("articles/<int:pk>/add-comment/", add_comment, name="add_comment"),  # Добавление комментария
    path("articles/<int:pk>/comments/", views.all_comments, name="all_comments"),  # Страница всех комментариев
    path('ads/create/', views.create_ad, name='create_ad'),  # Маршрут для создания объявления
    path('ads/<int:pk>/edit/', views.edit_ad, name='edit_ad'),  # Маршрут для редактирования объявления
    path('ads/preview/', views.preview_ad, name='preview_ad'),  # Маршрут для предпросмотра объявления
    # path('ads/upload_media/', upload_temp_media, name='upload_temp_media'),  # Маршрут для временного сохранения медиа
    # path('ads/delete_media/', delete_temp_media, name='delete_temp_media'),  # Маршрут для удаления временного медиа
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)




